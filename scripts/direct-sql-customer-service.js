import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://dceaogrgifgvhzvpbznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeCustomerServiceTables() {
  try {
    console.log('🚀 Criando tabelas do sistema de atendimento...\n');

    // 1. Criar tabela de agentes
    console.log('📋 Criando tabela de agentes...');
    const { error: agentesError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (agentesError) {
      console.error('❌ Erro ao criar tabela agentes:', agentesError);
      return false;
    }
    console.log('✅ Tabela agentes criada com sucesso!');

    // 2. Criar tabela de conversas
    console.log('💬 Criando tabela de conversas...');
    const { error: conversasError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (conversasError) {
      console.error('❌ Erro ao criar tabela conversas:', conversasError);
      return false;
    }
    console.log('✅ Tabela conversas criada com sucesso!');

    // 3. Criar tabela de mensagens
    console.log('📨 Criando tabela de mensagens...');
    const { error: mensagensError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (mensagensError) {
      console.error('❌ Erro ao criar tabela mensagens:', mensagensError);
      return false;
    }
    console.log('✅ Tabela mensagens criada com sucesso!');

    // 4. Criar tabela de etiquetas
    console.log('🏷️ Criando tabela de etiquetas...');
    const { error: etiquetasError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (etiquetasError) {
      console.error('❌ Erro ao criar tabela etiquetas:', etiquetasError);
      return false;
    }
    console.log('✅ Tabela etiquetas criada com sucesso!');

    // 5. Criar tabelas de relacionamento
    console.log('🔗 Criando tabelas de relacionamento...');
    const { error: relacionamentosError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS conversa_etiquetas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
          etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
          aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
          aplicada_automaticamente BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(conversa_id, etiqueta_id)
        );

        CREATE TABLE IF NOT EXISTS mensagem_etiquetas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          mensagem_id UUID NOT NULL REFERENCES mensagens(id) ON DELETE CASCADE,
          etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
          aplicada_por UUID REFERENCES agentes(id) ON DELETE SET NULL,
          aplicada_automaticamente BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(mensagem_id, etiqueta_id)
        );
      `
    });

    if (relacionamentosError) {
      console.error('❌ Erro ao criar tabelas de relacionamento:', relacionamentosError);
      return false;
    }
    console.log('✅ Tabelas de relacionamento criadas com sucesso!');

    // 6. Criar tabelas do WhatsApp
    console.log('📱 Criando tabelas do WhatsApp...');
    const { error: whatsappError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (whatsappError) {
      console.error('❌ Erro ao criar tabelas do WhatsApp:', whatsappError);
      return false;
    }
    console.log('✅ Tabelas do WhatsApp criadas com sucesso!');

    // 7. Criar índices
    console.log('📊 Criando índices para otimização...');
    const { error: indicesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_agentes_email ON agentes(email);
        CREATE INDEX IF NOT EXISTS idx_agentes_status ON agentes(status);
        CREATE INDEX IF NOT EXISTS idx_conversas_cliente_id ON conversas(cliente_id);
        CREATE INDEX IF NOT EXISTS idx_conversas_agente_id ON conversas(agente_id);
        CREATE INDEX IF NOT EXISTS idx_conversas_status ON conversas(status);
        CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_id ON mensagens(conversa_id);
        CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_tipo, remetente_id);
        CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON mensagens(created_at);
      `
    });

    if (indicesError) {
      console.error('❌ Erro ao criar índices:', indicesError);
      return false;
    }
    console.log('✅ Índices criados com sucesso!');

    // 8. Inserir dados iniciais
    console.log('🌱 Inserindo dados iniciais...');
    const { error: seedError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (seedError) {
      console.error('❌ Erro ao inserir dados iniciais:', seedError);
      return false;
    }
    console.log('✅ Dados iniciais inseridos com sucesso!');

    console.log('\n🎉 Todas as tabelas do sistema de atendimento foram criadas com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('   • agentes - Agentes de atendimento');
    console.log('   • conversas - Conversas com clientes');
    console.log('   • mensagens - Mensagens das conversas');
    console.log('   • etiquetas - Tags para organização');
    console.log('   • conversa_etiquetas - Relacionamento conversas/tags');
    console.log('   • mensagem_etiquetas - Relacionamento mensagens/tags');
    console.log('   • whatsapp_config - Configurações WhatsApp');
    console.log('   • whatsapp_templates - Templates WhatsApp');

    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

// Executar o script
executeCustomerServiceTables()
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