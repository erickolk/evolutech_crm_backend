export interface Role {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[];
  ativo: boolean;
  sistema: boolean; // Roles do sistema não podem ser deletadas
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateRoleRequest {
  nome: string;
  descricao: string;
  permissoes: string[];
}

export interface UpdateRoleRequest {
  nome?: string;
  descricao?: string;
  permissoes?: string[];
  ativo?: boolean;
}

export interface RoleResponse {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[];
  ativo: boolean;
  sistema: boolean;
  usuarios_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface RoleListResponse {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface RoleFilters {
  nome?: string;
  ativo?: boolean;
  sistema?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'nome' | 'created_at' | 'usuarios_count';
  orderDirection?: 'asc' | 'desc';
}

export interface Permission {
  id: string;
  nome: string;
  descricao: string;
  modulo: string;
  acao: string;
}

export interface PermissionGroup {
  modulo: string;
  permissions: Permission[];
}

export interface RolePermissionUpdate {
  role_id: string;
  permissoes: string[];
  motivo?: string;
}

export interface UserRoleHistory {
  id: string;
  usuario_id: string;
  role_anterior_id?: string;
  role_nova_id: string;
  motivo?: string;
  alterado_por: string;
  created_at: Date;
}

// Permissões padrão do sistema
export const PERMISSIONS = {
  // Usuários
  USUARIOS_LISTAR: 'usuarios:listar',
  USUARIOS_CRIAR: 'usuarios:criar',
  USUARIOS_EDITAR: 'usuarios:editar',
  USUARIOS_DELETAR: 'usuarios:deletar',
  USUARIOS_DESBLOQUEAR: 'usuarios:desbloquear',
  USUARIOS_ALTERAR_ROLE: 'usuarios:alterar_role',

  // Roles
  ROLES_LISTAR: 'roles:listar',
  ROLES_CRIAR: 'roles:criar',
  ROLES_EDITAR: 'roles:editar',
  ROLES_DELETAR: 'roles:deletar',
  ROLES_GERENCIAR_PERMISSOES: 'roles:gerenciar_permissoes',

  // Produtos
  PRODUTOS_LISTAR: 'produtos:listar',
  PRODUTOS_CRIAR: 'produtos:criar',
  PRODUTOS_EDITAR: 'produtos:editar',
  PRODUTOS_DELETAR: 'produtos:deletar',
  PRODUTOS_GERENCIAR_ESTOQUE: 'produtos:gerenciar_estoque',

  // Estoque
  ESTOQUE_LISTAR: 'estoque:listar',
  ESTOQUE_MOVIMENTAR: 'estoque:movimentar',
  ESTOQUE_AJUSTAR: 'estoque:ajustar',
  ESTOQUE_TRANSFERIR: 'estoque:transferir',
  ESTOQUE_RELATORIOS: 'estoque:relatorios',

  // Orçamentos
  ORCAMENTOS_LISTAR: 'orcamentos:listar',
  ORCAMENTOS_CRIAR: 'orcamentos:criar',
  ORCAMENTOS_EDITAR: 'orcamentos:editar',
  ORCAMENTOS_DELETAR: 'orcamentos:deletar',
  ORCAMENTOS_APROVAR: 'orcamentos:aprovar',
  ORCAMENTOS_REJEITAR: 'orcamentos:rejeitar',

  // Sistema
  SISTEMA_CONFIGURAR: 'sistema:configurar',
  SISTEMA_LOGS: 'sistema:logs',
  SISTEMA_BACKUP: 'sistema:backup',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

// Roles padrão do sistema
export const DEFAULT_ROLES = {
  ADMIN: {
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema',
    permissoes: Object.values(PERMISSIONS),
    sistema: true,
  },
  GERENTE: {
    nome: 'Gerente',
    descricao: 'Acesso de gerenciamento com algumas restrições',
    permissoes: [
      PERMISSIONS.USUARIOS_LISTAR,
      PERMISSIONS.USUARIOS_CRIAR,
      PERMISSIONS.USUARIOS_EDITAR,
      PERMISSIONS.USUARIOS_DESBLOQUEAR,
      PERMISSIONS.PRODUTOS_LISTAR,
      PERMISSIONS.PRODUTOS_CRIAR,
      PERMISSIONS.PRODUTOS_EDITAR,
      PERMISSIONS.PRODUTOS_GERENCIAR_ESTOQUE,
      PERMISSIONS.ESTOQUE_LISTAR,
      PERMISSIONS.ESTOQUE_MOVIMENTAR,
      PERMISSIONS.ESTOQUE_AJUSTAR,
      PERMISSIONS.ESTOQUE_TRANSFERIR,
      PERMISSIONS.ESTOQUE_RELATORIOS,
      PERMISSIONS.ORCAMENTOS_LISTAR,
      PERMISSIONS.ORCAMENTOS_CRIAR,
      PERMISSIONS.ORCAMENTOS_EDITAR,
      PERMISSIONS.ORCAMENTOS_APROVAR,
      PERMISSIONS.ORCAMENTOS_REJEITAR,
    ],
    sistema: true,
  },
  VENDEDOR: {
    nome: 'Vendedor',
    descricao: 'Acesso para vendas e consultas',
    permissoes: [
      PERMISSIONS.PRODUTOS_LISTAR,
      PERMISSIONS.ESTOQUE_LISTAR,
      PERMISSIONS.ORCAMENTOS_LISTAR,
      PERMISSIONS.ORCAMENTOS_CRIAR,
      PERMISSIONS.ORCAMENTOS_EDITAR,
    ],
    sistema: true,
  },
  ESTOQUISTA: {
    nome: 'Estoquista',
    descricao: 'Acesso para gerenciamento de estoque',
    permissoes: [
      PERMISSIONS.PRODUTOS_LISTAR,
      PERMISSIONS.PRODUTOS_GERENCIAR_ESTOQUE,
      PERMISSIONS.ESTOQUE_LISTAR,
      PERMISSIONS.ESTOQUE_MOVIMENTAR,
      PERMISSIONS.ESTOQUE_AJUSTAR,
      PERMISSIONS.ESTOQUE_TRANSFERIR,
      PERMISSIONS.ESTOQUE_RELATORIOS,
    ],
    sistema: true,
  },
} as const;