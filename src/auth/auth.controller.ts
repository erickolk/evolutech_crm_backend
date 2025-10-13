import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { 
  LoginRequest, 
  RefreshTokenRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from './auth.types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/login
   * Realiza login no sistema
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha }: LoginRequest = req.body;

      if (!email || !senha) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
        return;
      }

      const clientInfo = {
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown'
      };

      const result = await this.authService.login(email, senha, clientInfo);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      if (error.message.includes('credenciais inválidas') || 
          error.message.includes('usuário não encontrado') ||
          error.message.includes('senha incorreta')) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      } else if (error.message.includes('bloqueado')) {
        res.status(423).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('inativo')) {
        res.status(403).json({
          success: false,
          message: 'Usuário inativo'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * POST /api/auth/logout
   * Realiza logout e invalida o token
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token não fornecido'
        });
        return;
      }

      await this.authService.logout(token);

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          usuario: req.user
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/auth
   * Verifica se o usuário está autenticado
   */
  async verify(req: Request, res: Response): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
        return;
      }

      const isValid = await this.authService.verifyToken(token);
      
      if (isValid) {
        res.status(200).json({
          success: true,
          message: 'Token válido'
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    } catch (error: any) {
      console.error('Erro na verificação do token:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renova o token JWT
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório'
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Solicita reset de senha
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
        return;
      }

      await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      });
    } catch (error: any) {
      console.error('Erro ao solicitar reset de senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reseta a senha com token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, novaSenha }: ResetPasswordRequest = req.body;

      if (!token || !novaSenha) {
        res.status(400).json({
          success: false,
          message: 'Token e nova senha são obrigatórios'
        });
        return;
      }

      await this.authService.resetPassword(token, novaSenha);

      res.status(200).json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      
      if (error.message.includes('token inválido') || error.message.includes('expirado')) {
        res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * PATCH /api/auth/change-password
   * Altera a senha do usuário autenticado
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { senhaAtual, novaSenha }: ChangePasswordRequest = req.body;

      if (!senhaAtual || !novaSenha) {
        res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
        return;
      }

      await this.authService.changePassword(req.user.id, senhaAtual, novaSenha);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      if (error.message.includes('senha atual incorreta')) {
        res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * Extrai o token JWT do header Authorization
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}