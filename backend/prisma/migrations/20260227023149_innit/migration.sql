-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER DEFAULT 0,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);
