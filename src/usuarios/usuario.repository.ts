import { Database } from '../database/database';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest, UsuarioFilters, UserActivity, UserStats } from './usuario.types';
import { v4 as uuidv4 } from 'uuid';

export class UsuarioRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async create(data: CreateUsuarioRequest & { senha_hash: string }): Promise<Usuario> {
    const id = uuidv4();
    const now = new Date();

    const usuario: Usuario = {
      id,
      nome: data.nome,
      email: data.email,
      senha_hash: data.senha_hash,
      telefone: data.telefone,
      role_id: data.role_id,
      ativo: true,
      tentativas_login: 0,
      created_at: now,
      updated_at: now
    };

    const query = `
      INSERT INTO usuarios (
        id, nome, email, senha_hash, telefone, role_id, 
        ativo, tentativas_login, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.senha_hash,
      usuario.telefone,
      usuario.role_id,
      usuario.ativo ? 1 : 0,
      usuario.tentativas_login,
      usuario.created_at.toISOString(),
      usuario.updated_at.toISOString()
    ]);

    return usuario;
  }

  async findById(id: string): Promise<Usuario | null> {
    const query = `
      SELECT * FROM usuarios 
      WHERE id = ? AND deleted_at IS NULL
    `;

    const row = await this.db.get(query, [id]);
    
    if (!row) return null;

    return this.mapRowToUsuario(row);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const query = `
      SELECT * FROM usuarios 
      WHERE email = ? AND deleted_at IS NULL
    `;

    const row = await this.db.get(query, [email]);
    
    if (!row) return null;

    return this.mapRowToUsuario(row);
  }

  async findAll(filters: UsuarioFilters = {}): Promise<{
    usuarios: Usuario[];
    total: number;
  }> {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE u.deleted_at IS NULL';
    const params: any[] = [];

    if (filters.nome) {
      whereClause += ' AND u.nome LIKE ?';
      params.push(`%${filters.nome}%`);
    }

    if (filters.email) {
      whereClause += ' AND u.email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.role_id) {
      whereClause += ' AND u.role_id = ?';
      params.push(filters.role_id);
    }

    if (filters.ativo !== undefined) {
      whereClause += ' AND u.ativo = ?';
      params.push(filters.ativo ? 1 : 0);
    }

    if (filters.bloqueado !== undefined) {
      if (filters.bloqueado) {
        whereClause += ' AND u.bloqueado_ate > ?';
        params.push(new Date().toISOString());
      } else {
        whereClause += ' AND (u.bloqueado_ate IS NULL OR u.bloqueado_ate <= ?)';
        params.push(new Date().toISOString());
      }
    }

    // Build ORDER BY clause
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'desc';
    const orderClause = `ORDER BY u.${orderBy} ${orderDirection.toUpperCase()}`;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios u 
      ${whereClause}
    `;

    const countResult = await this.db.get(countQuery, params);
    const total = countResult?.total || 0;

