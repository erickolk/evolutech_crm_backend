export interface MessageTemplate {
  id: string;
  nome: string;
  conteudo: string;
  variaveis: string[]; // Lista de variáveis disponíveis no template
  categoria: TemplateCategory;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateTemplateRequest {
  nome: string;
  conteudo: string;
  variaveis: string[];
  categoria: TemplateCategory;
  ativo?: boolean;
}

export interface UpdateTemplateRequest {
  nome?: string;
  conteudo?: string;
  variaveis?: string[];
  categoria?: TemplateCategory;
  ativo?: boolean;
}

export interface TemplateVariable {
  nome: string;
  valor: string;
  tipo: VariableType;
}

export interface ProcessTemplateRequest {
  template_id: string;
  variaveis: TemplateVariable[];
}

export interface ProcessedTemplate {
  conteudo_processado: string;
  variaveis_utilizadas: string[];
  variaveis_faltantes: string[];
}

export enum TemplateCategory {
  BOAS_VINDAS = 'boas_vindas',
  FOLLOW_UP = 'follow_up',
  PROMOCIONAL = 'promocional',
  SUPORTE = 'suporte',
  COBRANCA = 'cobranca',
  AGENDAMENTO = 'agendamento',
  CONFIRMACAO = 'confirmacao',
  DESPEDIDA = 'despedida',
  PERSONALIZADO = 'personalizado'
}

export enum VariableType {
  TEXTO = 'texto',
  NUMERO = 'numero',
  DATA = 'data',
  MOEDA = 'moeda',
  TELEFONE = 'telefone',
  EMAIL = 'email'
}

export interface TemplateFilters {
  categoria?: TemplateCategory;
  ativo?: boolean;
  search?: string;
}

export interface TemplateResponse {
  templates: MessageTemplate[];
  total: number;
  page: number;
  limit: number;
}

// Variáveis predefinidas do sistema
export interface SystemVariables {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  agente_nome: string;
  empresa_nome: string;
  data_atual: string;
  hora_atual: string;
  orcamento_numero?: string;
  orcamento_valor?: string;
  os_numero?: string;
  produto_nome?: string;
  servico_nome?: string;
}