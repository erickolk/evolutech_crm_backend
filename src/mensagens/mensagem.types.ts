export interface Mensagem {
  id: string;
  conversa_id: string;
  remetente_tipo: 'cliente' | 'agente' | 'sistema';
  remetente_id?: string; // ID do agente ou sistema, null se for cliente
  remetente_nome: string;
  conteudo: string;
  tipo_conteudo: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao';
  metadata?: {
    arquivo_url?: string;
    arquivo_nome?: string;
    arquivo_tamanho?: number;
    arquivo_tipo?: string;
    localizacao?: {
      latitude: number;
      longitude: number;
      endereco?: string;
    };
    whatsapp_message_id?: string;
    template_usado?: string;
  };
  status_leitura: 'enviada' | 'entregue' | 'lida';
  lida_em?: Date;
  respondida: boolean;
  resposta_de?: string; // ID da mensagem que está sendo respondida
  created_at: Date;
  updated_at: Date;
}

export interface CreateMensagemRequest {
  conversa_id: string;
  remetente_tipo: 'cliente' | 'agente' | 'sistema';
  remetente_id?: string;
  remetente_nome: string;
  conteudo: string;
  tipo_conteudo?: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao';
  metadata?: {
    arquivo_url?: string;
    arquivo_nome?: string;
    arquivo_tamanho?: number;
    arquivo_tipo?: string;
    localizacao?: {
      latitude: number;
      longitude: number;
      endereco?: string;
    };
    whatsapp_message_id?: string;
    template_usado?: string;
  };
  resposta_de?: string;
}

export interface UpdateMensagemRequest {
  conteudo?: string;
  status_leitura?: 'enviada' | 'entregue' | 'lida';
  respondida?: boolean;
  metadata?: any;
}

export interface MensagemResponse {
  id: string;
  conversa: {
    id: string;
    cliente_nome: string;
    agente_nome?: string;
    status: string;
  };
  remetente_tipo: string;
  remetente_id?: string;
  remetente_nome: string;
  conteudo: string;
  tipo_conteudo: string;
  metadata?: any;
  status_leitura: string;
  lida_em?: Date;
  respondida: boolean;
  resposta_de?: {
    id: string;
    conteudo: string;
    remetente_nome: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface MensagemListResponse {
  mensagens: MensagemResponse[];
  total: number;
  page: number;
  limit: number;
  conversa_info: {
    id: string;
    cliente_nome: string;
    agente_nome?: string;
    status: string;
  };
}

export interface MensagemFilters {
  conversa_id?: string;
  remetente_tipo?: 'cliente' | 'agente' | 'sistema';
  remetente_id?: string;
  tipo_conteudo?: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao';
  status_leitura?: 'enviada' | 'entregue' | 'lida';
  apenas_nao_lidas?: boolean;
  data_inicio?: Date;
  data_fim?: Date;
  busca_conteudo?: string;
  page?: number;
  limit?: number;
  orderBy?: 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
}

export interface MarcarComoLidaRequest {
  lida_por?: string; // ID do usuário que marcou como lida
}

export interface EnviarMensagemRequest {
  conversa_id: string;
  conteudo: string;
  tipo_conteudo?: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'localizacao';
  remetente_id?: string; // ID do agente que está enviando
  remetente_nome: string;
  metadata?: any;
  resposta_de?: string;
}

export interface MensagemStats {
  total_mensagens: number;
  mensagens_hoje: number;
  mensagens_nao_lidas: number;
  tempo_resposta_medio: number; // em minutos
  mensagens_por_tipo: Record<string, number>;
  mensagens_por_canal: Record<string, number>;
  agentes_mais_ativos: Array<{
    agente_id: string;
    agente_nome: string;
    total_mensagens: number;
  }>;
}

export interface AnexoUpload {
  arquivo: File | Buffer;
  nome_original: string;
  tipo_mime: string;
  tamanho: number;
}

export interface AnexoResponse {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
  upload_id: string;
}