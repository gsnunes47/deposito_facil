# Numeração sequencial de vendas

## Objetivo

Adicionar um número comercial sequencial para as vendas, independente do
`id` técnico global. Cada tenant terá sua própria sequência:

| ID técnico | Tenant | Número comercial |
| ---: | ---: | ---: |
| 48 | 2 | 1 |
| 49 | 2 | 2 |
| 50 | 5 | 1 |
| 51 | 2 | 3 |

O `id` continuará sendo usado nas rotas, relacionamentos, pagamentos,
quitação e exclusão. O campo `numero` será apresentado ao usuário.

## Plano de implementação

### 1. Criar a sequência por tenant

Adicionar uma tabela dedicada:

```prisma
model SequenciaVenda {
  tenant_id      Int     @id
  proximo_numero Int     @default(1)
  tenant         Tenants @relation(fields: [tenant_id], references: [id])
}
```

Adicionar a relação correspondente em `Tenants`. Ao criar um tenant novo,
criar também sua `SequenciaVenda`, preferencialmente na mesma transação.

### 2. Adicionar o número à venda

```prisma
model Venda {
  id        Int @id @default(autoincrement())
  tenant_id Int
  numero    Int

  // demais campos...

  @@unique([tenant_id, numero])
}
```

`Venda` não referencia `SequenciaVenda`: a sequência é um gerador, não a
identidade da venda. A constraint composta permite o mesmo número em tenants
diferentes e impede repetição dentro de um tenant.

### 3. Migrar os dados existentes

A migration deverá:

1. Adicionar `Venda.numero` inicialmente como opcional.
2. Separar as vendas existentes por `tenant_id`.
3. Ordenar cada grupo por `data` e depois por `id`.
4. Numerar as vendas de cada tenant começando em 1.
5. Criar `SequenciaVenda` para os tenants existentes.
6. Definir `proximo_numero` como `MAX(numero) + 1`.
7. Criar a constraint única `(tenant_id, numero)`.
8. Em uma segunda implantação, após validação, tornar `numero` obrigatório.

A implantação em duas etapas permite voltar temporariamente ao código anterior
sem impedir a criação de vendas. Antes da segunda migration, a consulta abaixo
deve retornar zero:

```sql
SELECT COUNT(*) FROM "Venda" WHERE "numero" IS NULL;
```

### 4. Manter as validações nas camadas corretas

O controller validará o formato do payload: IDs numéricos, lista de produtos,
quantidades, valores em centavos e data. O tenant continuará vindo
exclusivamente de `request.user.tenantId`.

O domain validará dados persistidos:

- cliente existente e pertencente ao tenant;
- produtos existentes e pertencentes ao tenant;
- estrutura dos itens;
- tratamento explícito de produtos repetidos.

Estoque negativo é permitido. Não deve existir validação de saldo suficiente.

### 5. Tornar a criação uma operação atômica

Sequência, estoque e venda devem usar a mesma transação:

```text
Iniciar transação
  → validar cliente
  → buscar e validar produtos
  → reservar o próximo número
  → decrementar os estoques
  → criar a venda
  → confirmar a transação
```

Qualquer erro causará rollback de todas as etapas. Uma falha não criará a
venda, não alterará estoque e não consumirá o número.

Todas as operações precisam usar o cliente `tx`:

```ts
await prisma.$transaction(async (tx) => {
  await tx.cliente.findFirst(...);
  await tx.produto.findMany(...);
  await tx.sequenciaVenda.update(...);
  await tx.produto.update(...);
  await tx.venda.create(...);
});
```

Métodos que usam o `prisma` global ficam fora da transação, mesmo quando
chamados dentro do callback. Para este fluxo, as operações transacionais devem
permanecer no `VendaDomain` ou receber `tx` explicitamente.

### 6. Atualizar estoque com decremento atômico

