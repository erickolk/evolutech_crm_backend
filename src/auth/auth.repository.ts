import { Database } from '../database/database';
import { LoginAttempt, SecurityLog } from './auth.types';
import { v4 as uuidv4 } from 'uuid';

export class AuthRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  // Login Attempts
  async createLoginAttempt(attempt: Omit<LoginAttempt, 'id' | 'created_at'>): Promise<LoginAttempt> {
    const id = uuidv4();
    const created_at = new Date();
    
    const loginAttempt: LoginAttempt = {
      id,
      ...attempt,
      created_at
    };

    const query = `
      INSERT INTO login_attempts (
        id, email, ip_address, user_agent, success, 
        failure_reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      loginAttempt.id,
      loginAttempt.email,
      loginAttempt.ip_address,
      loginAttempt.user_agent,
      loginAttempt.success ? 1 : 0,
      loginAttempt.failure_reason,
      loginAttempt.created_at.toISOString()
    ]);

    return loginAttempt;
  }

  async getRecentLoginAttempts(email: string, minutes: number = 15): Promise<LoginAttempt[]> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    const query = `
      SELECT * FROM login_attempts 
      WHERE email = ? AND created_at >= ?
      ORDER BY created_at DESC
    `;

    const rows = await this.db.all(query, [email, since.toISOString()]);
    
    return rows.map(row => ({
      ...row,
      success: Boolean(row.success),
      created_at: new Date(row.created_at)
    }));
  }

  async getFailedLoginAttempts(email: string, minutes: number = 15): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    const query = `
      SELECT COUNT(*) as count FROM login_attempts 
      WHERE email = ? AND success = 0 AND created_at >= ?
    `;

    const result = await this.db.get(query, [email, since.toISOString()]);
    return result?.count || 0;
  }

  async clearLoginAttempts(email: string): Promise<void> {
    const query = `DELETE FROM login_attempts WHERE email = ?`;
    await this.db.run(query, [email]);
  }

  // Security Logs
  async createSecurityLog(log: Omit<SecurityLog, 'id' | 'created_at'>): Promise<SecurityLog> {
    const id = uuidv4();
    const created_at = new Date();
    
    const securityLog: SecurityLog = {
      id,
      ...log,
      created_at
    };

    const query = `
      INSERT INTO security_logs (
        id, usuario_id, action, details, ip_address, 
        user_agent, severity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      securityLog.id,
      securityLog.usuario_id,
      securityLog.action,
      JSON.stringify(securityLog.details),
      securityLog.ip_address,
      securityLog.user_agent,
      securityLog.severity,
      securityLog.created_at.toISOString()
    ]);

    return securityLog;
  }

  async getSecurityLogs(filters: {
    usuario_id?: string;
    action?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    since?: Date;
    limit?: number;
  } = {}): Promise<SecurityLog[]> {
    let query = `SELECT * FROM security_logs WHERE 1=1`;
    const params: any[] = [];

    if (filters.usuario_id) {
      query += ` AND usuario_id = ?`;
      params.push(filters.usuario_id);
    }

    if (filters.action) {
      query += ` AND action = ?`;
      params.push(filters.action);
    }

    if (filters.severity) {
      query += ` AND severity = ?`;
      params.push(filters.severity);
    }

    if (filters.since) {
      query += ` AND created_at >= ?`;
      params.push(filters.since.toISOString());
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);
    }

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      ...row,
      details: JSON.parse(row.details || '{}'),
      created_at: new Date(row.created_at)
    }));
  }

  // Session Management
  async createSession(sessionData: {
    usuario_id: string;
    token: string;
    ip_address: string;
    user_agent: string;
    expires_at: Date;
  }): Promise<void> {
    const id = uuidv4();
    const created_at = new Date();

    const query = `
      INSERT INTO user_sessions (
        id, usuario_id, token, ip_address, user_agent,
        expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      id,
      sessionData.usuario_id,
      sessionData.token,
      sessionData.ip_address,
      sessionData.user_agent,
      sessionData.expires_at.toISOString(),
      created_at.toISOString()
    ]);
  }

  async getActiveSession(token: string): Promise<any> {
    const query = `
      SELECT * FROM user_sessions 
      WHERE token = ? AND expires_at > ? AND revoked_at IS NULL
    `;

    const result = await this.db.get(query, [token, new Date().toISOString()]);
    
    if (result) {
      return {
        ...result,
        expires_at: new Date(result.expires_at),
        created_at: new Date(result.created_at),
        revoked_at: result.revoked_at ? new Date(result.revoked_at) : null
      };
    }

    return null;
  }

  async revokeSession(token: string): Promise<void> {
    const query = `
      UPDATE user_sessions 
      SET revoked_at = ? 
      WHERE token = ?
    `;

    await this.db.run(query, [new Date().toISOString(), token]);
  }

  async revokeAllUserSessions(usuario_id: string): Promise<void> {
    const query = `
      UPDATE user_sessions 
      SET revoked_at = ? 
      WHERE usuario_id = ? AND revoked_at IS NULL
    `;

    await this.db.run(query, [new Date().toISOString(), usuario_id]);
  }

  async cleanExpiredSessions(): Promise<void> {
    const query = `
      DELETE FROM user_sessions 
      WHERE expires_at < ? OR revoked_at < ?
    `;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.db.run(query, [new Date().toISOString(), oneWeekAgo.toISOString()]);
  }

  // Password Reset Tokens
  async savePasswordResetToken(usuario_id: string, token: string, expires_at: Date): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET token_reset_senha = ?, token_reset_expira = ? 
      WHERE id = ?
    `;

    await this.db.run(query, [token, expires_at.toISOString(), usuario_id]);
  }

  async validatePasswordResetToken(token: string): Promise<{ usuario_id: string } | null> {
    const query = `
      SELECT id as usuario_id FROM usuarios 
      WHERE token_reset_senha = ? AND token_reset_expira > ?
    `;

    const result = await this.db.get(query, [token, new Date().toISOString()]);
    return result || null;
  }

  async clearPasswordResetToken(usuario_id: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET token_reset_senha = NULL, token_reset_expira = NULL 
      WHERE id = ?
    `;

    await this.db.run(query, [usuario_id]);
  }

  // Statistics
  async getAuthStats(days: number = 30): Promise<{
    total_logins: number;
    successful_logins: number;
    failed_logins: number;
    unique_users: number;
    blocked_attempts: number;
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = `
      SELECT 
        COUNT(*) as total_logins,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_logins,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_logins,
        COUNT(DISTINCT email) as unique_users,
        SUM(CASE WHEN failure_reason = 'account_locked' THEN 1 ELSE 0 END) as blocked_attempts
      FROM login_attempts 
      WHERE created_at >= ?
    `;

    const result = await this.db.get(query, [since.toISOString()]);
    
    return {
      total_logins: result?.total_logins || 0,
      successful_logins: result?.successful_logins || 0,
      failed_logins: result?.failed_logins || 0,
      unique_users: result?.unique_users || 0,
      blocked_attempts: result?.blocked_attempts || 0
    };
  }
}