export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  telefone?: string;
  role_id: string;
  ativo: boolean;
  ultimo_login?: Date;
  tentativas_login: number;
  bloqueado_ate?: Date;
  token_reset_senha?: string;
  token_reset_expira?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  role_id: string;
}

export interface UpdateUsuarioRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  role_id?: string;
  ativo?: boolean;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: {
    id: string;
    nome: string;
    descricao: string;
    permissoes: string[];
  };
  ativo: boolean;
  ultimo_login?: Date;
  tentativas_login: number;
  bloqueado_ate?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioListResponse {
  usuarios: UsuarioResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangeRoleRequest {
  role_id: string;
  motivo?: string;
}

export interface UnlockUserRequest {
  motivo: string;
}

export interface UsuarioFilters {
  nome?: string;
  email?: string;
  role_id?: string;
  ativo?: boolean;
  bloqueado?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'nome' | 'email' | 'created_at' | 'ultimo_login';
  orderDirection?: 'asc' | 'desc';
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export interface UserActivity {
  id: string;
  usuario_id: string;
  action: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

export interface UserStats {
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_bloqueados: number;
  logins_hoje: number;
  usuarios_por_role: {
    role_nome: string;
    count: number;
  }[];
}