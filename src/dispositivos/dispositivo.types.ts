export interface Dispositivo {
  id?: string;
  created_at?: string;

  // Chave estrangeira obrigatória
  cliente_id: string; // Um dispositivo DEVE pertencer a um cliente

  // Informações do equipamento (opcionais na criação)
  tipo?: string | null;
  marca_modelo?: string | null;
  fotos_entrada?: string[] | null; // Usamos um array de texto para as URLs das fotos
  senha_equipamento?: string | null;
  
  // Controle do Soft Delete
  deleted_at?: string | null;
}