-- Script para criar as tabelas do sistema de pagamentos no Supabase
-- Baseado nos tipos definidos em pagamento.types.ts

-- Criar ENUM para Status de Pagamento
CREATE TYPE status_pagamento AS ENUM (
  'PENDENTE',
  'PAGO', 
  'VENCIDO',
  'CANCELADO',
  'ESTORNADO'
);

-- Criar ENUM para Forma de Pagamento
CREATE TYPE forma_pagamento AS ENUM (
  'DINHEIRO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO', 
  'PIX',
  'TRANSFERENCIA',
  'BOLETO',
  'CHEQUE'
);

-- Criar ENUM para Tipo de Pagamento
CREATE TYPE tipo_pagamento AS ENUM (
  'ENTRADA',
  'PARCELA',
  'PAGAMENTO_UNICO',
  'SERVICO'
);

-- Criar ENUM para Ações do Histórico
CREATE TYPE acao_historico_pagamento AS ENUM (
  'CRIADO',
  'PAGO',
  'ESTORNADO',
  'CANCELADO',
  'ATUALIZADO',
  'ALTERACAO_VALOR'
);

-- Tabela principal de Pagamentos
CREATE TABLE IF NOT EXISTS "Pagamentos" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "os_id" UUID NOT NULL,
  "valor_total" DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
  "valor_pago" DECIMAL(10,2) DEFAULT 0 CHECK (valor_pago >= 0),
  "valor_pendente" DECIMAL(10,2) NOT NULL CHECK (valor_pendente >= 0),
  "forma_pagamento" forma_pagamento NOT NULL,
  "numero_parcelas" INTEGER DEFAULT 1 CHECK (numero_parcelas > 0),
  "status" status_pagamento DEFAULT 'PENDENTE',
  "data_vencimento" TIMESTAMP WITH TIME ZONE,
  "data_pagamento" TIMESTAMP WITH TIME ZONE,
  "observacoes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Tabela de Parcelas de Pagamento
CREATE TABLE IF NOT EXISTS "PagamentoParcelas" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "pagamento_id" UUID NOT NULL REFERENCES "Pagamentos"("id") ON DELETE CASCADE,
  "numero_parcela" INTEGER NOT NULL CHECK (numero_parcela > 0),
  "valor_parcela" DECIMAL(10,2) NOT NULL CHECK (valor_parcela >= 0),
  "data_vencimento" TIMESTAMP WITH TIME ZONE NOT NULL,
  "data_pagamento" TIMESTAMP WITH TIME ZONE,
  "status" status_pagamento DEFAULT 'PENDENTE',
  "forma_pagamento_parcela" forma_pagamento,
  "observacoes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("pagamento_id", "numero_parcela")
);

-- Tabela de Histórico de Pagamentos (para auditoria)
CREATE TABLE IF NOT EXISTS "HistoricoPagamentos" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "pagamento_id" UUID NOT NULL REFERENCES "Pagamentos"("id") ON DELETE CASCADE,
  "acao" acao_historico_pagamento NOT NULL,
  "valor_anterior" DECIMAL(10,2),
  "valor_novo" DECIMAL(10,2),
  "usuario_id" UUID,
  "observacoes" TEXT,
  "data_acao" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cobrança Automática
CREATE TABLE IF NOT EXISTS "CobrancaAutomatica" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "parcela_id" UUID NOT NULL REFERENCES "PagamentoParcelas"("id") ON DELETE CASCADE,
  "tipo_cobranca" VARCHAR(20) NOT NULL CHECK (tipo_cobranca IN ('EMAIL', 'SMS', 'WHATSAPP')),
  "dias_antes_vencimento" INTEGER NOT NULL,
  "mensagem" TEXT NOT NULL,
  "enviado" BOOLEAN DEFAULT FALSE,
  "data_envio" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS "idx_pagamentos_os_id" ON "Pagamentos"("os_id");
