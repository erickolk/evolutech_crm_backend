export interface Conversa {
  id: string;
  cliente_id: string;
  agente_id?: string;
  status: 'aberta' | 'em_andamento' | 'fechada' | 'aguardando_cliente' | 'aguardando_agente';
  canal: 'whatsapp' | 'telefone' | 'presencial' | 'email' | 'sistema';
  assunto?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  etiquetas?: string[]; // Array de IDs das etiquetas
  ultima_mensagem?: string;
  ultima_atividade: Date;
  tempo_resposta_medio?: number; // em minutos
  satisfacao_cliente?: number; // 1-5
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
  fechada_em?: Date;
  fechada_por?: string; // ID do usuário que fechou
}

export interface CreateConversaRequest {
  cliente_id: string;
  agente_id?: string;
  canal: 'whatsapp' | 'telefone' | 'presencial' | 'email' | 'sistema';
  assunto?: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  etiquetas?: string[];
  observacoes?: string;
}

export interface UpdateConversaRequest {
  agente_id?: string;
  status?: 'aberta' | 'em_andamento' | 'fechada' | 'aguardando_cliente' | 'aguardando_agente';
  assunto?: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  etiquetas?: string[];
  satisfacao_cliente?: number;
  observacoes?: string;
}

export interface ConversaResponse {
  id: string;
  cliente: {
    id: string;
    nome: string;
    whatsapp_id?: string;
    email?: string;
  };
  agente?: {
    id: string;
    nome: string;
    email: string;
  };
  status: string;
  canal: string;
  assunto?: string;
  prioridade: string;
  etiquetas?: Array<{
    id: string;
    nome: string;
    cor: string;
  }>;
  ultima_mensagem?: string;
  ultima_atividade: Date;
  tempo_resposta_medio?: number;
  satisfacao_cliente?: number;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
  fechada_em?: Date;
  fechada_por?: string;
  total_mensagens?: number;
  mensagens_nao_lidas?: number;
}

export interface ConversaListResponse {
  conversas: ConversaResponse[];
  total: number;
  page: number;
  limit: number;
  filtros_aplicados: ConversaFilters;
}

export interface ConversaFilters {
  cliente_id?: string;
  agente_id?: string;
  status?: 'aberta' | 'em_andamento' | 'fechada' | 'aguardando_cliente' | 'aguardando_agente';
  canal?: 'whatsapp' | 'telefone' | 'presencial' | 'email' | 'sistema';
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  etiqueta_id?: string;
  data_inicio?: Date;
  data_fim?: Date;
  apenas_nao_lidas?: boolean;
  apenas_sem_agente?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'created_at' | 'updated_at' | 'ultima_atividade' | 'prioridade';
  orderDirection?: 'asc' | 'desc';
}

export interface ConversaStats {
  total_conversas: number;
  conversas_abertas: number;
  conversas_em_andamento: number;
  conversas_aguardando: number;
  conversas_fechadas_hoje: number;
  tempo_resposta_medio: number;
  satisfacao_media: number;
  conversas_por_canal: Record<string, number>;
  conversas_por_prioridade: Record<string, number>;
}

export interface AtribuirAgenteRequest {
  agente_id: string;
  observacao?: string;
}

export interface FecharConversaRequest {
  motivo?: string;
  satisfacao_cliente?: number;
  observacoes?: string;
}