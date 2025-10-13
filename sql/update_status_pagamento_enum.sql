-- Script para adicionar o valor PARCIAL ao ENUM status_pagamento existente
-- Execute este script no SQL Editor do Supabase

-- Adicionar o valor PARCIAL ao ENUM status_pagamento se não existir
DO $$ 
BEGIN
    -- Verificar se o valor PARCIAL já existe no ENUM
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_pagamento')
        AND enumlabel = 'PARCIAL'
    ) THEN
        -- Adicionar o valor PARCIAL ao ENUM
        ALTER TYPE status_pagamento ADD VALUE 'PARCIAL';
    END IF;
END $$;