import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { UsuarioRepository } from '../usuarios/usuario.repository';
import { RoleRepository } from '../roles/role.repository';
import { 
  LoginRequest, 
  LoginResponse, 
  JwtPayload, 
  AuthenticatedUser, 
  SessionInfo,
  AuthConfig 
} from './auth.types';

export class AuthService {
  private authRepository: AuthRepository;
  private usuarioRepository: UsuarioRepository;
  private roleRepository: RoleRepository;
  private config: AuthConfig;

  constructor() {
    this.authRepository = new AuthRepository();
    this.usuarioRepository = new UsuarioRepository();
    this.roleRepository = new RoleRepository();
    
    this.config = {
      jwtSecret: process.env.JWT_SECRET || 'evolutech-crm-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '15'), // minutes
      passwordResetExpires: parseInt(process.env.PASSWORD_RESET_EXPIRES || '60'), // minutes
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    };
  }

  // Authentication
  async login(loginData: LoginRequest, clientInfo: {
    ip_address: string;
    user_agent: string;
  }): Promise<LoginResponse> {
    const { email, senha } = loginData;
    
    try {
      // Find user
      const usuario = await this.usuarioRepository.findByEmail(email);
      
      if (!usuario) {
        await this.logFailedAttempt(email, 'user_not_found', clientInfo);
        throw new Error('Credenciais inválidas');
      }

      // Check if user is active
      if (!usuario.ativo) {
        await this.logFailedAttempt(email, 'account_inactive', clientInfo);
        throw new Error('Conta inativa');
      }

      // Check if user is locked
      if (usuario.bloqueado_ate && usuario.bloqueado_ate > new Date()) {
        await this.logFailedAttempt(email, 'account_locked', clientInfo);
        const unlockTime = usuario.bloqueado_ate.toLocaleString('pt-BR');
        throw new Error(`Conta bloqueada até ${unlockTime}`);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(senha, usuario.senha_hash);
      
      if (!isPasswordValid) {
        await this.handleFailedLogin(usuario.id, email, clientInfo);
        throw new Error('Credenciais inválidas');
      }

      // Get user role and permissions
      const role = await this.roleRepository.findById(usuario.role_id);
      if (!role) {
        throw new Error('Role do usuário não encontrada');
      }

      // Generate tokens
      const payload: JwtPayload = {
        usuario_id: usuario.id,
        email: usuario.email,
        role_id: role.id,
        permissoes: role.permissoes
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      // Create session
      const expiresAt = new Date(Date.now() + this.parseTimeToMs(this.config.jwtExpiresIn));
      await this.authRepository.createSession({
        usuario_id: usuario.id,
        token: accessToken,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        expires_at: expiresAt
      });

      // Update user login info
      await this.usuarioRepository.updateLastLogin(usuario.id);

      // Log successful login
      await this.authRepository.createLoginAttempt({
        email,
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        success: true
      });

      // Log security event
      await this.authRepository.createSecurityLog({
        usuario_id: usuario.id,
        action: 'login',
        details: { method: 'email_password' },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        severity: 'low'
      });

      // Create user activity
      await this.usuarioRepository.createActivity({
        usuario_id: usuario.id,
        action: 'login',
        details: { method: 'email_password' },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent
      });

      const authenticatedUser: AuthenticatedUser = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: {
          id: role.id,
          nome: role.nome,
          permissoes: role.permissoes
        }
      };

      return {
        user: authenticatedUser,
        accessToken,
        refreshToken,
        expiresIn: this.config.jwtExpiresIn
      };

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro interno do servidor');
    }
  }

  async logout(token: string, clientInfo: {
    ip_address: string;
    user_agent: string;
  }): Promise<void> {
    try {
      // Verify and decode token
      const decoded = this.verifyAccessToken(token);
      
      // Revoke session
      await this.authRepository.revokeSession(token);

      // Log security event
      await this.authRepository.createSecurityLog({
        usuario_id: decoded.usuario_id,
        action: 'logout',
        details: { method: 'manual' },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        severity: 'low'
      });

      // Create user activity
      await this.usuarioRepository.createActivity({
        usuario_id: decoded.usuario_id,
        action: 'logout',
        details: { method: 'manual' },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent
      });

    } catch (error) {
      // Even if token is invalid, we should not throw error on logout
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Get fresh user data
      const usuario = await this.usuarioRepository.findById(decoded.usuario_id);
      if (!usuario || !usuario.ativo) {
        throw new Error('Usuário inválido ou inativo');
      }

      const role = await this.roleRepository.findById(usuario.role_id);
      if (!role) {
        throw new Error('Role do usuário não encontrada');
      }

      // Generate new access token
      const payload: JwtPayload = {
        usuario_id: usuario.id,
        email: usuario.email,
        role_id: role.id,
        permissoes: role.permissoes
      };

      const accessToken = this.generateAccessToken(payload);

      return {
        accessToken,
        expiresIn: this.config.jwtExpiresIn
      };

    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  // Token management
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn,
      issuer: 'evolutech-crm',
      audience: 'evolutech-crm-users'
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      { usuario_id: payload.usuario_id }, 
      this.config.jwtSecret, 
      {
        expiresIn: this.config.refreshTokenExpiresIn,
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-refresh'
      }
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.config.jwtSecret, {
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-users'
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Token de acesso inválido');
    }
  }

  verifyRefreshToken(token: string): { usuario_id: string } {
    try {
      return jwt.verify(token, this.config.jwtSecret, {
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-refresh'
      }) as { usuario_id: string };
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  // Password management
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<string> {
    const usuario = await this.usuarioRepository.findByEmail(email);
    
    if (!usuario) {
      // Don't reveal if email exists
      return 'Se o email existir, você receberá instruções para redefinir sua senha';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.config.passwordResetExpires * 60 * 1000);

    await this.authRepository.savePasswordResetToken(usuario.id, resetToken, expiresAt);

    // Log security event
    await this.authRepository.createSecurityLog({
      usuario_id: usuario.id,
      action: 'password_reset_requested',
      details: { email },
      ip_address: '0.0.0.0', // Will be updated by controller
      user_agent: 'system',
      severity: 'medium'
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const validation = await this.authRepository.validatePasswordResetToken(token);
    
    if (!validation) {
      throw new Error('Token de redefinição inválido ou expirado');
    }

    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.usuarioRepository.updatePassword(validation.usuario_id, hashedPassword);
    await this.authRepository.clearPasswordResetToken(validation.usuario_id);

    // Revoke all user sessions
    await this.authRepository.revokeAllUserSessions(validation.usuario_id);

    // Log security event
    await this.authRepository.createSecurityLog({
      usuario_id: validation.usuario_id,
      action: 'password_reset_completed',
      details: {},
      ip_address: '0.0.0.0',
      user_agent: 'system',
      severity: 'high'
    });
  }

  // Session management
  async getSessionInfo(token: string): Promise<SessionInfo | null> {
    const session = await this.authRepository.getActiveSession(token);
    
    if (!session) {
      return null;
    }

    const usuario = await this.usuarioRepository.findById(session.usuario_id);
    if (!usuario) {
      return null;
    }

    return {
      usuario_id: usuario.id,
      email: usuario.email,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      created_at: session.created_at,
      expires_at: session.expires_at
    };
  }

  async revokeAllUserSessions(usuarioId: string): Promise<void> {
    await this.authRepository.revokeAllUserSessions(usuarioId);
  }

  // Security helpers
  private async handleFailedLogin(usuarioId: string, email: string, clientInfo: {
    ip_address: string;
    user_agent: string;
  }): Promise<void> {
    await this.usuarioRepository.incrementLoginAttempts(usuarioId);
    
    const failedAttempts = await this.authRepository.getFailedLoginAttempts(email);
    
    if (failedAttempts >= this.config.maxLoginAttempts) {
      const lockUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
      await this.usuarioRepository.lockUser(usuarioId, lockUntil);
      
      await this.authRepository.createSecurityLog({
        usuario_id: usuarioId,
        action: 'account_locked',
        details: { failed_attempts: failedAttempts, lock_until: lockUntil },
        ip_address: clientInfo.ip_address,
        user_agent: clientInfo.user_agent,
        severity: 'high'
      });
    }

    await this.logFailedAttempt(email, 'invalid_password', clientInfo);
  }

  private async logFailedAttempt(email: string, reason: string, clientInfo: {
    ip_address: string;
    user_agent: string;
  }): Promise<void> {
    await this.authRepository.createLoginAttempt({
      email,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      success: false,
      failure_reason: reason
    });
  }

  private parseTimeToMs(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000; // Default to 24 hours
    }
  }

  // Cleanup
  async cleanupExpiredSessions(): Promise<void> {
    await this.authRepository.cleanExpiredSessions();
  }

  // Statistics
  async getAuthStats(days: number = 30) {
    return this.authRepository.getAuthStats(days);
  }

  /**
   * Verifica se um token JWT é válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = this.verifyAccessToken(token);
      
      // Check if session is still active
      const session = await this.authRepository.getSessionByToken(token);
      if (!session || session.revogado) {
        return false;
      }

      // Check if user is still active
      const usuario = await this.usuarioRepository.findById(decoded.usuario_id);
      if (!usuario || !usuario.ativo) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém uma sessão ativa pelo ID
   */
  async getActiveSession(sessionId: string): Promise<any> {
    return this.authRepository.getActiveSession(sessionId);
  }
}