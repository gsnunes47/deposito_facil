-- Produtos existentes continuam sendo produtos; novos cadastros também usam
-- PRODUTO quando o tipo não for informado.
CREATE TYPE "TipoItem" AS ENUM ('PRODUTO', 'SERVICO');

ALTER TABLE "Produto"
ADD COLUMN "tipo" "TipoItem" NOT NULL DEFAULT 'PRODUTO';

CREATE TABLE "TipoDespesa" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoDespesa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TipoDespesa_tenant_id_nome_key"
ON "TipoDespesa"("tenant_id", "nome");

CREATE INDEX "TipoDespesa_tenant_id_idx"
ON "TipoDespesa"("tenant_id");

ALTER TABLE "TipoDespesa"
ADD CONSTRAINT "TipoDespesa_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "Tenants"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Despesa"
ADD COLUMN "tipo_id" INTEGER;

CREATE INDEX "Despesa_tipo_id_idx"
ON "Despesa"("tipo_id");

ALTER TABLE "Despesa"
ADD CONSTRAINT "Despesa_tipo_id_fkey"
FOREIGN KEY ("tipo_id") REFERENCES "TipoDespesa"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Inicialização idempotente para todos os tenants já existentes.
INSERT INTO "TipoDespesa" ("tenant_id", "nome")
SELECT tenant.id, tipo.nome
FROM "Tenants" tenant
CROSS JOIN (VALUES ('Salário'), ('Manutenção'), ('Imprevisto')) AS tipo(nome)
ON CONFLICT ("tenant_id", "nome") DO NOTHING;
