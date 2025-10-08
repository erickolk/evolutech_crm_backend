import { UsuarioRepository } from './usuario.repository';
import { RoleRepository } from '../roles/role.repository';
import { AuthService } from '../auth/auth.service';
import { 
  Usuario, 
  CreateUsuarioRequest, 
  UpdateUsuarioRequest, 
  UsuarioResponse, 
  UsuarioListResponse,
  UsuarioFilters,
  ChangeRoleRequest,
  UnlockUserRequest,
  PasswordValidation,
  UserStats
} from './usuario.types';

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;
  private roleRepository: RoleRepository;
  private authService: AuthService;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.roleRepository = new RoleRepository();
    this.authService = new AuthService();
  }

  async create(data: CreateUsuarioRequest, createdBy: string): Promise<UsuarioResponse> {
    // Validate email uniqueness
    const emailExists = await this.usuarioRepository.isEmailTaken(data.email);
    if (emailExists) {
      throw new Error('Email já está em uso');
    }

    // Validate role exists
    const role = await this.roleRepository.findById(data.role_id);
    if (!role) {
      throw new Error('Role não encontrada');
    }

    if (!role.ativo) {
      throw new Error('Role inativa');
    }

    // Validate password strength
    const passwordValidation = this.authService.validatePasswordStrength(data.senha);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password
    const senha_hash = await this.authService.hashPassword(data.senha);

    // Create user
    const usuario = await this.usuarioRepository.create({
      ...data,
      senha_hash
    });

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: createdBy,
      action: 'user_created',
      details: { 
        created_user_id: usuario.id,
        created_user_email: usuario.email,
        role_id: usuario.role_id
      },
      ip_address: '0.0.0.0', // Will be updated by controller
      user_agent: 'system'
    });

    return this.mapToResponse(usuario, role);
  }

  async findById(id: string): Promise<UsuarioResponse | null> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) return null;

    const role = await this.roleRepository.findById(usuario.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    return this.mapToResponse(usuario, role);
  }

  async findByEmail(email: string): Promise<UsuarioResponse | null> {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) return null;

    const role = await this.roleRepository.findById(usuario.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    return this.mapToResponse(usuario, role);
  }

  async findAll(filters: UsuarioFilters = {}): Promise<UsuarioListResponse> {
    const { usuarios, total } = await this.usuarioRepository.findAll(filters);

    const usuariosWithRoles = await Promise.all(
      usuarios.map(async (usuario) => {
        const role = await this.roleRepository.findById(usuario.role_id);
        if (!role) {
          throw new Error(`Role não encontrada para usuário ${usuario.id}`);
        }
        return this.mapToResponse(usuario, role);
      })
    );

    return {
      usuarios: usuariosWithRoles,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }

  async update(id: string, data: UpdateUsuarioRequest, updatedBy: string): Promise<UsuarioResponse> {
    const existingUser = await this.usuarioRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Validate email uniqueness if email is being changed
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.usuarioRepository.isEmailTaken(data.email, id);
      if (emailExists) {
        throw new Error('Email já está em uso');
      }
    }

    // Validate role if role is being changed
    if (data.role_id && data.role_id !== existingUser.role_id) {
      const role = await this.roleRepository.findById(data.role_id);
      if (!role) {
        throw new Error('Role não encontrada');
      }
      if (!role.ativo) {
        throw new Error('Role inativa');
      }

      // Create role change history
      await this.roleRepository.createRoleHistory({
        usuario_id: id,
        role_anterior_id: existingUser.role_id,
        role_nova_id: data.role_id,
        motivo: 'Alteração via sistema',
        alterado_por: updatedBy
      });
    }

    const updatedUser = await this.usuarioRepository.update(id, data);
    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }

    const role = await this.roleRepository.findById(updatedUser.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: updatedBy,
      action: 'user_updated',
      details: { 
        updated_user_id: id,
        changes: data
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedUser, role);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string, changedBy: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.authService.comparePassword(currentPassword, usuario.senha_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Validate new password strength
    const passwordValidation = this.authService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Nova senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const newPasswordHash = await this.authService.hashPassword(newPassword);

    // Update password
    await this.usuarioRepository.updatePassword(id, newPasswordHash);

    // Revoke all user sessions to force re-login
    await this.authService.revokeAllUserSessions(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: changedBy,
      action: 'password_changed',
      details: { 
        target_user_id: id,
        self_change: changedBy === id
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });
  }

  async resetPassword(id: string, newPassword: string, resetBy: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Validate new password strength
    const passwordValidation = this.authService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Nova senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const newPasswordHash = await this.authService.hashPassword(newPassword);

    // Update password
    await this.usuarioRepository.updatePassword(id, newPasswordHash);

    // Reset login attempts and unlock user
    await this.usuarioRepository.unlockUser(id);

    // Revoke all user sessions
    await this.authService.revokeAllUserSessions(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: resetBy,
      action: 'password_reset',
      details: { 
        target_user_id: id
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });
  }

  async changeRole(id: string, data: ChangeRoleRequest, changedBy: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const newRole = await this.roleRepository.findById(data.role_id);
    if (!newRole) {
      throw new Error('Nova role não encontrada');
    }

    if (!newRole.ativo) {
      throw new Error('Nova role está inativa');
    }

    // Create role change history
    await this.roleRepository.createRoleHistory({
      usuario_id: id,
      role_anterior_id: usuario.role_id,
      role_nova_id: data.role_id,
      motivo: data.motivo || 'Alteração de role',
      alterado_por: changedBy
    });

    // Update user role
    const updatedUser = await this.usuarioRepository.update(id, { role_id: data.role_id });
    if (!updatedUser) {
      throw new Error('Erro ao atualizar role do usuário');
    }

    // Revoke all user sessions to force re-login with new permissions
    await this.authService.revokeAllUserSessions(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: changedBy,
      action: 'role_changed',
      details: { 
        target_user_id: id,
        old_role_id: usuario.role_id,
        new_role_id: data.role_id,
        motivo: data.motivo
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedUser, newRole);
  }

  async activate(id: string, activatedBy: string): Promise<UsuarioResponse> {
    const updatedUser = await this.usuarioRepository.update(id, { ativo: true });
    if (!updatedUser) {
      throw new Error('Usuário não encontrado');
    }

    const role = await this.roleRepository.findById(updatedUser.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: activatedBy,
      action: 'user_activated',
      details: { 
        target_user_id: id
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedUser, role);
  }

  async deactivate(id: string, deactivatedBy: string): Promise<UsuarioResponse> {
    const updatedUser = await this.usuarioRepository.update(id, { ativo: false });
    if (!updatedUser) {
      throw new Error('Usuário não encontrado');
    }

    const role = await this.roleRepository.findById(updatedUser.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    // Revoke all user sessions
    await this.authService.revokeAllUserSessions(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: deactivatedBy,
      action: 'user_deactivated',
      details: { 
        target_user_id: id
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    return this.mapToResponse(updatedUser, role);
  }

  async unlock(id: string, data: UnlockUserRequest, unlockedBy: string): Promise<UsuarioResponse> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Unlock user
    await this.usuarioRepository.unlockUser(id);

    const role = await this.roleRepository.findById(usuario.role_id);
    if (!role) {
      throw new Error('Role do usuário não encontrada');
    }

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: unlockedBy,
      action: 'user_unlocked',
      details: { 
        target_user_id: id,
        motivo: data.motivo
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });

    const updatedUser = await this.usuarioRepository.findById(id);
    return this.mapToResponse(updatedUser!, role);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Revoke all user sessions
    await this.authService.revokeAllUserSessions(id);

    // Soft delete user
    await this.usuarioRepository.softDelete(id);

    // Create activity log
    await this.usuarioRepository.createActivity({
      usuario_id: deletedBy,
      action: 'user_deleted',
      details: { 
        target_user_id: id,
        target_user_email: usuario.email
      },
      ip_address: '0.0.0.0',
      user_agent: 'system'
    });
  }

  async getUserActivities(id: string, limit: number = 50) {
    return this.usuarioRepository.getUserActivities(id, limit);
  }

  async getUserRoleHistory(id: string, limit: number = 50) {
    return this.roleRepository.getUserRoleHistory(id, limit);
  }

  async getStats(): Promise<UserStats> {
    return this.usuarioRepository.getStats();
  }

  validatePassword(password: string): PasswordValidation {
    return this.authService.validatePasswordStrength(password);
  }

  private mapToResponse(usuario: Usuario, role: any): UsuarioResponse {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      role: {
        id: role.id,
        nome: role.nome,
        descricao: role.descricao,
        permissoes: role.permissoes
      },
      ativo: usuario.ativo,
      ultimo_login: usuario.ultimo_login,
      tentativas_login: usuario.tentativas_login,
      bloqueado_ate: usuario.bloqueado_ate,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };
  }
}