import { Database } from '../database/database';
import { Role, CreateRoleRequest, UpdateRoleRequest, RoleFilters, UserRoleHistory } from './role.types';
import { v4 as uuidv4 } from 'uuid';

export class RoleRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async create(data: CreateRoleRequest): Promise<Role> {
    const id = uuidv4();
    const now = new Date();

    const role: Role = {
      id,
      nome: data.nome,
      descricao: data.descricao,
      permissoes: data.permissoes,
      ativo: true,
      sistema: false,
      created_at: now,
      updated_at: now
    };

    const query = `
      INSERT INTO roles (
        id, nome, descricao, permissoes, ativo, sistema, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      role.id,
      role.nome,
      role.descricao,
      JSON.stringify(role.permissoes),
      role.ativo ? 1 : 0,
      role.sistema ? 1 : 0,
      role.created_at.toISOString(),
      role.updated_at.toISOString()
    ]);

    return role;
  }

  async findById(id: string): Promise<Role | null> {
    const query = `
      SELECT * FROM roles 
      WHERE id = ? AND deleted_at IS NULL
    `;

    const row = await this.db.get(query, [id]);
    
    if (!row) return null;

    return this.mapRowToRole(row);
  }

  async findByName(nome: string): Promise<Role | null> {
    const query = `
      SELECT * FROM roles 
      WHERE nome = ? AND deleted_at IS NULL
    `;

    const row = await this.db.get(query, [nome]);
    
    if (!row) return null;

    return this.mapRowToRole(row);
  }

  async findAll(filters: RoleFilters = {}): Promise<{
    roles: Role[];
    total: number;
  }> {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE r.deleted_at IS NULL';
    const params: any[] = [];

    if (filters.nome) {
      whereClause += ' AND r.nome LIKE ?';
      params.push(`%${filters.nome}%`);
    }

    if (filters.ativo !== undefined) {
      whereClause += ' AND r.ativo = ?';
      params.push(filters.ativo ? 1 : 0);
    }

    if (filters.sistema !== undefined) {
      whereClause += ' AND r.sistema = ?';
      params.push(filters.sistema ? 1 : 0);
    }

    // Build ORDER BY clause
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'desc';
    let orderClause = '';

    if (orderBy === 'usuarios_count') {
      orderClause = `ORDER BY usuarios_count ${orderDirection.toUpperCase()}`;
    } else {
      orderClause = `ORDER BY r.${orderBy} ${orderDirection.toUpperCase()}`;
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM roles r 
      ${whereClause}
    `;

    const countResult = await this.db.get(countQuery, params);
    const total = countResult?.total || 0;

    // Data query with user count
    const dataQuery = `
      SELECT r.*, 
             COUNT(u.id) as usuarios_count
      FROM roles r 
      LEFT JOIN usuarios u ON r.id = u.role_id AND u.deleted_at IS NULL
      ${whereClause} 
      GROUP BY r.id
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;

    const rows = await this.db.all(dataQuery, [...params, limit, offset]);
    const roles = rows.map(row => this.mapRowToRole(row));

    return { roles, total };
  }

  async update(id: string, data: UpdateRoleRequest): Promise<Role | null> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.nome !== undefined) {
      updates.push('nome = ?');
      params.push(data.nome);
    }

    if (data.descricao !== undefined) {
      updates.push('descricao = ?');
      params.push(data.descricao);
    }

    if (data.permissoes !== undefined) {
      updates.push('permissoes = ?');
      params.push(JSON.stringify(data.permissoes));
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
      UPDATE roles 
      SET ${updates.join(', ')} 
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.run(query, params);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    // Check if role is a system role
    const role = await this.findById(id);
    if (role?.sistema) {
      throw new Error('Não é possível deletar roles do sistema');
    }

    // Check if role has users
    const userCount = await this.getUserCount(id);
    if (userCount > 0) {
      throw new Error('Não é possível deletar role que possui usuários associados');
    }

    const query = `
      UPDATE roles 
      SET deleted_at = ?, updated_at = ? 
      WHERE id = ?
    `;

    const now = new Date().toISOString();
    await this.db.run(query, [now, now, id]);
  }

  async getUserCount(roleId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE role_id = ? AND deleted_at IS NULL
    `;

