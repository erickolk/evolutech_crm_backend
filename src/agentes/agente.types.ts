export interface Agente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'ocupado' | 'ausente';
  cargo?: string;
  departamento?: string;
  especialidades?: string[];
  max_conversas_simultaneas: number;
  conversas_ativas: number;
  ultima_atividade?: string;
  configuracoes?: {
    notificacoes_email?: boolean;
    notificacoes_push?: boolean;
    som_notificacao?: boolean;
    auto_aceitar_conversas?: boolean;
    mensagem_ausencia?: string;
  };
  estatisticas?: {
    total_conversas?: number;
    conversas_resolvidas?: number;
    tempo_medio_resposta?: number;
    avaliacao_media?: number;
    total_avaliacoes?: number;
  };
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgenteRequest {
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  cargo?: string;
  departamento?: string;
  especialidades?: string[];
  max_conversas_simultaneas?: number;
  configuracoes?: {
    notificacoes_email?: boolean;
    notificacoes_push?: boolean;
    som_notificacao?: boolean;
    auto_aceitar_conversas?: boolean;
    mensagem_ausencia?: string;
  };
}

export interface UpdateAgenteRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  avatar_url?: string;
  cargo?: string;
  departamento?: string;
  especialidades?: string[];
  max_conversas_simultaneas?: number;
  configuracoes?: {
    notificacoes_email?: boolean;
    notificacoes_push?: boolean;
    som_notificacao?: boolean;
    auto_aceitar_conversas?: boolean;
    mensagem_ausencia?: string;
  };
  ativo?: boolean;
}

export interface UpdateStatusRequest {
  status: 'online' | 'offline' | 'ocupado' | 'ausente';
  mensagem_ausencia?: string;
}

export interface AgenteResponse extends Agente {
  conversas_abertas?: number;
  conversas_pendentes?: number;
}

export interface AgenteListResponse {
  agentes: AgenteResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface AgenteFilters {
  nome?: string;
  email?: string;
  status?: 'online' | 'offline' | 'ocupado' | 'ausente';
  departamento?: string;
  cargo?: string;
  especialidade?: string;
  ativo?: boolean;
  disponivel_para_conversa?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface AgenteStats {
  total_agentes: number;
  agentes_online: number;
  agentes_offline: number;
  agentes_ocupados: number;
  agentes_ausentes: number;
  agentes_disponiveis: number;
  conversas_ativas_total: number;
  tempo_medio_resposta_geral: number;
  avaliacao_media_geral: number;
}

export interface AtribuicaoAutomaticaRequest {
  conversa_id: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  especialidade_requerida?: string;
  departamento_preferido?: string;
}

export interface AtribuicaoAutomaticaResponse {
  agente_id: string;
  agente_nome: string;
  motivo_atribuicao: string;
  tempo_estimado_resposta?: number;
}

export interface AgentePerformance {
  agente_id: string;
  agente_nome: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  metricas: {
    conversas_atendidas: number;
    conversas_resolvidas: number;
    taxa_resolucao: number;
    tempo_medio_resposta: number;
    tempo_medio_resolucao: number;
    avaliacao_media: number;
    total_avaliacoes: number;
    mensagens_enviadas: number;
    horas_online: number;
  };
}

export interface ConfiguracaoAgente {
  agente_id: string;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  som_notificacao: boolean;
  auto_aceitar_conversas: boolean;
  mensagem_ausencia?: string;
  horario_trabalho?: {
    segunda?: { inicio: string; fim: string; };
    terca?: { inicio: string; fim: string; };
    quarta?: { inicio: string; fim: string; };
    quinta?: { inicio: string; fim: string; };
    sexta?: { inicio: string; fim: string; };
    sabado?: { inicio: string; fim: string; };
    domingo?: { inicio: string; fim: string; };
  };
  fuso_horario?: string;
}