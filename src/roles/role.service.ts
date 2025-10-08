import { RoleRepository } from './role.repository';
import { UsuarioRepository } from '../usuarios/usuario.repository';
import { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RoleResponse, 
  RoleListResponse,
  RoleFilters,
  Permission,
  PermissionGroup,
  RolePermissionUpdate,
  UserRoleHistory,
  PERMISSIONS,
  DEFAULT_ROLES
} from './role.types';

export class RoleService {
  private roleRepository: RoleRepository;
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  async create(data: CreateRoleRequest, createdBy: string): Promise<RoleResponse> {
    // Validate permissions
    this.validatePermissions(data.permissoes);

    // Create role
    const role = await this.roleRepository.create(data);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: createdBy,
      action: 'role_created',
      details: { 
        role_id: role.id,
        role_name: role.nome,
        permissions: data.permissoes
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(role);
  }

  async findById(id: string): Promise<RoleResponse | null> {
    const role = await this.roleRepository.findById(id);
    if (!role) return null;

    return this.mapToResponse(role);
  }

  async findByName(nome: string): Promise<RoleResponse | null> {
    const role = await this.roleRepository.findByName(nome);
    if (!role) return null;

    return this.mapToResponse(role);
  }

  async findAll(filters: RoleFilters = {}): Promise<RoleListResponse> {
    const { roles, total } = await this.roleRepository.findAll(filters);

    const rolesResponse = roles.map(role => this.mapToResponse(role));

    return {
      roles: rolesResponse,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }

  async update(id: string, data: UpdateRoleRequest, updatedBy: string): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error('Role não encontrada');
    }

    // Check if it's a system role (cannot be modified)
    if (existingRole.sistema) {
      throw new Error('Roles do sistema não podem ser modificadas');
    }

    // Validate permissions if provided
    if (data.permissoes) {
      this.validatePermissions(data.permissoes);
    }

    const updatedRole = await this.roleRepository.update(id, data);
    if (!updatedRole) {
      throw new Error('Erro ao atualizar role');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: updatedBy,
      action: 'role_updated',
      details: { 
        role_id: id,
        changes: data
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedRole);
  }

  async updatePermissions(id: string, data: RolePermissionUpdate, updatedBy: string): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error('Role não encontrada');
    }

    // Check if it's a system role (cannot be modified)
    if (existingRole.sistema) {
      throw new Error('Permissões de roles do sistema não podem ser modificadas');
    }

    // Validate permissions
    this.validatePermissions(data.permissoes);

    const updatedRole = await this.roleRepository.updatePermissions(id, data.permissoes);
    if (!updatedRole) {
      throw new Error('Erro ao atualizar permissões da role');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: updatedBy,
      action: 'role_permissions_updated',
      details: { 
        role_id: id,
        old_permissions: existingRole.permissoes,
        new_permissions: data.permissoes,
        motivo: data.motivo
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedRole);
  }

