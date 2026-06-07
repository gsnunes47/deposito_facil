-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Cliente_id_seq";

-- AlterTable
ALTER TABLE "Pagamento" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Pagamento_id_seq";

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Venda_id_seq";
