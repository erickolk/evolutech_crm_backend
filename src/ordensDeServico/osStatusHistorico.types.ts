import { StatusOS } from './os.types.js';

// Interface principal para o histórico de status
export interface OSStatusHistorico {
  id?: string;
  os_id: string;
  status_anterior?: StatusOS | null;
  status_novo: StatusOS;
  usuario_id: string;
  motivo: string;
  observacoes?: string | null;
  data_mudanca: string;
  created_at?: string;
}

// Interface para criação de registro de histórico
export interface CreateOSStatusHistoricoRequest {
  os_id: string;
  status_anterior?: StatusOS;
  status_novo: StatusOS;
  usuario_id: string;
  motivo: string;
  observacoes?: string;
}

// Interface para resposta da API
export interface OSStatusHistoricoResponse {
  id: string;
  os_id: string;
  status_anterior?: StatusOS;
  status_novo: StatusOS;
  usuario_id: string;
  usuario_nome?: string; // Nome do usuário que fez a mudança
  motivo: string;
  observacoes?: string;
  data_mudanca: string;
  created_at: string;
}

// Interface para filtros de consulta
export interface OSStatusHistoricoFilters {
  os_id?: string;
  status_anterior?: StatusOS;
  status_novo?: StatusOS;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

// Interface para resposta de listagem
export interface OSStatusHistoricoListResponse {
  historicos: OSStatusHistoricoResponse[];
  total: number;
  page: number;
  limit: number;
}

// Interface para estatísticas de mudanças de status
export interface StatusChangeStats {
  total_mudancas: number;
  mudancas_por_status: Record<StatusOS, number>;
  mudancas_por_usuario: Record<string, number>;
  tempo_medio_por_status: Record<StatusOS, number>; // em horas
  mudancas_recentes: OSStatusHistoricoResponse[];
}

// Interface para timeline de uma OS específica
export interface OSTimeline {
  os_id: string;
  historicos: OSStatusHistoricoResponse[];
  tempo_total_processo: number; // em horas
  status_atual: StatusOS;
  data_inicio: string;
  data_ultima_mudanca: string;
}

// Motivos padrão para mudanças de status
export const MOTIVOS_PADRAO = {
  RECEBIMENTO: 'Ordem de serviço recebida',
  INICIO_DIAGNOSTICO: 'Iniciado diagnóstico técnico',
  DIAGNOSTICO_CONCLUIDO: 'Diagnóstico técnico concluído',
  AGUARDANDO_PECAS: 'Aguardando chegada de peças',
  PECAS_CHEGARAM: 'Peças necessárias chegaram',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação do cliente',
  APROVACAO_RECEBIDA: 'Aprovação do cliente recebida',
  APROVACAO_NEGADA: 'Cliente não aprovou o orçamento',
  INICIO_REPARO: 'Iniciado reparo do equipamento',
  REPARO_CONCLUIDO: 'Reparo concluído',
  INICIO_TESTE: 'Iniciado teste do equipamento',
  TESTE_APROVADO: 'Teste realizado com sucesso',
  TESTE_REPROVADO: 'Teste identificou problemas',
  PRONTO_RETIRADA: 'Equipamento pronto para retirada',
  ENTREGUE: 'Equipamento entregue ao cliente',
  CANCELAMENTO: 'Ordem de serviço cancelada',
  GARANTIA: 'Equipamento retornou em garantia'
} as const;

// Validações de transição
export interface TransitionValidation {
  isValid: boolean;
  message?: string;
  requiredFields?: string[];
}

// Interface para notificações automáticas
export interface StatusNotification {
  os_id: string;
  status_novo: StatusOS;
  cliente_id: string;
  tipo_notificacao: 'EMAIL' | 'SMS' | 'WHATSAPP';
  mensagem: string;
  enviado: boolean;
  data_envio?: string;
}