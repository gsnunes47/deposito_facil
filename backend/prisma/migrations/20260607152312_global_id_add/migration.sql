/*
  Warnings:

  - The primary key for the `Cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Pagamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Produto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Venda` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_venda_id_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_cliente_id_fkey";

-- AlterTable
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_pkey",
ADD COLUMN     "global_id" SERIAL NOT NULL,
ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY ("global_id");

-- AlterTable
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_pkey",
ADD COLUMN     "global_id" SERIAL NOT NULL,
ADD CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("global_id");

-- AlterTable
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_pkey",
ADD COLUMN     "global_id" SERIAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Produto_pkey" PRIMARY KEY ("global_id");
DROP SEQUENCE "Produto_id_seq";

-- AlterTable
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_pkey",
ADD COLUMN     "global_id" SERIAL NOT NULL,
ADD CONSTRAINT "Venda_pkey" PRIMARY KEY ("global_id");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("global_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "Venda"("global_id") ON DELETE RESTRICT ON UPDATE CASCADE;