Não ler a quantidade, calcular em JavaScript e gravar o resultado. Duas vendas
simultâneas poderiam sobrescrever uma à outra. Usar:

```ts
await tx.produto.update({
  where: { id: produtoId },
  data: {
    quantidade: {
      decrement: quantidadeVendida,
    },
  },
});
```

Com estoque inicial 5 e vendas simultâneas de 4 e 3, o saldo correto será -2.

### 7. Reservar o número atomicamente

Não usar `count + 1` nem `max(numero) + 1` durante a criação. A linha da
sequência deve ser incrementada atomicamente dentro da transação:

```ts
const sequencia = await tx.sequenciaVenda.update({
  where: { tenant_id: tenantId },
  data: {
    proximo_numero: {
      increment: 1,
    },
  },
  select: {
    proximo_numero: true,
  },
});

const numeroVenda = sequencia.proximo_numero - 1;
```

A criação deve tratar defensivamente tenants antigos sem sequência. A
constraint `(tenant_id, numero)` será uma segunda proteção.

### 8. Não reutilizar números

Excluir a venda nº 10 não altera a sequência; a próxima será a nº 11. Um erro
antes do commit não consome o número, pois a alteração da sequência participa
da mesma transação.

### 9. Atualizar API e frontend

A criação deverá retornar:

```json
{
  "message": "Venda criada com sucesso",
  "venda_id": 50,
  "numero": 1
}
```

As listagens abertas e fechadas incluirão `numero`. O
`RegistroVendaCard` exibirá `Venda nº {venda.numero}`. O frontend não
calculará nem deduzirá a sequência.

### 10. Testes

Cobrir:

- primeira venda de cada tenant recebe nº 1;
- tenants diferentes podem ter venda nº 1;
- vendas consecutivas incrementam a sequência;
- exclusão não reutiliza número;
- rollback não consome número nem altera estoque;
- criações simultâneas recebem números diferentes;
- cliente e produto de outro tenant são rejeitados;
- estoque pode ficar negativo;
- decrementos simultâneos não perdem atualizações;
- listagens permanecem isoladas por tenant.

Os cenários de concorrência devem ser testados com PostgreSQL real.

### 11. Registrar a decisão

Atualizar `ai-docs/decisions.md` com:

- separação entre `Venda.id` e `Venda.numero`;
- sequência exclusiva por tenant;
- números excluídos não são reutilizados;
- estoque negativo é permitido;
- decremento de estoque é atômico;
- sequência, estoque e venda usam a mesma transação.

## Guia de implantação em produção

Este guia considera frontend e backend gerenciados pelo PM2 e PostgreSQL em
Docker. Substitua os nomes em maiúsculas pelos valores reais da VPS.

### 1. Identificar os processos e o banco

```bash
pm2 list
docker ps
pm2 describe BACKEND_PM2
pm2 describe FRONTEND_PM2
docker inspect DB_CONTAINER
```

Anotar os nomes dos dois processos, do container e o hash atualmente publicado:

```bash
cd /caminho/do/deposito_facil
git status
git branch --show-current
git rev-parse HEAD
```

A árvore de trabalho da VPS deve estar limpa.

### 2. Validar localmente antes do push

```bash
cd backend
npx prisma migrate dev --name add_sequencia_venda
npm test
npm run build

cd ../frontend
npm run build

cd ..
git diff --check
git status
```

Revisar manualmente o SQL criado em
`backend/prisma/migrations/<data>_add_sequencia_venda/migration.sql`. Testar
a migration em um banco descartável com dados de mais de um tenant:

```bash
cd backend
npx prisma migrate deploy
```

Depois, fazer commit e push incluindo schema, migration, backend, testes,
frontend e documentação.

### 3. Parar as aplicações na VPS

```bash
pm2 stop BACKEND_PM2
pm2 stop FRONTEND_PM2
pm2 list
```

O PostgreSQL continua rodando. A parada evita vendas entre o backup e a
conclusão da migration.

