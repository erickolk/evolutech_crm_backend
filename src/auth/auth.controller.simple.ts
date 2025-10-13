import { type Request, type Response } from 'express';

export class SimpleAuthController {
  /**
   * Login simplificado para testes
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      // Validação básica
      if (!email || !senha) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
        return;
      }

      // Para testes, aceitar credenciais específicas
      if (email === 'admin@evolutech.com' && senha === 'admin123') {
        res.status(200).json({
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              nome: 'Administrador',
              email: 'admin@evolutech.com',
              role: 'admin'
            },
            token: 'fake-jwt-token-for-testing'
          }
        });
        return;
      }

      if (email === 'tecnico@evolutech.com' && senha === 'tecnico123') {
        res.status(200).json({
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              nome: 'Técnico',
              email: 'tecnico@evolutech.com',
              role: 'tecnico'
            },
            token: 'fake-jwt-token-for-testing-tecnico'
          }
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Logout simplificado
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar usuário atual
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: 'Administrador',
          email: 'admin@evolutech.com',
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar token
   */
  async verify(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Token válido'
      });
    } catch (error) {
      console.error('Erro na verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          token: 'new-fake-jwt-token-for-testing'
        }
      });
    } catch (error) {
      console.error('Erro no refresh:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Esqueci minha senha
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Email de recuperação enviado'
      });
    } catch (error) {
      console.error('Erro no forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Resetar senha
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Senha resetada com sucesso'
      });
    } catch (error) {
      console.error('Erro no reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro no change password:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}