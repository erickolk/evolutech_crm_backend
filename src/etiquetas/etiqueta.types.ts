export interface Etiqueta {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  icone?: string;
  categoria?: 'geral' | 'prioridade' | 'departamento' | 'status' | 'produto' | 'problema';
  ativa: boolean;
  ordem: number;
  uso_automatico?: boolean;
  regras_automaticas?: {
    palavras_chave?: string[];
    remetente_tipo?: 'cliente' | 'agente' | 'sistema';
    condicoes?: {
      campo: string;
      operador: 'contem' | 'igual' | 'diferente' | 'maior' | 'menor';
      valor: string;
    }[];
  };
  estatisticas?: {
    total_usos: number;
    usos_mes_atual: number;
    ultima_utilizacao?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateEtiquetaRequest {
  nome: string;
  descricao?: string;
  cor: string;
  icone?: string;
  categoria?: 'geral' | 'prioridade' | 'departamento' | 'status' | 'produto' | 'problema';
  ordem?: number;
  uso_automatico?: boolean;
  regras_automaticas?: {
    palavras_chave?: string[];
    remetente_tipo?: 'cliente' | 'agente' | 'sistema';
    condicoes?: {
      campo: string;
      operador: 'contem' | 'igual' | 'diferente' | 'maior' | 'menor';
      valor: string;
    }[];
  };
}

export interface UpdateEtiquetaRequest {
  nome?: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  categoria?: 'geral' | 'prioridade' | 'departamento' | 'status' | 'produto' | 'problema';
  ordem?: number;
  ativa?: boolean;
  uso_automatico?: boolean;
  regras_automaticas?: {
    palavras_chave?: string[];
    remetente_tipo?: 'cliente' | 'agente' | 'sistema';
    condicoes?: {
      campo: string;
      operador: 'contem' | 'igual' | 'diferente' | 'maior' | 'menor';
      valor: string;
    }[];
  };
}

export interface EtiquetaResponse extends Etiqueta {
  conversas_ativas?: number;
  mensagens_marcadas?: number;
}

export interface EtiquetaListResponse {
  etiquetas: EtiquetaResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface EtiquetaFilters {
  nome?: string;
  categoria?: 'geral' | 'prioridade' | 'departamento' | 'status' | 'produto' | 'problema';
  ativa?: boolean;
  uso_automatico?: boolean;
  cor?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface EtiquetaStats {
  total_etiquetas: number;
  etiquetas_ativas: number;
  etiquetas_automaticas: number;
  categorias: {
    categoria: string;
    quantidade: number;
  }[];
  mais_utilizadas: {
    etiqueta_id: string;
    etiqueta_nome: string;
    total_usos: number;
  }[];
}

// Relacionamentos entre etiquetas e outros recursos
export interface ConversaEtiqueta {
  id: string;
  conversa_id: string;
  etiqueta_id: string;
  aplicada_por?: string; // ID do agente que aplicou
  aplicada_automaticamente: boolean;
  created_at: string;
}

export interface MensagemEtiqueta {
  id: string;
  mensagem_id: string;
  etiqueta_id: string;
  aplicada_por?: string; // ID do agente que aplicou
  aplicada_automaticamente: boolean;
  created_at: string;
}

export interface AplicarEtiquetaRequest {
  etiqueta_id: string;
  aplicada_por?: string;
  aplicada_automaticamente?: boolean;
}

export interface RemoverEtiquetaRequest {
  etiqueta_id: string;
  removida_por?: string;
}

export interface EtiquetasConversaResponse {
  conversa_id: string;
  etiquetas: {
    id: string;
    nome: string;
    cor: string;
    icone?: string;
    categoria?: string;
    aplicada_por?: string;
    aplicada_automaticamente: boolean;
    created_at: string;
  }[];
}

export interface EtiquetasMensagemResponse {
  mensagem_id: string;
  etiquetas: {
    id: string;
    nome: string;
    cor: string;
    icone?: string;
    categoria?: string;
    aplicada_por?: string;
    aplicada_automaticamente: boolean;
    created_at: string;
  }[];
}

export interface ReorganizarEtiquetasRequest {
  etiquetas: {
    id: string;
    ordem: number;
  }[];
}

export interface EtiquetaAutomaticaMatch {
  etiqueta_id: string;
  etiqueta_nome: string;
  motivo: string;
  confianca: number; // 0-100
  regra_aplicada: string;
}