### 4. Fazer e validar o backup

```bash
mkdir -p /caminho/seguro/backups

docker exec DB_CONTAINER \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > /caminho/seguro/backups/deposito_facil_antes_sequencia.dump

ls -lh /caminho/seguro/backups/deposito_facil_antes_sequencia.dump

docker exec -i DB_CONTAINER \
  pg_restore --list \
  < /caminho/seguro/backups/deposito_facil_antes_sequencia.dump
```

Não continuar se o backup estiver vazio ou inválido. O procedimento de
restauração deve ter sido testado previamente em um banco descartável.

### 5. Atualizar e buildar

```bash
cd /caminho/do/deposito_facil
git pull --ff-only
git log -1 --oneline
git status

cd backend
npm ci
npx prisma generate
npm run build

cd ../frontend
npm ci
npm run build
```

Se instalação ou build falhar, não executar a migration.

### 6. Aplicar a migration

Na produção, usar apenas `migrate deploy`. Não usar `migrate dev`,
`db push` ou o seeder.

```bash
cd /caminho/do/deposito_facil/backend
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

### 7. Validar o banco

```bash
docker exec -it DB_CONTAINER \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

```sql
SELECT "tenant_id", "numero", COUNT(*)
FROM "Venda"
WHERE "numero" IS NOT NULL
GROUP BY "tenant_id", "numero"
HAVING COUNT(*) > 1;

SELECT
  "tenant_id",
  MIN("numero") AS primeiro,
  MAX("numero") AS ultimo,
  COUNT(*) AS quantidade
FROM "Venda"
GROUP BY "tenant_id"
ORDER BY "tenant_id";

SELECT * FROM "SequenciaVenda" ORDER BY "tenant_id";

SELECT COUNT(*) AS vendas_sem_numero
FROM "Venda"
WHERE "numero" IS NULL;
```

Duplicidades e vendas sem número devem retornar zero. O
`proximo_numero` deve ser maior que o maior número de cada tenant.

### 8. Reiniciar e acompanhar

```bash
pm2 restart BACKEND_PM2
pm2 logs BACKEND_PM2 --lines 100

pm2 restart FRONTEND_PM2
pm2 logs FRONTEND_PM2 --lines 100

pm2 list
pm2 save
```

Testar login, listagem antiga, criação de venda, número recebido, estoque
negativo, pagamento, quitação, filtros e isolamento entre dois tenants.

### 9. Rollback

Antes da migration, basta voltar ao hash anterior, reinstalar, buildar e
reiniciar. Depois da primeira migration, como `numero` ainda é opcional, o
código anterior pode ser usado temporariamente, mas novas vendas poderão ficar
sem número e precisarão de correção antes da próxima tentativa.

Uma restauração completa apaga tudo que aconteceu depois do backup. Com as
aplicações paradas, o comando é semelhante a:

```bash
docker exec -i DB_CONTAINER \
  sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' \
  < /caminho/seguro/backups/deposito_facil_antes_sequencia.dump
```

Antes de restaurar, confirmar cuidadosamente container, banco e arquivo. Após a
restauração, voltar ao commit anterior, executar `npm ci`, gerar o Prisma,
refazer os builds e reiniciar os processos PM2.

## Checklist

```text
Local
[ ] Implementar a transação, sequência e número
[ ] Criar e revisar a migration
[ ] Testar com dados existentes e múltiplos tenants
[ ] Executar testes e builds
[ ] Commit e push

Produção
[ ] Identificar processos PM2 e container
[ ] Conferir árvore Git e anotar commit atual
[ ] Parar backend e frontend
[ ] Criar e validar backup
[ ] git pull --ff-only
[ ] npm ci, prisma generate e builds
[ ] prisma migrate deploy
[ ] Validar vendas e sequências
[ ] Reiniciar PM2 e conferir logs
[ ] Executar teste funcional
```