    const result = await this.db.get(query, [roleId]);
    return result?.count || 0;
  }

  async isNameTaken(nome: string, excludeId?: string): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count 
      FROM roles 
      WHERE nome = ? AND deleted_at IS NULL
    `;
    const params: any[] = [nome];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await this.db.get(query, params);
    return (result?.count || 0) > 0;
  }

  // Permission management
  async updatePermissions(roleId: string, permissoes: string[]): Promise<void> {
    const query = `
      UPDATE roles 
      SET permissoes = ?, updated_at = ? 
      WHERE id = ? AND deleted_at IS NULL
    `;

    await this.db.run(query, [
      JSON.stringify(permissoes),
      new Date().toISOString(),
      roleId
    ]);
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const query = `
      SELECT permissoes FROM roles 
      WHERE id = ? AND deleted_at IS NULL
    `;

    const result = await this.db.get(query, [roleId]);
    
    if (!result || !result.permissoes) {
      return [];
    }

    try {
      return JSON.parse(result.permissoes);
    } catch {
      return [];
    }
  }

  async hasPermission(roleId: string, permission: string): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId);
    return permissions.includes(permission);
  }

  async hasAnyPermission(roleId: string, permissions: string[]): Promise<boolean> {
    const rolePermissions = await this.getRolePermissions(roleId);
    return permissions.some(permission => rolePermissions.includes(permission));
  }

  async hasAllPermissions(roleId: string, permissions: string[]): Promise<boolean> {
    const rolePermissions = await this.getRolePermissions(roleId);
    return permissions.every(permission => rolePermissions.includes(permission));
  }

  // User role history
  async createRoleHistory(data: Omit<UserRoleHistory, 'id' | 'created_at'>): Promise<UserRoleHistory> {
    const id = uuidv4();
    const created_at = new Date();

    const history: UserRoleHistory = {
      id,
      ...data,
      created_at
    };

    const query = `
      INSERT INTO user_role_history (
        id, usuario_id, role_anterior_id, role_nova_id, 
        motivo, alterado_por, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(query, [
      history.id,
      history.usuario_id,
      history.role_anterior_id,
      history.role_nova_id,
      history.motivo,
      history.alterado_por,
      history.created_at.toISOString()
    ]);

    return history;
  }

  async getUserRoleHistory(usuarioId: string, limit: number = 50): Promise<UserRoleHistory[]> {
    const query = `
      SELECT h.*,
             ra.nome as role_anterior_nome,
             rn.nome as role_nova_nome,
             u.nome as alterado_por_nome
      FROM user_role_history h
      LEFT JOIN roles ra ON h.role_anterior_id = ra.id
      LEFT JOIN roles rn ON h.role_nova_id = rn.id
      LEFT JOIN usuarios u ON h.alterado_por = u.id
      WHERE h.usuario_id = ?
      ORDER BY h.created_at DESC
      LIMIT ?
    `;

    const rows = await this.db.all(query, [usuarioId, limit]);
    
    return rows.map(row => ({
      id: row.id,
      usuario_id: row.usuario_id,
      role_anterior_id: row.role_anterior_id,
      role_nova_id: row.role_nova_id,
      motivo: row.motivo,
      alterado_por: row.alterado_por,
      created_at: new Date(row.created_at)
    }));
  }

  // System roles initialization
  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        nome: 'Administrador',
        descricao: 'Acesso total ao sistema',
        permissoes: ['*'], // All permissions
        sistema: true
      },
      {
        nome: 'Gerente',
        descricao: 'Acesso de gerenciamento com algumas restrições',
        permissoes: [
          'usuarios:listar', 'usuarios:criar', 'usuarios:editar',
          'produtos:*', 'estoque:*', 'orcamentos:*'
        ],
        sistema: true
      },
      {
        nome: 'Vendedor',
        descricao: 'Acesso para vendas e consultas',
        permissoes: [
          'produtos:listar', 'estoque:listar',
          'orcamentos:listar', 'orcamentos:criar', 'orcamentos:editar'
        ],
        sistema: true
      },
      {
        nome: 'Estoquista',
        descricao: 'Acesso para gerenciamento de estoque',
        permissoes: [
          'produtos:listar', 'produtos:gerenciar_estoque',
          'estoque:*'
        ],
        sistema: true
      }
    ];

    for (const roleData of systemRoles) {
      const existing = await this.findByName(roleData.nome);
      
      if (!existing) {
        const id = uuidv4();
        const now = new Date();

        const query = `
          INSERT INTO roles (
            id, nome, descricao, permissoes, ativo, sistema, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await this.db.run(query, [
          id,
          roleData.nome,
          roleData.descricao,
          JSON.stringify(roleData.permissoes),
          1, // ativo
          1, // sistema
          now.toISOString(),
          now.toISOString()
        ]);
      }
    }
  }

  private mapRowToRole(row: any): Role {
    let permissoes: string[] = [];
    
    if (row.permissoes) {
      try {
        permissoes = JSON.parse(row.permissoes);
      } catch {
        permissoes = [];
      }
    }

    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      permissoes,
      ativo: Boolean(row.ativo),
      sistema: Boolean(row.sistema),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : undefined
    };
  }
}