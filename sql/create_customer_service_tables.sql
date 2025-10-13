-- =====================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DE CUSTOMER SERVICE
-- EvolutechCRM Backend - Sistema de Atendimento
-- =====================================================

-- Tabela de Agentes
CREATE TABLE IF NOT EXISTS agentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'ocupado', 'ausente')),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    especialidades TEXT[], -- Array de especialidades
    max_conversas_simultaneas INTEGER DEFAULT 5,
    conversas_ativas INTEGER DEFAULT 0,
    ultima_atividade TIMESTAMP WITH TIME ZONE,
    
    -- Configurações do agente (JSON)
    configuracoes JSONB DEFAULT '{
        "notificacoes_email": true,
        "notificacoes_push": true,
        "som_notificacao": true,
        "auto_aceitar_conversas": false,
        "mensagem_ausencia": null
    }',
    
    -- Estatísticas do agente (JSON)
    estatisticas JSONB DEFAULT '{
        "total_conversas": 0,
        "conversas_resolvidas": 0,
        "tempo_medio_resposta": 0,
        "avaliacao_media": 0,
        "total_avaliacoes": 0
    }',
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agente_id UUID REFERENCES agentes(id) ON DELETE SET NULL,
    assunto VARCHAR(255),
    status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'aguardando_cliente', 'aguardando_agente')),
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'chat', 'telefone')),
    
    -- Dados da conversa
    primeira_mensagem_id UUID,
    ultima_mensagem_id UUID,
    ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    
    -- Métricas
    tempo_primeira_resposta INTEGER, -- em segundos
    tempo_resolucao INTEGER, -- em segundos
    total_mensagens INTEGER DEFAULT 0,
    mensagens_agente INTEGER DEFAULT 0,
    mensagens_cliente INTEGER DEFAULT 0,
    
    -- Avaliação
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    comentario_avaliacao TEXT,
    
    -- Metadados
    origem VARCHAR(50), -- origem da conversa (site, app, etc.)
    dispositivo VARCHAR(50), -- dispositivo do cliente
    navegador VARCHAR(50), -- navegador do cliente
    ip_cliente INET, -- IP do cliente
    
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    
    -- Remetente
    remetente_tipo VARCHAR(20) NOT NULL CHECK (remetente_tipo IN ('agente', 'cliente', 'sistema')),
    remetente_id UUID, -- ID do agente ou cliente
    
    -- Conteúdo da mensagem
    conteudo TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'arquivo', 'audio', 'video', 'localizacao', 'contato', 'template')),
    
    -- Metadados da mensagem
    canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'chat', 'telefone')),
    direcao VARCHAR(10) DEFAULT 'entrada' CHECK (direcao IN ('entrada', 'saida')),
    
    -- Status da mensagem
    status VARCHAR(20) DEFAULT 'enviada' CHECK (status IN ('enviada', 'entregue', 'lida', 'erro', 'pendente')),
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    
    -- Dados de mídia (se aplicável)
    midia_url TEXT,
    midia_tipo VARCHAR(50),
    midia_tamanho INTEGER,
    midia_nome VARCHAR(255),
    
    -- WhatsApp específico
    whatsapp_message_id VARCHAR(255),
    whatsapp_status VARCHAR(20),
    
    -- Resposta/Thread
    resposta_para UUID REFERENCES mensagens(id),
    
    -- Metadados adicionais
    metadados JSONB DEFAULT '{}',
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Etiquetas (Tags)
CREATE TABLE IF NOT EXISTS etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    cor VARCHAR(7) DEFAULT '#007bff', -- Cor em hexadecimal
    categoria VARCHAR(50), -- categoria da etiqueta
    descricao TEXT,
    
    -- Configurações da etiqueta
    automatica BOOLEAN DEFAULT false,
    condicoes JSONB DEFAULT '{}', -- Condições para aplicação automática
    
    -- Ordem e visibilidade
    ordem INTEGER DEFAULT 0,
    visivel BOOLEAN DEFAULT true,
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento: Conversas x Etiquetas
CREATE TABLE IF NOT EXISTS conversa_etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
    aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
    aplicada_automaticamente BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(conversa_id, etiqueta_id)
);

-- Tabela de relacionamento: Mensagens x Etiquetas
CREATE TABLE IF NOT EXISTS mensagem_etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensagem_id UUID NOT NULL REFERENCES mensagens(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
    aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
    aplicada_automaticamente BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(mensagem_id, etiqueta_id)
);

