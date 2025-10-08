# PROMPT 03: Implementação do Sistema de Autenticação e Usuários - Evolutech CRM

## 🎯 OBJETIVO
Implementar sistema completo de autenticação com JWT, controle de usuários, roles/permissões e middleware de segurança para o Evolutech CRM.

## 📋 CONTEXTO DO PROJETO
Você está trabalhando no Evolutech CRM. O projeto já possui:
- Módulos CRUD: Clientes, Dispositivos, OS, Fornecedores, Produtos
- Possíveis módulos: Orçamentos, Estoque (se já implementados)
- Supabase (PostgreSQL) + TypeScript + Express.js
- **CRÍTICO:** Este módulo é base para todos os outros - implementar com máxima segurança

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### 1. ENTIDADES DE USUÁRIOS E PERMISSÕES

#### 1.1 Tabela `usuarios`
```sql
- id (UUID, PK)
- nome (VARCHAR(100))
- email (VARCHAR(150), UNIQUE)
- senha_hash (VARCHAR(255)) - bcrypt
- telefone (VARCHAR(20))
- role_id (UUID, FK para roles)
- ativo (BOOLEAN DEFAULT true)
- ultimo_login (TIMESTAMP)
- tentativas_login (INTEGER DEFAULT 0)
- bloqueado_ate (TIMESTAMP, nullable)
- token_reset_senha (VARCHAR(255), nullable)
- token_reset_expira (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP)
```

#### 1.2 Tabela `roles`
```sql
- id (UUID, PK)
- nome (VARCHAR(50), UNIQUE) - 'admin', 'tecnico', 'atendente'
- descricao (VARCHAR(200))
- permissoes (JSONB) - array de permissões
- ativo (BOOLEAN DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 1.3 Tabela `sessoes` (opcional - para controle avançado)
```sql
- id (UUID, PK)
- usuario_id (UUID, FK para usuarios)
- token_jwt (TEXT)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- expires_at (TIMESTAMP)
- revogado (BOOLEAN DEFAULT false)
- created_at (TIMESTAMP)
```

### 2. SISTEMA DE ROLES E PERMISSÕES

#### 2.1 Roles Padrão
```typescript
enum UserRole {
  ADMIN = 'admin',           // Acesso total
  TECNICO = 'tecnico',       // OS, orçamentos, estoque
  ATENDENTE = 'atendente'    // Clientes, consultas, recepção
}
```

#### 2.2 Permissões Granulares
```typescript
enum Permission {
  // Clientes
  'clientes:read',
  'clientes:write',
  'clientes:delete',
  
  // Ordens de Serviço
  'os:read',
  'os:write',
  'os:delete',
  'os:assign', // atribuir técnico
  
  // Orçamentos
  'orcamentos:read',
  'orcamentos:write',
  'orcamentos:approve',
  
  // Estoque
  'estoque:read',
  'estoque:write',
  'estoque:movimentar',
  
  // Produtos/Fornecedores
  'produtos:read',
  'produtos:write',
  'fornecedores:read',
  'fornecedores:write',
  
  // Usuários (apenas admin)
  'usuarios:read',
  'usuarios:write',
  'usuarios:delete',
  
  // Relatórios
  'relatorios:financeiro',
  'relatorios:operacional'
}
```

### 3. ESTRUTURA DE ARQUIVOS A CRIAR

```
src/auth/
├── auth.types.ts
├── auth.repository.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.middleware.ts

src/usuarios/
├── usuario.types.ts
├── usuario.repository.ts
├── usuario.service.ts
└── usuario.controller.ts

src/roles/
├── role.types.ts
├── role.repository.ts
├── role.service.ts
└── role.controller.ts

src/middleware/
├── authMiddleware.ts
├── permissionMiddleware.ts
└── rateLimitMiddleware.ts
```

### 4. ENDPOINTS DA API

#### 4.1 Autenticação
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/logout` - Logout (invalidar token)
- `POST /api/auth/refresh` - Renovar token JWT
- `POST /api/auth/forgot-password` - Solicitar reset de senha
- `POST /api/auth/reset-password` - Resetar senha com token
- `GET /api/auth/me` - Dados do usuário logado
- `PATCH /api/auth/change-password` - Alterar senha

#### 4.2 Usuários (apenas admin)
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Desativar usuário
- `PATCH /api/usuarios/:id/role` - Alterar role
- `PATCH /api/usuarios/:id/unlock` - Desbloquear usuário

#### 4.3 Roles (apenas admin)
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Criar role personalizada
- `PUT /api/roles/:id` - Atualizar role
- `GET /api/roles/:id/permissions` - Listar permissões

### 5. SEGURANÇA E VALIDAÇÕES

#### 5.1 Autenticação JWT
```typescript
// Configuração JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '8h',
  refreshExpiresIn: '7d'
}
```

