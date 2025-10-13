-- Script SQL para adicionar colunas faltantes na tabela Pagamentos
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna tipo_pagamento
ALTER TABLE "Pagamentos" 
ADD COLUMN IF NOT EXISTS "tipo_pagamento" VARCHAR(50);

-- 2. Adicionar coluna numero_parcelas
ALTER TABLE "Pagamentos" 
ADD COLUMN IF NOT EXISTS "numero_parcelas" INTEGER DEFAULT 1;

-- 3. Adicionar coluna valor_pago
ALTER TABLE "Pagamentos" 
ADD COLUMN IF NOT EXISTS "valor_pago" DECIMAL(10,2) DEFAULT 0.00;

-- 4. Adicionar coluna valor_pendente
ALTER TABLE "Pagamentos" 
ADD COLUMN IF NOT EXISTS "valor_pendente" DECIMAL(10,2) DEFAULT 0.00;

-- 5. Adicionar valor PARCIAL ao enum status_pagamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PARCIAL' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'status_pagamento'
        )
    ) THEN
        ALTER TYPE status_pagamento ADD VALUE 'PARCIAL';
    END IF;
END $$;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Pagamentos' 
ORDER BY ordinal_position;