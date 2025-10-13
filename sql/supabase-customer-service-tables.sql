-- =====================================================
-- SCRIPT PARA CRIAR TABELAS DO SISTEMA DE ATENDIMENTO
-- Execute no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. TABELA DE AGENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS agentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'ocupado', 'ausente')),
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  especialidades TEXT[],
  max_conversas_simultaneas INTEGER DEFAULT 5,
  conversas_ativas INTEGER DEFAULT 0,
  ultima_atividade TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB DEFAULT '{"notificacoes_email": true, "notificacoes_push": true, "som_notificacao": true, "auto_aceitar_conversas": false, "mensagem_ausencia": null}',
  estatisticas JSONB DEFAULT '{"total_conversas": 0, "conversas_resolvidas": 0, "tempo_medio_resposta": 0, "avaliacao_media": 0, "total_avaliacoes": 0}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CONVERSAS
-- =====================================================
CREATE TABLE IF NOT EXISTS conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES "Clientes"(id) ON DELETE CASCADE,
  agente_id UUID REFERENCES agentes(id) ON DELETE SET NULL,
  assunto VARCHAR(255),
  status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'aguardando_cliente', 'aguardando_agente')),
  prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'chat', 'telefone')),
  primeira_mensagem_id UUID,
  ultima_mensagem_id UUID,
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  tempo_primeira_resposta INTEGER,
  tempo_resolucao INTEGER,
  total_mensagens INTEGER DEFAULT 0,
  mensagens_agente INTEGER DEFAULT 0,
  mensagens_cliente INTEGER DEFAULT 0,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario_avaliacao TEXT,
  origem VARCHAR(50),
  dispositivo VARCHAR(50),
  navegador VARCHAR(50),
  ip_cliente INET,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE MENSAGENS
-- =====================================================
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  remetente_tipo VARCHAR(20) NOT NULL CHECK (remetente_tipo IN ('agente', 'cliente', 'sistema')),
  remetente_id UUID,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'arquivo', 'audio', 'video', 'localizacao', 'contato', 'template')),
  canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'chat', 'telefone')),
  direcao VARCHAR(10) DEFAULT 'entrada' CHECK (direcao IN ('entrada', 'saida')),
  status VARCHAR(20) DEFAULT 'enviada' CHECK (status IN ('enviada', 'entregue', 'lida', 'erro', 'pendente')),
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  midia_url TEXT,
  midia_tipo VARCHAR(50),
  midia_tamanho INTEGER,
  midia_nome VARCHAR(255),
  whatsapp_message_id VARCHAR(255),
  whatsapp_status VARCHAR(20),
  resposta_para UUID REFERENCES mensagens(id),
  metadados JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ETIQUETAS
-- =====================================================
CREATE TABLE IF NOT EXISTS etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  cor VARCHAR(7) DEFAULT '#007bff',
  categoria VARCHAR(50),
  descricao TEXT,
  automatica BOOLEAN DEFAULT false,
  condicoes JSONB DEFAULT '{}',
  ordem INTEGER DEFAULT 0,
  visivel BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE RELACIONAMENTO CONVERSA-ETIQUETAS
-- =====================================================
CREATE TABLE IF NOT EXISTS conversa_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
  aplicada_automaticamente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversa_id, etiqueta_id)
);

-- 6. TABELA DE RELACIONAMENTO MENSAGEM-ETIQUETAS
-- =====================================================
CREATE TABLE IF NOT EXISTS mensagem_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES mensagens(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
  aplicada_automaticamente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mensagem_id, etiqueta_id)
);

-- 7. TABELA DE CONFIGURAÇÃO WHATSAPP
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  api_url VARCHAR(255) NOT NULL,
  api_token TEXT NOT NULL,
  webhook_url VARCHAR(255),
  webhook_token VARCHAR(255),
  numero_telefone VARCHAR(20) NOT NULL,
  nome_exibicao VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  webhook_verificado BOOLEAN DEFAULT false,
  configuracoes JSONB DEFAULT '{"auto_resposta": false, "mensagem_boas_vindas": null, "mensagem_fora_horario": null, "horario_funcionamento": {"ativo": false}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE TEMPLATES WHATSAPP
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) DEFAULT 'UTILITY' CHECK (categoria IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  idioma VARCHAR(10) DEFAULT 'pt_BR',
  cabecalho TEXT,
  corpo TEXT NOT NULL,
  rodape TEXT,
  botoes JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED')),
  whatsapp_template_id VARCHAR(255),
  variaveis JSONB DEFAULT '[]',
  total_usos INTEGER DEFAULT 0,
  ultima_utilizacao TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE PAGAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES "OrdensDeServico"(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES "Clientes"(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  valor_pendente DECIMAL(10,2) GENERATED ALWAYS AS (valor - valor_pago) STORED,
  metodo_pagamento VARCHAR(50) CHECK (metodo_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'cheque')),
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'parcial', 'pago', 'cancelado', 'estornado')),
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  numero_parcelas INTEGER DEFAULT 1,
  parcela_atual INTEGER DEFAULT 1,
  observacoes TEXT,
  comprovante_url TEXT,
  transacao_id VARCHAR(255),
  gateway_pagamento VARCHAR(50),
  taxa_gateway DECIMAL(5,2) DEFAULT 0,
  valor_liquido DECIMAL(10,2) GENERATED ALWAYS AS (valor_pago - (valor_pago * taxa_gateway / 100)) STORED,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- =====================================================

