# Depósito Fácil

Sistema web de gestão para depósitos e pequenos negócios, desenvolvido para centralizar operações de estoque, vendas, entradas, clientes, fornecedores, pagamentos e relatórios em uma única aplicação.

O projeto é uma reescrita do sistema original `Controle Depósito`, criada após a validação da primeira versão com usuários reais. A nova base foi estruturada para melhorar a arquitetura, permitir evolução do produto e suportar múltiplos clientes através de uma arquitetura multi-tenant.

## Funcionalidades

- Autenticação de usuários
- Separação de dados por tenant
- Cadastro e controle de produtos
- Controle de estoque
- Registro de vendas
- Registro de entradas e encomendas
- Cadastro de clientes e fornecedores
- Controle de pagamentos
- Registro de despesas
- Relatórios
- Área administrativa

## Arquitetura

O projeto é dividido em duas aplicações:

```text
deposito_facil/
├── backend/
│   ├── prisma/
│   ├── seeders/
│   ├── infra/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── domains/
│       ├── helpers/
│       ├── repositories/
│       ├── routing/
│       └── types/
└── frontend/
    ├── components/
    ├── config/
    ├── contexts/
    ├── pages/
    ├── services/
    └── styles/
```

O backend mantém regras de negócio, acesso a dados e rotas separados em camadas. O frontend consome a API e organiza as principais operações do sistema em páginas específicas.

## Stack

### Back-end

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Vitest
- Docker

### Front-end

- React
- Next.js
- JavaScript

## Multi-tenancy

A aplicação utiliza `tenant_id` nas entidades de negócio para separar os dados de cada cliente.

Entre as entidades atualmente modeladas estão:

- usuários;
- produtos;
- clientes;
- fornecedores;
- vendas;
- encomendas;
- pagamentos;
- despesas.

Essa estrutura permite que uma mesma aplicação atenda diferentes operações mantendo os dados isolados por tenant.

## Domínio

O sistema possui fluxos relacionados a:

### Estoque

Cadastro de produtos e acompanhamento das quantidades disponíveis.

### Vendas

Registro de vendas vinculadas a clientes, produtos, valores, pagamentos e situação de quitação.

### Entradas e fornecedores

Registro de encomendas e compras realizadas com fornecedores, incluindo pagamentos e situação financeira.

### Financeiro

Controle de despesas e diferentes formas de pagamento, como PIX, dinheiro e cartões.

### Relatórios

Páginas dedicadas à consulta e visualização das informações registradas no sistema.

## Desenvolvimento local

### Back-end

Entre no diretório:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

O projeto possui scripts para subir os serviços via Docker, executar migrations, seeders e iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

Também é possível executar os testes com:

```bash
npm test
```

### Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

## Origem do projeto

O Depósito Fácil nasceu a partir de uma primeira versão utilizada para resolver necessidades reais de controle de um depósito.

Depois da validação do sistema e das mudanças acumuladas durante seu uso, o projeto passou por uma reescrita completa, com nova stack e uma arquitetura preparada para crescer como aplicação web multi-tenant.

## Licença

Copyright © 2026 Gustavo Nunes.

O código-fonte está disponível publicamente para visualização, fins educacionais, avaliação técnica e demonstração de portfólio.

Nenhuma licença é concedida para copiar, modificar, redistribuir, sublicenciar, vender ou criar trabalhos derivados deste software sem autorização prévia por escrito.