    // Data query
    const dataQuery = `
      SELECT u.* 
      FROM usuarios u 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;

    const rows = await this.db.all(dataQuery, [...params, limit, offset]);
    const usuarios = rows.map(row => this.mapRowToUsuario(row));

    return { usuarios, total };
  }

  async update(id: string, data: UpdateUsuarioRequest): Promise<Usuario | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.nome !== undefined) {
      updates.push('nome = ?');
      params.push(data.nome);
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }

    if (data.telefone !== undefined) {
      updates.push('telefone = ?');
      params.push(data.telefone);
    }

    if (data.role_id !== undefined) {
      updates.push('role_id = ?');
      params.push(data.role_id);
    }

    if (data.ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(data.ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `
      UPDATE usuarios 
      SET ${updates.join(', ')} 
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.run(query, params);
    return this.findById(id);
  }

  async updatePassword(id: string, senha_hash: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET senha_hash = ?, updated_at = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.run(query, [senha_hash, new Date().toISOString(), id]);
  }

  async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET ultimo_login = ?, tentativas_login = 0, updated_at = ? 
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await this.db.run(query, [now, now, id]);
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET tentativas_login = tentativas_login + 1, updated_at = ? 
      WHERE id = ?
    `;

    await this.db.run(query, [new Date().toISOString(), id]);
  }

  async lockUser(id: string, until: Date): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET bloqueado_ate = ?, updated_at = ? 
      WHERE id = ?
    `;

    await this.db.run(query, [until.toISOString(), new Date().toISOString(), id]);
  }

  async unlockUser(id: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET bloqueado_ate = NULL, tentativas_login = 0, updated_at = ? 
      WHERE id = ?
    `;

    await this.db.run(query, [new Date().toISOString(), id]);
  }

  async softDelete(id: string): Promise<void> {
    const query = `
      UPDATE usuarios 
      SET deleted_at = ?, updated_at = ? 
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await this.db.run(query, [now, now, id]);
  }

  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE email = ? AND deleted_at IS NULL
    `;
    const params: any[] = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await this.db.get(query, params);
    return (result?.count || 0) > 0;
  }

  // User Activity
  async createActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<UserActivity> {
    const id = uuidv4();
    const created_at = new Date();

    const userActivity: UserActivity = {
      id,
      ...activity,
      created_at
    };

    const query = `
      INSERT INTO user_activities (
        id, usuario_id, action, details, ip_address, 
        user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      userActivity.id,
      userActivity.usuario_id,
      userActivity.action,
      JSON.stringify(userActivity.details),
      userActivity.ip_address,
      userActivity.user_agent,
      userActivity.created_at.toISOString()
    ]);

    return userActivity;
  }

  async getUserActivities(usuario_id: string, limit: number = 50): Promise<UserActivity[]> {
    const query = `
      SELECT * FROM user_activities 
      WHERE usuario_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;

    const rows = await this.db.all(query, [usuario_id, limit]);
    
    return rows.map(row => ({
      ...row,
      details: JSON.parse(row.details || '{}'),
      created_at: new Date(row.created_at)
    }));
  }

  // Statistics
  async getStats(): Promise<UserStats> {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM usuarios WHERE deleted_at IS NULL',
      ativos: 'SELECT COUNT(*) as count FROM usuarios WHERE ativo = 1 AND deleted_at IS NULL',
      bloqueados: `
        SELECT COUNT(*) as count FROM usuarios 
        WHERE bloqueado_ate > ? AND deleted_at IS NULL
      `,
      loginsHoje: `
        SELECT COUNT(*) as count FROM usuarios 
        WHERE DATE(ultimo_login) = DATE(?) AND deleted_at IS NULL
      `,
      porRole: `
        SELECT r.nome as role_nome, COUNT(u.id) as count
        FROM roles r
        LEFT JOIN usuarios u ON r.id = u.role_id AND u.deleted_at IS NULL
        WHERE r.deleted_at IS NULL
        GROUP BY r.id, r.nome
        ORDER BY count DESC
      `
    };

    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    const [total, ativos, bloqueados, loginsHoje, porRole] = await Promise.all([
      this.db.get(queries.total),
      this.db.get(queries.ativos),
      this.db.get(queries.bloqueados, [now]),
      this.db.get(queries.loginsHoje, [today]),
      this.db.all(queries.porRole)
    ]);

    return {
      total_usuarios: total?.count || 0,
      usuarios_ativos: ativos?.count || 0,
      usuarios_bloqueados: bloqueados?.count || 0,
      logins_hoje: loginsHoje?.count || 0,
      usuarios_por_role: porRole.map(row => ({
        role_nome: row.role_nome,
        count: row.count
      }))
    };
  }

  private mapRowToUsuario(row: any): Usuario {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha_hash: row.senha_hash,
      telefone: row.telefone,
      role_id: row.role_id,
      ativo: Boolean(row.ativo),
      ultimo_login: row.ultimo_login ? new Date(row.ultimo_login) : undefined,
      tentativas_login: row.tentativas_login,
      bloqueado_ate: row.bloqueado_ate ? new Date(row.bloqueado_ate) : undefined,
      token_reset_senha: row.token_reset_senha,
      token_reset_expira: row.token_reset_expira ? new Date(row.token_reset_expira) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : undefined
    };
  }
}