#### 5.2 Validações de Senha
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula, 1 minúscula, 1 número
- Não pode ser igual às 3 últimas senhas
- Hash com bcrypt (salt rounds: 12)

#### 5.3 Proteção contra Ataques
- Rate limiting: máximo 5 tentativas de login por minuto
- Bloqueio temporário após 5 tentativas falhadas
- Logs de segurança para auditoria
- Validação de força da senha

#### 5.4 Middleware de Autenticação
```typescript
// Proteger rotas
app.use('/api/protected', authMiddleware);
app.use('/api/admin', authMiddleware, adminOnlyMiddleware);
```

### 6. REGRAS DE NEGÓCIO CRÍTICAS

#### 6.1 Controle de Acesso
- Usuário deve estar ativo para fazer login
- Token JWT deve ser válido e não expirado
- Permissões verificadas em cada endpoint protegido
- Logs de todas as ações sensíveis

#### 6.2 Gestão de Sessões
- Logout invalida o token
- Tokens expiram automaticamente
- Possibilidade de revogar todas as sessões de um usuário
- Controle de sessões simultâneas (opcional)

#### 6.3 Atribuição de Técnicos
- Apenas usuários com role 'tecnico' podem ser atribuídos a OS
- Técnico só vê suas próprias OS (exceto admin)
- Histórico de atribuições para auditoria

## 🔧 INSTRUÇÕES TÉCNICAS

### 1. IMPLEMENTAÇÃO GRADUAL

#### Fase 1: Base de Autenticação
1. Criar entidades Usuario e Role
2. Implementar hash de senhas com bcrypt
3. Configurar JWT básico

#### Fase 2: Middleware e Proteção
1. Middleware de autenticação
2. Middleware de permissões
3. Rate limiting e proteções

#### Fase 3: Funcionalidades Avançadas
1. Reset de senha por email
2. Logs de auditoria
3. Controle de sessões

### 2. CONFIGURAÇÃO DE AMBIENTE
```env
# Adicionar ao .env
JWT_SECRET=sua_chave_super_secreta_aqui
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=15
```

### 3. INTEGRAÇÃO COM MÓDULOS EXISTENTES

#### 3.1 Atualizar Ordens de Serviço
- Adicionar campo `tecnico_responsavel_id`
- Filtrar OS por técnico (se não for admin)
- Registrar quem criou/modificou a OS

#### 3.2 Proteger Todos os Endpoints
- Aplicar middleware de auth em todas as rotas
- Verificar permissões específicas por ação
- Logs de auditoria em operações críticas

## 📊 DADOS INICIAIS (SEED)

### 1. Roles Padrão
```sql
-- Admin: todas as permissões
-- Técnico: OS, orçamentos, estoque (read/write)
-- Atendente: clientes, consultas (read), OS (read)
```

### 2. Usuário Administrador Inicial
```sql
-- Email: admin@evolutech.com
-- Senha: Admin123! (deve ser alterada no primeiro login)
-- Role: admin
```

## 📝 TAREFAS ESPECÍFICAS

### 1. **Implementar Base de Autenticação**
- Criar entidades Usuario, Role
- Implementar hash de senhas
- Configurar JWT

### 2. **Desenvolver Middleware de Segurança**
- Middleware de autenticação
- Middleware de permissões
- Rate limiting

### 3. **Criar Sistema de Usuários**
- CRUD de usuários
- Gestão de roles
- Reset de senha

### 4. **Integrar com Módulos Existentes**
- Proteger todas as rotas
- Adicionar campos de auditoria
- Implementar filtros por usuário

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Sistema de login/logout funcional
- [ ] JWT implementado e seguro
- [ ] Roles e permissões operacionais
- [ ] Middleware de autenticação ativo
- [ ] Proteção contra ataques básicos
- [ ] Reset de senha funcionando
- [ ] Integração com módulos existentes
- [ ] Logs de auditoria implementados
- [ ] Usuário admin inicial criado
- [ ] Documentação de segurança completa

## 🔄 ATUALIZAÇÃO DO PLANO

**APÓS COMPLETAR ESTA IMPLEMENTAÇÃO, ATUALIZE O ARQUIVO:**
`/c:/Users/erick/OneDrive/Documentos/Projetos/EvolutechCRM_backend/PLANO_DESENVOLVIMENTO.md`

**Marque como CONCLUÍDO:**
- ✅ 1.3 Sistema de Autenticação e Usuários (Prioridade: ALTA)

**Próximo passo sugerido:**
- Implementar 2.1 Sistema de Status e Workflow de OS

---

**CRÍTICO:** Este módulo é a base de segurança de todo o sistema. Teste exaustivamente antes de prosseguir. Implemente todas as proteções de segurança mencionadas.