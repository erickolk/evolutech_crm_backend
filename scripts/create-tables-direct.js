import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dceaogrgifgvhzvpbznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCustomerServiceTables() {
  try {
    console.log('🚀 Criando tabelas do sistema de atendimento...\n');

    // Primeiro, vamos verificar se as tabelas já existem
    console.log('🔍 Verificando tabelas existentes...');
    
    // Criar tabela de agentes usando insert/upsert para testar conectividade
    console.log('📋 Testando conectividade com Supabase...');
    
    // Vamos tentar uma abordagem diferente - usar o SQL Editor do Supabase
    // Primeiro, vamos verificar se conseguimos acessar as tabelas existentes
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas existentes:', tablesError);
      console.log('\n💡 Sugestão: Execute os comandos SQL manualmente no Supabase Dashboard');
      return false;
    }

    console.log('✅ Conectividade com Supabase OK!');
    console.log('📊 Tabelas existentes:', existingTables?.map(t => t.table_name).join(', '));

    // Como não podemos executar DDL diretamente, vamos criar um arquivo SQL
    // que o usuário pode executar no Supabase Dashboard
    console.log('\n📝 Gerando arquivo SQL para execução manual...');
    
    const sqlContent = `-- Script para criar tabelas do sistema de atendimento
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Tabela de Agentes
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

-- 2. Tabela de Conversas
CREATE TABLE IF NOT EXISTS conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
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

-- 3. Tabela de Mensagens
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

-- 4. Tabela de Etiquetas
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

-- 5. Tabela de Relacionamento Conversa-Etiquetas
CREATE TABLE IF NOT EXISTS conversa_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
  aplicada_automaticamente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversa_id, etiqueta_id)
);

-- 6. Tabela de Relacionamento Mensagem-Etiquetas
CREATE TABLE IF NOT EXISTS mensagem_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES mensagens(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
  aplicada_automaticamente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mensagem_id, etiqueta_id)
);

-- 7. Tabela de Configuração WhatsApp
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

-- 8. Tabela de Templates WhatsApp
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

-- 9. Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordem_servicos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
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

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_agentes_email ON agentes(email);
CREATE INDEX IF NOT EXISTS idx_agentes_status ON agentes(status);
CREATE INDEX IF NOT EXISTS idx_conversas_cliente_id ON conversas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_agente_id ON conversas(agente_id);
CREATE INDEX IF NOT EXISTS idx_conversas_status ON conversas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_tipo, remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);
CREATE INDEX IF NOT EXISTS idx_pagamentos_os_id ON pagamentos(os_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente_id ON pagamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agentes_updated_at BEFORE UPDATE ON agentes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversas_updated_at BEFORE UPDATE ON conversas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensagens_updated_at BEFORE UPDATE ON mensagens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_etiquetas_updated_at BEFORE UPDATE ON etiquetas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON whatsapp_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais para etiquetas
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

-- Comentários nas tabelas
COMMENT ON TABLE agentes IS 'Agentes de atendimento ao cliente';
COMMENT ON TABLE conversas IS 'Conversas entre clientes e agentes';
COMMENT ON TABLE mensagens IS 'Mensagens das conversas';
COMMENT ON TABLE etiquetas IS 'Tags para organização e categorização';
COMMENT ON TABLE conversa_etiquetas IS 'Relacionamento entre conversas e etiquetas';
COMMENT ON TABLE mensagem_etiquetas IS 'Relacionamento entre mensagens e etiquetas';
COMMENT ON TABLE whatsapp_config IS 'Configurações de integração com WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates de mensagens do WhatsApp';
COMMENT ON TABLE pagamentos IS 'Controle de pagamentos das ordens de serviço';`;

    // Salvar o arquivo SQL
    const fs = await import('fs');
    await fs.promises.writeFile('scripts/customer-service-tables.sql', sqlContent);
    
    console.log('✅ Arquivo SQL gerado: scripts/customer-service-tables.sql');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o conteúdo do arquivo customer-service-tables.sql');
    console.log('4. Verifique se todas as tabelas foram criadas com sucesso');
    
    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

// Executar o script
createCustomerServiceTables()
  .then(success => {
    if (success) {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Falha na execução do script.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Erro fatal:', err);
    process.exit(1);
  });