export interface ComunicacaoHistorico {
  id: string;
  cliente_id: string;
  ordem_servico_id?: string;
  canal: CanalComunicacao;
  tipo_interacao: TipoInteracao;
  remetente: string;
  destinatario: string;
  conteudo: string;
  metadata?: Record<string, any>;
  template_usado?: string;
  usuario_responsavel_id?: string;
  agente_ia: boolean;
  status_leitura: StatusLeitura;
  created_at: string;
  updated_at: string;
}

export interface CreateComunicacaoRequest {
  cliente_id: string;
  ordem_servico_id?: string;
  canal: CanalComunicacao;
  tipo_interacao: TipoInteracao;
  remetente: string;
  destinatario: string;
  conteudo: string;
  metadata?: Record<string, any>;
  template_usado?: string;
  usuario_responsavel_id?: string;
  agente_ia?: boolean;
  status_leitura?: StatusLeitura;
}

export interface UpdateComunicacaoRequest {
  status_leitura?: StatusLeitura;
  metadata?: Record<string, any>;
  usuario_responsavel_id?: string;
}

export interface ComunicacaoFilters {
  cliente_id?: string;
  ordem_servico_id?: string;
  canal?: CanalComunicacao;
  tipo_interacao?: TipoInteracao;
  agente_ia?: boolean;
  status_leitura?: StatusLeitura;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}

export interface ComunicacaoResponse {
  comunicacoes: ComunicacaoHistorico[];
  total: number;
  page: number;
  limit: number;
}

export interface ComunicacaoStats {
  total_comunicacoes: number;
  por_canal: Record<CanalComunicacao, number>;
  por_status: Record<StatusLeitura, number>;
  nao_lidas: number;
  processadas_ia: number;
  ultimas_24h: number;
}

export enum CanalComunicacao {
  WHATSAPP = 'whatsapp',
  TELEFONE = 'telefone',
  PRESENCIAL = 'presencial',
  EMAIL = 'email',
  SISTEMA = 'sistema'
}

export enum TipoInteracao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AUTOMATICA = 'automatica'
}

export enum StatusLeitura {
  NAO_LIDO = 'nao_lido',
  LIDO = 'lido',
  RESPONDIDO = 'respondido'
}

// Interfaces para integração com IA
export interface AgenteIARequest {
  cliente_whatsapp?: string;
  cliente_id?: string;
  conteudo: string;
  canal: CanalComunicacao;
  metadata?: Record<string, any>;
}

export interface AgenteIAResponse {
  resposta: string;
  template_usado?: string;
  acao_requerida?: 'escalar_humano' | 'agendar_followup' | 'consultar_dados';
  dados_consultados?: any;
  confianca: number; // 0-100
}

// Interfaces para consultas específicas da IA
export interface ClienteWhatsAppInfo {
  cliente_id: string;
  nome: string;
  telefone: string;
  email?: string;
  os_ativas: number;
  ultima_interacao?: string;
}

export interface OSStatusInfo {
  id: string;
  numero: string;
  cliente_nome: string;
  dispositivo_tipo: string;
  dispositivo_marca: string;
  status_atual: string;
  tecnico_nome?: string;
  data_prevista?: string;
  observacoes_cliente?: string;
  valor_orcamento?: number;
}

export interface ComunicacaoAggregate {
  cliente_id: string;
  cliente_nome: string;
  total_interacoes: number;
  ultima_interacao: string;
  canal_preferido: CanalComunicacao;
  nao_lidas: number;
  pendente_resposta: boolean;
}