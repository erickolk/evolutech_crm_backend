// Usamos 'enum' para criar um tipo seguro para um conjunto de valores constantes.
// Isso evita erros de digitação e deixa o código mais legível.
export enum StatusOS {
  AGUARDANDO_EQUIPAMENTO = 'Aguardando Equipamento',
  EM_ANALISE = 'Em Análise',
  AGUARDANDO_AUTORIZACAO = 'Aguardando Autorização',
  EM_EXECUCAO = 'Em Execução',
  PRONTO_PARA_RETIRADA = 'Pronto para Retirada',
  ENTREGUE = 'Entregue',
  CANCELADO = 'Cancelado'
}

export enum Prioridade {
  BAIXA = 'Baixa',
  NORMAL = 'Normal',
  URGENTE = 'Urgente'
}

// A interface principal para a Ordem de Serviço
export interface OrdemDeServico {
  id?: string;
  created_at?: string;

  // Chaves estrangeiras que ligam a OS a outras tabelas
  cliente_id: string;
  dispositivo_id: string;
  tecnico_responsavel_id?: string | null;

  // Campos controlados pelos Enums
  status_fluxo: StatusOS;
  prioridade: Prioridade;

  // Campos de texto descritivos
  relato_cliente?: string | null;
  diagnostico_tecnico?: string | null;
  acessorios_inclusos?: string | null;

  // Detalhes do orçamento e AOS
  orcamento_detalhado?: any | null; // Usaremos 'any' por enquanto, como planejado
  numero_aos?: string | null;
  
  // Controle do Soft Delete
  deleted_at?: string | null;
}