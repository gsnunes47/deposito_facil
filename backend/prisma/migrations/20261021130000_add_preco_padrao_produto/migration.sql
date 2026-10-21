-- O preço padrão é opcional e armazenado em centavos.
-- Registros existentes permanecem compatíveis com valor nulo.
ALTER TABLE "Produto"
ADD COLUMN "preco_padrao" INTEGER;
