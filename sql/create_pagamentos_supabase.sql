-- Script SQL para criar tabelas de pagamentos no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar ENUMs para Status de Pagamento (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE status_pagamento AS ENUM (
      'PENDENTE',
      'PAGO',
      'PARCIAL',
      'VENCIDO',
      'CANCELADO',
      'ESTORNADO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar ENUM para Forma de Pagamento (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE forma_pagamento AS ENUM (
      'DINHEIRO',
      'PIX',
      'CARTAO_DEBITO',
      'CARTAO_CREDITO',
      'TRANSFERENCIA',
      'BOLETO',
      'CHEQUE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar ENUM para Tipo de Pagamento (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE tipo_pagamento AS ENUM (
      'ENTRADA',
      'PARCELA',
      'PAGAMENTO_UNICO',
      'SERVICO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar ENUM para Ações do Histórico (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE acao_historico_pagamento AS ENUM (
      'CRIADO',
      'PAGO',
      'ESTORNADO',
      'CANCELADO',
      'VENCIDO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela principal de Pagamentos (apenas se não existir)
CREATE TABLE IF NOT EXISTS "Pagamentos" (
  id SERIAL PRIMARY KEY,
  os_id INTEGER NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0.00,
  valor_pendente DECIMAL(10,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
  status status_pagamento DEFAULT 'PENDENTE',
  forma_pagamento forma_pagamento NOT NULL,
  tipo_pagamento tipo_pagamento NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMP,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Parcelas (apenas se não existir)
CREATE TABLE IF NOT EXISTS "PagamentoParcelas" (
  id SERIAL PRIMARY KEY,
  pagamento_id INTEGER NOT NULL REFERENCES "Pagamentos"(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMP,
  status status_pagamento DEFAULT 'PENDENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Pagamentos (apenas se não existir)
CREATE TABLE IF NOT EXISTS "HistoricoPagamentos" (
  id SERIAL PRIMARY KEY,
  pagamento_id INTEGER NOT NULL REFERENCES "Pagamentos"(id) ON DELETE CASCADE,
  acao acao_historico_pagamento NOT NULL,
  valor DECIMAL(10,2),
  observacoes TEXT,
  usuario_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cobrança Automática (apenas se não existir)
CREATE TABLE IF NOT EXISTS "CobrancaAutomatica" (
  id SERIAL PRIMARY KEY,
  pagamento_id INTEGER NOT NULL REFERENCES "Pagamentos"(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  dias_antes_vencimento INTEGER DEFAULT 3,
  template_email TEXT,
  ultimo_envio TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance (apenas se não existirem)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_pagamentos_os_id ON "Pagamentos"(os_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON "Pagamentos"(status);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_pagamentos_data_vencimento ON "Pagamentos"(data_vencimento);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_parcelas_pagamento_id ON "PagamentoParcelas"(pagamento_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_historico_pagamento_id ON "HistoricoPagamentos"(pagamento_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at (apenas se não existirem)
DO $$ BEGIN
    CREATE TRIGGER update_pagamentos_updated_at 
        BEFORE UPDATE ON "Pagamentos" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_parcelas_updated_at 
        BEFORE UPDATE ON "PagamentoParcelas" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_cobranca_updated_at 
        BEFORE UPDATE ON "CobrancaAutomatica" 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Função para atualizar status baseado na data de vencimento
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a data de vencimento passou e o status ainda é PENDENTE, marcar como VENCIDO
    IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'PENDENTE' THEN
        NEW.status = 'VENCIDO';
    END IF;
    
    -- Se foi pago, marcar data de pagamento
    IF NEW.status = 'PAGO' AND OLD.status != 'PAGO' THEN
        NEW.data_pagamento = CURRENT_TIMESTAMP;
        NEW.valor_pago = NEW.valor_total;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualização automática de status (apenas se não existir)
DO $$ BEGIN
    CREATE TRIGGER update_pagamentos_status 
        BEFORE UPDATE ON "Pagamentos" 
        FOR EACH ROW EXECUTE FUNCTION update_payment_status();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_pagamento_parcelas_status 
        BEFORE UPDATE ON "PagamentoParcelas" 
        FOR EACH ROW EXECUTE FUNCTION update_payment_status();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Comentários nas tabelas para documentação
COMMENT ON TABLE "Pagamentos" IS 'Tabela principal para controle de pagamentos das ordens de serviço';
COMMENT ON TABLE "PagamentoParcelas" IS 'Tabela para controle de parcelas individuais dos pagamentos';
COMMENT ON TABLE "HistoricoPagamentos" IS 'Tabela de auditoria para histórico de alterações nos pagamentos';
COMMENT ON TABLE "CobrancaAutomatica" IS 'Tabela para controle de cobranças automáticas';