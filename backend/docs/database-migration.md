# Migração do banco legado

## Estado atual

A migração MySQL -> PostgreSQL é possível, mas ainda não deve ser executada.
O primeiro rascunho em `backend/migration/migrate_legacy_db.py` faz apenas o
diagnóstico dos schemas e dos dados. Não existe caminho de escrita habilitado.

## Mapeamento inicial

| Legado | Destino | Observação |
| --- | --- | --- |
| `Cliente(cpf, nome)` | `Cliente(documento, nome, tenant_id)` | Associar ao tenant escolhido. |
| `Produto(nome, quantidade)` | `Produto(nome, quantidade, tenant_id)` | Validar duplicados por nome normalizado. |
| `Despesa` | `Despesa` | Valores já parecem estar em centavos. |
| `Fornecedor(nome)` | `Fornecedor(nome, documento, tenant_id)` | Documento ficará vazio. |
| `Venda.cliente` | `Venda.cliente_id` | Resolver nome legado para o ID novo. |
| `Venda.produtos` | `Venda.produtos` JSON | Interpretar a string e substituir nome por ID. |
| `Pagamento` | `Pagamento` | Traduzir a forma de pagamento para o enum. |
| `Encomendas.fornecedor` | `Encomenda.fornecedor_id` | Resolver nome legado para o ID novo. |
| `Encomendas.info` | `Encomenda.produtos` JSON | Interpretar a mesma string de itens. |
| `Feira`, `Estoque`, `Usuario` | sem destino direto | Exigem decisão explícita. |

O JSON usado hoje pelo backend tem a forma:

```json
[{"id": 1, "quantidade": 2, "valor_unitario": 1250}]
```

`valor_unitario`, `total`, despesas e pagamentos devem permanecer em centavos.

## Decisões antes da carga

1. **Tenant de destino:** obter o ID já existente. A migração não deve criar ou
   adivinhar o tenant.
2. **Base destino:** decidir entre uma base de homologação vazia ou o banco com
   dados existentes. Se houver dados, IDs antigos não podem ser reutilizados
   diretamente e será necessário guardar mapas `id_antigo -> id_novo`.
3. **Duplicados:** decidir se clientes, fornecedores e produtos com o mesmo nome
   normalizado serão unidos ou mantidos separados. Cliente tem CPF; fornecedor
   não tem chave natural confiável.
4. **Nomes ausentes:** vendas/encomendas apontam para nomes, não IDs. Definir se
   nomes sem cadastro criam registros auxiliares ou bloqueiam a migração.
5. **Produtos históricos:** confirmar que toda string segue
   `QUANTIDADE NOME – R$VALOR_UNITARIO`. Linhas fora do padrão devem ir para um
   arquivo de exceções, nunca ser silenciosamente descartadas.
6. **Total das encomendas:** o legado declara `Float`, enquanto o novo usa
   centavos. É preciso confirmar se os valores reais do MySQL estão em reais.
7. **Quitação de encomendas:** o legado tem apenas `pago`, sem pagamentos nem
   data de quitação. Definir a data e a forma de pagamento sintéticas, ou aceitar
   encomenda quitada sem `PagamentoEncomenda`.
8. **Quitação de vendas:** usar `data_fechamento` como `data_quitacao`. Conferir
   vendas marcadas pagas cujo somatório de pagamentos difere do total.
9. **Estoque:** o `Produto.quantidade` legado parece ser o saldo atual. Não se
   deve reproduzir vendas/encomendas chamando as regras do backend, pois isso
   movimentaria o estoque novamente. A carga histórica será feita diretamente
   e o saldo final será importado uma única vez.
10. **Usuários:** senhas e modelo de autenticação mudaram. Decidir se o usuário
    será criado fora da migração com uma nova senha.
11. **Janela de corte:** parar escrita no sistema antigo, tirar backup final,
    executar diagnóstico/carga e reconciliar totais antes de liberar o novo.

## Estratégia proposta

1. Executar o diagnóstico somente leitura e revisar o JSON de exceções.
2. Corrigir aliases e decisões em arquivos versionados, sem alterar o dump.
3. Carregar uma base PostgreSQL descartável dentro de uma transação.
4. Validar contagens, totais financeiros, pagamentos, saldos e chaves órfãs.
5. Repetir a partir de um backup recente até o processo ser reprodutível.
6. No corte, fazer backup de origem e destino e executar a carga definitiva.

A futura opção de escrita deve exigir `--apply`, `--tenant-id` e uma confirmação
explícita do banco de destino. O padrão continuará sendo somente diagnóstico.
