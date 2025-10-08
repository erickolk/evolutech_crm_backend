import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service';
import { UsuarioService } from '../usuarios/usuario.service';
import { RoleService } from '../roles/role.service';
import { JwtPayload, AuthenticatedUser } from '../auth/auth.types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;
  private usuarioService: UsuarioService;
  private roleService: RoleService;

  constructor() {
    this.authService = new AuthService();
    this.usuarioService = new UsuarioService();
    this.roleService = new RoleService();
  }

  /**
   * Middleware para autenticação JWT
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token de acesso não fornecido'
        });
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;

      // Check if session is still valid
      const session = await this.authService.getActiveSession(decoded.sessionId);
      if (!session) {
        res.status(401).json({
          success: false,
          message: 'Sessão inválida ou expirada'
        });
        return;
      }

      // Get user details
      const usuario = await this.usuarioService.findById(decoded.userId);
      if (!usuario) {
        res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Check if user is active
      if (!usuario.ativo) {
        res.status(401).json({
          success: false,
          message: 'Usuário inativo'
        });
        return;
      }

      // Check if user is locked
      if (usuario.bloqueado_ate && new Date(usuario.bloqueado_ate) > new Date()) {
        res.status(401).json({
          success: false,
          message: 'Usuário temporariamente bloqueado'
        });
        return;
      }

      // Attach user to request
      req.user = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        sessionId: decoded.sessionId
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
        return;
      }

      console.error('Erro na autenticação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Middleware para verificação de permissões
   */
  requirePermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        // Check if user has the required permission
        const hasPermission = await this.roleService.checkPermission(req.user.role.id, permission);
        
        if (!hasPermission) {
          res.status(403).json({
            success: false,
            message: 'Permissão insuficiente para acessar este recurso'
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de permissão:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware para verificação de múltiplas permissões (OR logic)
   */
  requireAnyPermission = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        // Check if user has any of the required permissions
        let hasAnyPermission = false;
        for (const permission of permissions) {
          const hasPermission = await this.roleService.checkPermission(req.user.role.id, permission);
          if (hasPermission) {
            hasAnyPermission = true;
            break;
          }
        }
        
        if (!hasAnyPermission) {
          res.status(403).json({
            success: false,
            message: 'Permissão insuficiente para acessar este recurso'
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de permissões:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware para verificação de múltiplas permissões (AND logic)
   */
  requireAllPermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        // Check if user has all required permissions
        for (const permission of permissions) {
          const hasPermission = await this.roleService.checkPermission(req.user.role.id, permission);
          if (!hasPermission) {
            res.status(403).json({
              success: false,
              message: 'Permissão insuficiente para acessar este recurso'
            });
            return;
          }
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de permissões:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware para verificação de role específica
   */
  requireRole = (roleName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        if (req.user.role.nome !== roleName) {
          res.status(403).json({
            success: false,
            message: `Acesso restrito para role: ${roleName}`
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de role:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware para verificação de múltiplas roles
   */
  requireAnyRole = (roleNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        if (!roleNames.includes(req.user.role.nome)) {
          res.status(403).json({
            success: false,
            message: `Acesso restrito para roles: ${roleNames.join(', ')}`
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de roles:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware para verificar se o usuário pode acessar seus próprios dados ou tem permissão administrativa
   */
  requireOwnershipOrPermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
          });
          return;
        }

        const targetUserId = req.params.id || req.params.userId;
        
        // Allow if user is accessing their own data
        if (req.user.id === targetUserId) {
          next();
          return;
        }

        // Check if user has administrative permission
        const hasPermission = await this.roleService.checkPermission(req.user.role.id, permission);
        
        if (!hasPermission) {
          res.status(403).json({
            success: false,
            message: 'Acesso negado: você só pode acessar seus próprios dados ou precisa de permissão administrativa'
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de propriedade/permissão:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    };
  };

  /**
   * Middleware opcional de autenticação (não falha se não autenticado)
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        next();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
      const session = await this.authService.getActiveSession(decoded.sessionId);
      
      if (session) {
        const usuario = await this.usuarioService.findById(decoded.userId);
        if (usuario && usuario.ativo) {
          req.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            sessionId: decoded.sessionId
          };
        }
      }

      next();
    } catch (error) {
      // Ignore authentication errors in optional auth
      next();
    }
  };

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

// Export singleton instance
export const authMiddleware = new AuthMiddleware();