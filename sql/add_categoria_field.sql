-- Adicionar campo 'categoria' à tabela Produtos
-- Este campo é mencionado na documentação Swagger e nos exemplos de API

ALTER TABLE "Produtos" 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- Adicionar comentário explicativo
COMMENT ON COLUMN "Produtos".categoria IS 'Categoria do produto (ex: Peças, Acessórios, Serviços)';

-- Verificar se o campo foi adicionado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Produtos' 
  AND table_schema = 'public'
  AND column_name = 'categoria';