/*
  Warnings:

  - The primary key for the `Cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `global_id` on the `Cliente` table. All the data in the column will be lost.
  - The primary key for the `Pagamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `global_id` on the `Pagamento` table. All the data in the column will be lost.
  - The primary key for the `Produto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `global_id` on the `Produto` table. All the data in the column will be lost.
  - The primary key for the `Venda` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `global_id` on the `Venda` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_venda_id_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_cliente_id_fkey";

-- AlterTable
CREATE SEQUENCE cliente_id_seq;
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_pkey",
DROP COLUMN "global_id",
ALTER COLUMN "id" SET DEFAULT nextval('cliente_id_seq'),
ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE cliente_id_seq OWNED BY "Cliente"."id";

-- AlterTable
CREATE SEQUENCE pagamento_id_seq;
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_pkey",
DROP COLUMN "global_id",
ALTER COLUMN "id" SET DEFAULT nextval('pagamento_id_seq'),
ADD CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE pagamento_id_seq OWNED BY "Pagamento"."id";

-- AlterTable
CREATE SEQUENCE produto_id_seq;
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_pkey",
DROP COLUMN "global_id",
ALTER COLUMN "id" SET DEFAULT nextval('produto_id_seq'),
ADD CONSTRAINT "Produto_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE produto_id_seq OWNED BY "Produto"."id";

-- AlterTable
CREATE SEQUENCE venda_id_seq;
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_pkey",
DROP COLUMN "global_id",
ALTER COLUMN "id" SET DEFAULT nextval('venda_id_seq'),
ADD CONSTRAINT "Venda_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE venda_id_seq OWNED BY "Venda"."id";

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
