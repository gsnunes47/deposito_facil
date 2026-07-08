-- CreateTable
CREATE TABLE "Despesa" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "nome" TEXT,
    "documento" TEXT DEFAULT '',

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encomenda" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "fornecedor_id" INTEGER NOT NULL,
    "produtos" JSON NOT NULL,
    "total" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_quitacao" TIMESTAMP(3),
    "pago" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoEncomenda" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "encomenda_id" INTEGER NOT NULL,
    "valor" INTEGER DEFAULT 1,
    "data_pagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma_pagamento" "FormaPagamento" NOT NULL,

    CONSTRAINT "PagamentoEncomenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoEncomenda" ADD CONSTRAINT "PagamentoEncomenda_encomenda_id_fkey" FOREIGN KEY ("encomenda_id") REFERENCES "Encomenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
