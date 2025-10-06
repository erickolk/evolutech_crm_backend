export interface Fornecedor {
  id?: string;
  created_at?: string;
  nome_fantasia: string;
  razao_social?: string | null;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  deleted_at?: string | null;
}