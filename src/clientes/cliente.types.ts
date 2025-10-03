export interface Cliente {
  id?: string; // Gerado pelo banco, opcional na criação
  created_at?: string; // Gerado pelo banco, opcional na criação

  // Dados Essenciais
  nome: string;
  cpf: string;
  whatsapp_id: string;

  // Endereço (opcionais)
  cep?: string | null;
  endereco?: string | null;
  numero_residencia?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  
  // Dados Adicionais (opcionais)
  data_nascimento?: string | null;

  // Dados de Pessoa Jurídica (opcionais)
  tipo_cliente?: 'Pessoa Física' | 'Pessoa Jurídica' | null;
  cnpj?: string | null;
  razao_social?: string | null;
}