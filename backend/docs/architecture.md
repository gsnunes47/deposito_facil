### Arquitetura

Index - > Router -> Controller -> Domain

#### Index

É o arquivo onde vai estar contido todas as rotas comuns e routers.

#### Router

Será criado um para cada tabela, para ter seus métodos separados.

#### Controller

Será criado um por router, dentro dele uma função para cada rota do router.função. Nele será tratado o payload.

#### Domain

É onde será validado a regra de negócio.
