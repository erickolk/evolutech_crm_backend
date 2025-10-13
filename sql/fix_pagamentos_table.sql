-- Script para corrigir a estrutura da tabela Pagamentos no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, adicionar o valor PARCIAL ao ENUM status_pagamento se não existir
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

-- Verificar se a coluna tipo_pagamento existe e adicioná-la se necessário
DO $$ 
BEGIN
    -- Verificar se a coluna tipo_pagamento existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pagamentos' 
        AND column_name = 'tipo_pagamento'
    ) THEN
        -- Adicionar a coluna tipo_pagamento
        ALTER TABLE "Pagamentos" 
        ADD COLUMN tipo_pagamento tipo_pagamento NOT NULL DEFAULT 'SERVICO';
    END IF;
END $$;

-- Verificar se outras colunas essenciais existem e adicioná-las se necessário
DO $$ 
BEGIN
    -- Verificar e adicionar coluna numero_parcelas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pagamentos' 
        AND column_name = 'numero_parcelas'
    ) THEN
        ALTER TABLE "Pagamentos" 
        ADD COLUMN numero_parcelas INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Verificar e adicionar coluna valor_pago se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pagamentos' 
        AND column_name = 'valor_pago'
    ) THEN
        ALTER TABLE "Pagamentos" 
        ADD COLUMN valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Verificar e adicionar coluna valor_pendente se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Pagamentos' 
        AND column_name = 'valor_pendente'
    ) THEN
        ALTER TABLE "Pagamentos" 
        ADD COLUMN valor_pendente DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;