CREATE INDEX IF NOT EXISTS "idx_pagamentos_status" ON "Pagamentos"("status");
CREATE INDEX IF NOT EXISTS "idx_pagamentos_data_vencimento" ON "Pagamentos"("data_vencimento");
CREATE INDEX IF NOT EXISTS "idx_pagamentos_deleted_at" ON "Pagamentos"("deleted_at");

CREATE INDEX IF NOT EXISTS "idx_pagamento_parcelas_pagamento_id" ON "PagamentoParcelas"("pagamento_id");
CREATE INDEX IF NOT EXISTS "idx_pagamento_parcelas_status" ON "PagamentoParcelas"("status");
CREATE INDEX IF NOT EXISTS "idx_pagamento_parcelas_data_vencimento" ON "PagamentoParcelas"("data_vencimento");
CREATE INDEX IF NOT EXISTS "idx_pagamento_parcelas_data_pagamento" ON "PagamentoParcelas"("data_pagamento");

CREATE INDEX IF NOT EXISTS "idx_historico_pagamentos_pagamento_id" ON "HistoricoPagamentos"("pagamento_id");
CREATE INDEX IF NOT EXISTS "idx_historico_pagamentos_data_acao" ON "HistoricoPagamentos"("data_acao");

CREATE INDEX IF NOT EXISTS "idx_cobranca_automatica_parcela_id" ON "CobrancaAutomatica"("parcela_id");
CREATE INDEX IF NOT EXISTS "idx_cobranca_automatica_enviado" ON "CobrancaAutomatica"("enviado");

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pagamentos_updated_at 
    BEFORE UPDATE ON "Pagamentos" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamento_parcelas_updated_at 
    BEFORE UPDATE ON "PagamentoParcelas" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular valor pendente automaticamente
CREATE OR REPLACE FUNCTION calculate_valor_pendente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_pendente = NEW.valor_total - NEW.valor_pago;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_pagamentos_valor_pendente 
    BEFORE INSERT OR UPDATE ON "Pagamentos" 
    FOR EACH ROW EXECUTE FUNCTION calculate_valor_pendente();

-- Função para atualizar status baseado nas datas
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se tem data de pagamento, está pago
    IF NEW.data_pagamento IS NOT NULL THEN
        NEW.status = 'PAGO';
    -- Se passou da data de vencimento e não foi pago, está vencido
    ELSIF NEW.data_vencimento IS NOT NULL AND NEW.data_vencimento < NOW() AND NEW.data_pagamento IS NULL THEN
        NEW.status = 'VENCIDO';
    -- Caso contrário, mantém pendente
    ELSIF NEW.status NOT IN ('CANCELADO', 'ESTORNADO') THEN
        NEW.status = 'PENDENTE';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pagamentos_status 
    BEFORE INSERT OR UPDATE ON "Pagamentos" 
    FOR EACH ROW EXECUTE FUNCTION update_payment_status();

CREATE TRIGGER update_pagamento_parcelas_status 
    BEFORE INSERT OR UPDATE ON "PagamentoParcelas" 
    FOR EACH ROW EXECUTE FUNCTION update_payment_status();

-- Comentários nas tabelas para documentação
COMMENT ON TABLE "Pagamentos" IS 'Tabela principal para controle de pagamentos das ordens de serviço';
COMMENT ON TABLE "PagamentoParcelas" IS 'Tabela para controle de parcelas individuais dos pagamentos';
COMMENT ON TABLE "HistoricoPagamentos" IS 'Tabela de auditoria para histórico de alterações nos pagamentos';
COMMENT ON TABLE "CobrancaAutomatica" IS 'Tabela para controle de cobranças automáticas';

-- Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO "Pagamentos" (os_id, valor_total, forma_pagamento, numero_parcelas, observacoes)
-- VALUES 
--   (gen_random_uuid(), 1500.00, 'PIX', 1, 'Pagamento à vista com desconto'),
--   (gen_random_uuid(), 2400.00, 'CARTAO_CREDITO', 3, 'Parcelado em 3x sem juros');

COMMIT;