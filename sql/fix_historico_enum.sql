-- Script SQL para corrigir o enum acao_historico_pagamento
-- Execute este script no Supabase SQL Editor

-- Adicionar valor CRIACAO ao enum acao_historico_pagamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'CRIACAO' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'acao_historico_pagamento'
        )
    ) THEN
        ALTER TYPE acao_historico_pagamento ADD VALUE 'CRIACAO';
    END IF;
END $$;

-- Adicionar valor PAGAMENTO_PARCELA ao enum acao_historico_pagamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PAGAMENTO_PARCELA' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'acao_historico_pagamento'
        )
    ) THEN
        ALTER TYPE acao_historico_pagamento ADD VALUE 'PAGAMENTO_PARCELA';
    END IF;
END $$;

-- Verificar os valores do enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'acao_historico_pagamento'
) 
ORDER BY enumsortorder;