-- Tabela de Configurações do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    
    -- Configurações da API
    api_url VARCHAR(255) NOT NULL,
    api_token TEXT NOT NULL,
    webhook_url VARCHAR(255),
    webhook_token VARCHAR(255),
    
    -- Configurações do número
    numero_telefone VARCHAR(20) NOT NULL,
    nome_exibicao VARCHAR(100),
    
    -- Status e configurações
    ativo BOOLEAN DEFAULT true,
    webhook_verificado BOOLEAN DEFAULT false,
    
    -- Configurações de mensagens
    configuracoes JSONB DEFAULT '{
        "auto_resposta": false,
        "mensagem_boas_vindas": null,
        "mensagem_fora_horario": null,
        "horario_funcionamento": {
            "ativo": false,
            "segunda": {"inicio": "09:00", "fim": "18:00"},
            "terca": {"inicio": "09:00", "fim": "18:00"},
            "quarta": {"inicio": "09:00", "fim": "18:00"},
            "quinta": {"inicio": "09:00", "fim": "18:00"},
            "sexta": {"inicio": "09:00", "fim": "18:00"},
            "sabado": null,
            "domingo": null
        }
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Templates do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'UTILITY' CHECK (categoria IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    idioma VARCHAR(10) DEFAULT 'pt_BR',
    
    -- Conteúdo do template
    cabecalho TEXT,
    corpo TEXT NOT NULL,
    rodape TEXT,
    
    -- Botões (se aplicável)
    botoes JSONB DEFAULT '[]',
    
    -- Status no WhatsApp
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED')),
    whatsapp_template_id VARCHAR(255),
    
    -- Variáveis do template
    variaveis JSONB DEFAULT '[]',
    
    -- Uso e estatísticas
    total_usos INTEGER DEFAULT 0,
    ultima_utilizacao TIMESTAMP WITH TIME ZONE,
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- =====================================================

-- Índices para Agentes
CREATE INDEX IF NOT EXISTS idx_agentes_email ON agentes(email);
CREATE INDEX IF NOT EXISTS idx_agentes_status ON agentes(status);
CREATE INDEX IF NOT EXISTS idx_agentes_departamento ON agentes(departamento);
CREATE INDEX IF NOT EXISTS idx_agentes_ativo ON agentes(ativo);

-- Índices para Conversas
CREATE INDEX IF NOT EXISTS idx_conversas_cliente_id ON conversas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_agente_id ON conversas(agente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_status ON conversas(status);
CREATE INDEX IF NOT EXISTS idx_conversas_prioridade ON conversas(prioridade);
CREATE INDEX IF NOT EXISTS idx_conversas_canal ON conversas(canal);
CREATE INDEX IF NOT EXISTS idx_conversas_ultima_atividade ON conversas(ultima_atividade);
CREATE INDEX IF NOT EXISTS idx_conversas_created_at ON conversas(created_at);

-- Índices para Mensagens
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_tipo, remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_tipo ON mensagens(tipo);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON mensagens(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_lida ON mensagens(lida);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);
CREATE INDEX IF NOT EXISTS idx_mensagens_whatsapp_id ON mensagens(whatsapp_message_id);

-- Índices para Etiquetas
CREATE INDEX IF NOT EXISTS idx_etiquetas_categoria ON etiquetas(categoria);
CREATE INDEX IF NOT EXISTS idx_etiquetas_automatica ON etiquetas(automatica);
CREATE INDEX IF NOT EXISTS idx_etiquetas_ativo ON etiquetas(ativo);

-- Índices para relacionamentos
CREATE INDEX IF NOT EXISTS idx_conversa_etiquetas_conversa ON conversa_etiquetas(conversa_id);
CREATE INDEX IF NOT EXISTS idx_conversa_etiquetas_etiqueta ON conversa_etiquetas(etiqueta_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_etiquetas_mensagem ON mensagem_etiquetas(mensagem_id);
CREATE INDEX IF NOT EXISTS idx_mensagem_etiquetas_etiqueta ON mensagem_etiquetas(etiqueta_id);

-- Índices para WhatsApp
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_ativo ON whatsapp_config(ativo);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_categoria ON whatsapp_templates(categoria);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_agentes_updated_at BEFORE UPDATE ON agentes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversas_updated_at BEFORE UPDATE ON conversas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensagens_updated_at BEFORE UPDATE ON mensagens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_etiquetas_updated_at BEFORE UPDATE ON etiquetas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON whatsapp_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar estatísticas do agente
CREATE OR REPLACE FUNCTION atualizar_estatisticas_agente(agente_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE agentes 
    SET estatisticas = jsonb_build_object(
        'total_conversas', (
            SELECT COUNT(*) FROM conversas WHERE agente_id = agente_uuid
        ),
        'conversas_resolvidas', (
            SELECT COUNT(*) FROM conversas WHERE agente_id = agente_uuid AND status = 'fechada'
        ),
        'tempo_medio_resposta', (
            SELECT COALESCE(AVG(tempo_primeira_resposta), 0) FROM conversas WHERE agente_id = agente_uuid
        ),
        'avaliacao_media', (
            SELECT COALESCE(AVG(avaliacao), 0) FROM conversas WHERE agente_id = agente_uuid AND avaliacao IS NOT NULL
        ),
        'total_avaliacoes', (
            SELECT COUNT(*) FROM conversas WHERE agente_id = agente_uuid AND avaliacao IS NOT NULL
        )
    )
    WHERE id = agente_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contadores de mensagens na conversa
CREATE OR REPLACE FUNCTION atualizar_contadores_conversa()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversas 
        SET 
            total_mensagens = total_mensagens + 1,
            mensagens_agente = CASE WHEN NEW.remetente_tipo = 'agente' THEN mensagens_agente + 1 ELSE mensagens_agente END,
            mensagens_cliente = CASE WHEN NEW.remetente_tipo = 'cliente' THEN mensagens_cliente + 1 ELSE mensagens_cliente END,
            ultima_atividade = NOW(),
            ultima_mensagem_id = NEW.id
        WHERE id = NEW.conversa_id;
        
        -- Se é a primeira mensagem, definir como primeira_mensagem_id
        UPDATE conversas 
        SET primeira_mensagem_id = NEW.id 
        WHERE id = NEW.conversa_id AND primeira_mensagem_id IS NULL;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para atualizar contadores
CREATE TRIGGER trigger_atualizar_contadores_conversa 
    AFTER INSERT ON mensagens 
    FOR EACH ROW EXECUTE FUNCTION atualizar_contadores_conversa();

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir etiquetas padrão
INSERT INTO etiquetas (nome, cor, categoria, descricao) VALUES
('Urgente', '#dc3545', 'prioridade', 'Para casos que precisam de atenção imediata'),
('Resolvido', '#28a745', 'status', 'Conversa foi resolvida com sucesso'),
('Aguardando Cliente', '#ffc107', 'status', 'Aguardando resposta do cliente'),
('Suporte Técnico', '#007bff', 'departamento', 'Questões técnicas e de suporte'),
('Vendas', '#17a2b8', 'departamento', 'Questões relacionadas a vendas'),
('Reclamação', '#fd7e14', 'tipo', 'Reclamações e problemas reportados'),
('Elogio', '#20c997', 'tipo', 'Elogios e feedback positivo'),
('Dúvida', '#6f42c1', 'tipo', 'Dúvidas gerais dos clientes')
ON CONFLICT (nome) DO NOTHING;

-- Inserir configuração padrão do WhatsApp
INSERT INTO whatsapp_config (
    nome, 
    api_url, 
    api_token, 
    numero_telefone, 
    nome_exibicao,
    ativo
) VALUES (
    'Configuração Principal',
    'https://api.whatsapp.com/v1',
    'TOKEN_PLACEHOLDER',
    '5511999999999',
    'EvolutechCRM',
    false
) ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE agentes IS 'Tabela de agentes de atendimento do sistema';
COMMENT ON TABLE conversas IS 'Tabela de conversas entre clientes e agentes';
COMMENT ON TABLE mensagens IS 'Tabela de mensagens das conversas';
COMMENT ON TABLE etiquetas IS 'Tabela de etiquetas/tags para organização';
COMMENT ON TABLE conversa_etiquetas IS 'Relacionamento entre conversas e etiquetas';
COMMENT ON TABLE mensagem_etiquetas IS 'Relacionamento entre mensagens e etiquetas';
COMMENT ON TABLE whatsapp_config IS 'Configurações de integração com WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates de mensagens do WhatsApp';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================