-- Índices para agentes
CREATE INDEX IF NOT EXISTS idx_agentes_email ON agentes(email);
CREATE INDEX IF NOT EXISTS idx_agentes_status ON agentes(status);
CREATE INDEX IF NOT EXISTS idx_agentes_ativo ON agentes(ativo);

-- Índices para conversas
CREATE INDEX IF NOT EXISTS idx_conversas_cliente_id ON conversas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_agente_id ON conversas(agente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_status ON conversas(status);
CREATE INDEX IF NOT EXISTS idx_conversas_canal ON conversas(canal);
CREATE INDEX IF NOT EXISTS idx_conversas_prioridade ON conversas(prioridade);
CREATE INDEX IF NOT EXISTS idx_conversas_ultima_atividade ON conversas(ultima_atividade);

-- Índices para mensagens
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_tipo, remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON mensagens(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens(canal);

-- Índices para etiquetas
CREATE INDEX IF NOT EXISTS idx_etiquetas_categoria ON etiquetas(categoria);
CREATE INDEX IF NOT EXISTS idx_etiquetas_ativo ON etiquetas(ativo);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_os_id ON pagamentos(os_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente_id ON pagamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_metodo ON pagamentos(metodo_pagamento);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
CREATE TRIGGER update_agentes_updated_at 
    BEFORE UPDATE ON agentes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversas_updated_at 
    BEFORE UPDATE ON conversas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensagens_updated_at 
    BEFORE UPDATE ON mensagens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_etiquetas_updated_at 
    BEFORE UPDATE ON etiquetas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_config_updated_at 
    BEFORE UPDATE ON whatsapp_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at 
    BEFORE UPDATE ON whatsapp_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at 
    BEFORE UPDATE ON pagamentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Etiquetas padrão do sistema
INSERT INTO etiquetas (nome, cor, categoria, descricao) VALUES
('Urgente', '#dc3545', 'prioridade', 'Para casos que precisam de atenção imediata'),
('Resolvido', '#28a745', 'status', 'Conversa foi resolvida com sucesso'),
('Aguardando Cliente', '#ffc107', 'status', 'Aguardando resposta do cliente'),
('Suporte Técnico', '#007bff', 'departamento', 'Questões técnicas e de suporte'),
('Vendas', '#17a2b8', 'departamento', 'Questões relacionadas a vendas'),
('Reclamação', '#fd7e14', 'tipo', 'Reclamações e problemas reportados'),
('Elogio', '#20c997', 'tipo', 'Elogios e feedback positivo'),
('Dúvida', '#6f42c1', 'tipo', 'Dúvidas gerais dos clientes'),
('Primeira Compra', '#e83e8c', 'cliente', 'Cliente fazendo primeira compra'),
('Cliente VIP', '#fd7e14', 'cliente', 'Cliente com alto valor de compras')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE agentes IS 'Agentes de atendimento ao cliente';
COMMENT ON TABLE conversas IS 'Conversas entre clientes e agentes';
COMMENT ON TABLE mensagens IS 'Mensagens das conversas';
COMMENT ON TABLE etiquetas IS 'Tags para organização e categorização';
COMMENT ON TABLE conversa_etiquetas IS 'Relacionamento entre conversas e etiquetas';
COMMENT ON TABLE mensagem_etiquetas IS 'Relacionamento entre mensagens e etiquetas';
COMMENT ON TABLE whatsapp_config IS 'Configurações de integração com WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates de mensagens do WhatsApp';
COMMENT ON TABLE pagamentos IS 'Controle de pagamentos das ordens de serviço';

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY) - OPCIONAL
-- =====================================================

-- Habilitar RLS nas tabelas (descomente se necessário)
-- ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agentes', 'conversas', 'mensagens', 'etiquetas', 'conversa_etiquetas', 'mensagem_etiquetas', 'whatsapp_config', 'whatsapp_templates', 'pagamentos')
ORDER BY tablename;