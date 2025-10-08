export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  novaSenha: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  permissoes: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  permissoes: string[];
}

export interface SessionInfo {
  id: string;
  usuario_id: string;
  token_jwt: string;
  ip_address: string;
  user_agent: string;
  expires_at: Date;
  revogado: boolean;
  created_at: Date;
}

export interface LoginAttempt {
  email: string;
  ip_address: string;
  success: boolean;
  attempted_at: Date;
}

export interface SecurityLog {
  id: string;
  usuario_id?: string;
  action: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshExpiresIn: string;
  bcryptSaltRounds: number;
  maxLoginAttempts: number;
  lockoutTimeMinutes: number;
}