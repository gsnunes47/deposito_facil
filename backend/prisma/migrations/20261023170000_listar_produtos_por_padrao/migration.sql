ALTER TABLE "Tenants" ALTER COLUMN "listar_produtos" SET DEFAULT true;

UPDATE "Tenants" SET "listar_produtos" = true;
