-- Script para adicionar colunas faltantes na tabela Pagamentos
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna tipo_pagamento se não existir
ALTER TABLE "Pagamentos" 
ADD COLUMN IF NOT EXISTS tipo_pagamento tipo_pagamento NOT NULL DEFAULT 'SERVICO';

-- Adicionar coluna numero_parcelas se não existir  
ALTER TABLE "Pagamentos"
ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER NOT NULL DEFAULT 1;

-- Adicionar coluna valor_pago se não existir
ALTER TABLE "Pagamentos"
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Adicionar coluna valor_pendente se não existir
ALTER TABLE "Pagamentos"
ADD COLUMN IF NOT EXISTS valor_pendente DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Adicionar valor PARCIAL ao ENUM status_pagamento se não existir
ALTER TYPE status_pagamento ADD VALUE IF NOT EXISTS 'PARCIAL';