  async activate(id: string, activatedBy: string): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error('Role não encontrada');
    }

    const updatedRole = await this.roleRepository.update(id, { ativo: true });
    if (!updatedRole) {
      throw new Error('Erro ao ativar role');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: activatedBy,
      action: 'role_activated',
      details: { 
        role_id: id,
        role_name: updatedRole.nome
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedRole);
  }

  async deactivate(id: string, deactivatedBy: string): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error('Role não encontrada');
    }

    // Check if it's a system role (cannot be deactivated)
    if (existingRole.sistema) {
      throw new Error('Roles do sistema não podem ser desativadas');
    }

    // Check if there are active users with this role
    const usersWithRole = await this.usuarioRepository.findAll({ role_id: id, ativo: true });
    if (usersWithRole.total > 0) {
      throw new Error('Não é possível desativar role com usuários ativos associados');
    }

    const updatedRole = await this.roleRepository.update(id, { ativo: false });
    if (!updatedRole) {
      throw new Error('Erro ao desativar role');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: deactivatedBy,
      action: 'role_deactivated',
      details: { 
        role_id: id,
        role_name: updatedRole.nome
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedRole);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new Error('Role não encontrada');
    }

    // Check if it's a system role (cannot be deleted)
    if (existingRole.sistema) {
      throw new Error('Roles do sistema não podem ser excluídas');
    }

    // Check if there are users with this role
    const usersWithRole = await this.usuarioRepository.findAll({ role_id: id });
    if (usersWithRole.total > 0) {
      throw new Error('Não é possível excluir role com usuários associados');
    }

    await this.roleRepository.softDelete(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: deletedBy,
      action: 'role_deleted',
      details: { 
        role_id: id,
        role_name: existingRole.nome
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });
  }

  async checkPermission(roleId: string, permission: string): Promise<boolean> {
    return this.roleRepository.hasPermission(roleId, permission);
  }

  async getUserRoleHistory(userId: string, limit: number = 50): Promise<UserRoleHistory[]> {
    return this.roleRepository.getUserRoleHistory(userId, limit);
  }

  async getAvailablePermissions(): Promise<PermissionGroup[]> {
    const permissionGroups: PermissionGroup[] = [
      {
        grupo: 'Orçamentos',
        descricao: 'Permissões relacionadas ao módulo de orçamentos',
        permissoes: [
          PERMISSIONS.ORCAMENTOS_VISUALIZAR,
          PERMISSIONS.ORCAMENTOS_CRIAR,
          PERMISSIONS.ORCAMENTOS_EDITAR,
          PERMISSIONS.ORCAMENTOS_EXCLUIR,
          PERMISSIONS.ORCAMENTOS_APROVAR,
          PERMISSIONS.ORCAMENTOS_CONVERTER_VENDA,
          PERMISSIONS.ORCAMENTOS_IMPRIMIR,
          PERMISSIONS.ORCAMENTOS_EXPORTAR
        ]
      },
      {
        grupo: 'Produtos',
        descricao: 'Permissões relacionadas ao módulo de produtos',
        permissoes: [
          PERMISSIONS.PRODUTOS_VISUALIZAR,
          PERMISSIONS.PRODUTOS_CRIAR,
          PERMISSIONS.PRODUTOS_EDITAR,
          PERMISSIONS.PRODUTOS_EXCLUIR,
          PERMISSIONS.PRODUTOS_IMPORTAR,
          PERMISSIONS.PRODUTOS_EXPORTAR
        ]
      },
      {
        grupo: 'Estoque',
        descricao: 'Permissões relacionadas ao módulo de estoque',
        permissoes: [
          PERMISSIONS.ESTOQUE_VISUALIZAR,
          PERMISSIONS.ESTOQUE_MOVIMENTAR,
          PERMISSIONS.ESTOQUE_AJUSTAR,
          PERMISSIONS.ESTOQUE_TRANSFERIR,
          PERMISSIONS.ESTOQUE_RELATORIOS
        ]
      },
      {
        grupo: 'Usuários',
        descricao: 'Permissões relacionadas ao módulo de usuários',
        permissoes: [
          PERMISSIONS.USUARIOS_VISUALIZAR,
          PERMISSIONS.USUARIOS_CRIAR,
          PERMISSIONS.USUARIOS_EDITAR,
          PERMISSIONS.USUARIOS_EXCLUIR,
          PERMISSIONS.USUARIOS_GERENCIAR_ROLES,
          PERMISSIONS.USUARIOS_RESETAR_SENHA
        ]
      },
      {
        grupo: 'Roles',
        descricao: 'Permissões relacionadas ao módulo de roles',
        permissoes: [
          PERMISSIONS.ROLES_VISUALIZAR,
          PERMISSIONS.ROLES_CRIAR,
          PERMISSIONS.ROLES_EDITAR,
          PERMISSIONS.ROLES_EXCLUIR,
          PERMISSIONS.ROLES_GERENCIAR_PERMISSOES
        ]
      },
      {
        grupo: 'Relatórios',
        descricao: 'Permissões relacionadas aos relatórios do sistema',
        permissoes: [
          PERMISSIONS.RELATORIOS_VENDAS,
          PERMISSIONS.RELATORIOS_ESTOQUE,
          PERMISSIONS.RELATORIOS_FINANCEIRO,
          PERMISSIONS.RELATORIOS_USUARIOS,
          PERMISSIONS.RELATORIOS_SISTEMA
        ]
      },
      {
        grupo: 'Sistema',
        descricao: 'Permissões administrativas do sistema',
        permissoes: [
          PERMISSIONS.SISTEMA_CONFIGURAR,
          PERMISSIONS.SISTEMA_BACKUP,
          PERMISSIONS.SISTEMA_LOGS,
          PERMISSIONS.SISTEMA_MANUTENCAO
        ]
      }
    ];

    return permissionGroups;
  }

  async initializeDefaultRoles(): Promise<void> {
    // Check if default roles already exist
    for (const defaultRole of DEFAULT_ROLES) {
      const existingRole = await this.roleRepository.findByName(defaultRole.nome);
      if (!existingRole) {
        await this.roleRepository.create({
          ...defaultRole,
          sistema: true
        });
      }
    }
  }

  private validatePermissions(permissoes: string[]): void {
    const validPermissions = Object.values(PERMISSIONS);
    
    for (const permission of permissoes) {
      if (!validPermissions.includes(permission as any)) {
        throw new Error(`Permissão inválida: ${permission}`);
      }
    }
  }

  private mapToResponse(role: Role): RoleResponse {
    return {
      id: role.id,
      nome: role.nome,
      descricao: role.descricao,
      permissoes: role.permissoes,
      ativo: role.ativo,
      sistema: role.sistema,
      created_at: role.created_at,
      updated_at: role.updated_at
    };
  }
}