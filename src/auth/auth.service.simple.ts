// import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface SimpleLoginRequest {
  email: string;
  senha: string;
}

export interface SimpleLoginResponse {
  success: boolean;
  message: string;
  data?: {
    usuario: {
      id: string;
      nome: string;
      email: string;
      role: string;
      permissoes: string[];
    };
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface SimpleJwtPayload {
  userId: string;
  email: string;
  role: string;
  permissoes: string[];
  iat?: number;
  exp?: number;
}

export class SimpleAuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'evolutech-crm-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Login simplificado para testes
   */
  async login(email: string, senha: string): Promise<SimpleLoginResponse> {
    try {
      // Para testes, vamos aceitar credenciais específicas
      if (email === 'admin@evolutech.com' && senha === 'admin123') {
        const usuario = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: 'Administrador',
          email: 'admin@evolutech.com',
          role: 'admin',
          permissoes: ['read:all', 'write:all', 'delete:all']
        };

        const payload: SimpleJwtPayload = {
          userId: usuario.id,
          email: usuario.email,
          role: usuario.role,
          permissoes: usuario.permissoes
        };

        const token = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return {
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            usuario,
            token,
            refreshToken,
            expiresIn: this.jwtExpiresIn
          }
        };
      } else if (email === 'tecnico@evolutech.com' && senha === 'tecnico123') {
        const usuario = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nome: 'Técnico',
          email: 'tecnico@evolutech.com',
          role: 'tecnico',
          permissoes: ['read:os', 'write:os', 'read:produtos', 'read:estoque']
        };

        const payload: SimpleJwtPayload = {
          userId: usuario.id,
          email: usuario.email,
          role: usuario.role,
          permissoes: usuario.permissoes
        };

        const token = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return {
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            usuario,
            token,
            refreshToken,
            expiresIn: this.jwtExpiresIn
          }
        };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro interno do servidor');
    }
  }

  /**
   * Logout simplificado
   */
  async logout(token: string): Promise<void> {
    // Para a versão simplificada, apenas validamos o token
    try {
      this.verifyAccessToken(token);
      // Em uma implementação real, invalidaríamos o token
    } catch (error) {
      // Mesmo se o token for inválido, não vamos gerar erro no logout
    }
  }

  /**
   * Verifica se um token é válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      this.verifyAccessToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Renova um token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Gerar novo access token
      const payload: SimpleJwtPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissoes: decoded.permissoes
      };

      const accessToken = this.generateAccessToken(payload);

      return {
        accessToken,
        expiresIn: this.jwtExpiresIn
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Gera um token de acesso
   */
  generateAccessToken(payload: SimpleJwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'evolutech-crm',
      audience: 'evolutech-crm-users'
    });
  }

  /**
   * Gera um token de refresh
   */
  generateRefreshToken(payload: SimpleJwtPayload): string {
    return jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissoes: payload.permissoes
      }, 
      this.jwtSecret, 
      {
        expiresIn: '7d',
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-refresh'
      }
    );
  }

  /**
   * Verifica um token de acesso
   */
  verifyAccessToken(token: string): SimpleJwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-users'
      }) as SimpleJwtPayload;
    } catch (error) {
      throw new Error('Token de acesso inválido');
    }
  }

  /**
   * Verifica um token de refresh
   */
  verifyRefreshToken(token: string): SimpleJwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'evolutech-crm',
        audience: 'evolutech-crm-refresh'
      }) as SimpleJwtPayload;
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  /**
   * Obtém dados do usuário a partir do token
   */
  getUserFromToken(token: string): any {
    try {
      const decoded = this.verifyAccessToken(token);
      return {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissoes: decoded.permissoes
      };
    } catch (error) {
      return null;
    }
  }
}