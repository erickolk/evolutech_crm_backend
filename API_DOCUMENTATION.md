# 📚 Documentação da API - EvolutechCRM Backend

## 🌐 Informações Gerais

**Base URL:** `http://localhost:3008/api`  
**Versão:** 1.0.0  
**Formato de Dados:** JSON  
**Encoding:** UTF-8  

## 🔐 Autenticação

### Sistema de Autenticação JWT

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Para acessar endpoints protegidos, inclua o token no header:

```http
Authorization: Bearer <seu_jwt_token>
```

### Endpoints de Autenticação

#### `POST /auth/login`
Realiza login no sistema.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "MinhaSenh@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "usuario": {
      "id": "uuid",
      "nome": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "admin",
      "permissoes": ["read:all", "write:all"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": "8h"
  }
}
```

#### `POST /auth/logout`
Realiza logout e invalida o token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### `GET /auth/me`
Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "role": {
    "id": "uuid",
    "nome": "admin",
    "permissoes": ["read:all", "write:all"]
  }
}
```

## 👥 Clientes

### `GET /clientes`
Lista todos os clientes.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "whatsapp_id": "5511999999999",
    "cep": "01234-567",
    "endereco": "Rua das Flores, 123",
    "numero_residencia": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "data_nascimento": "1990-01-01",
    "tipo_cliente": "Pessoa Física",
    "cnpj": null,
    "razao_social": null,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### `POST /clientes`
Cria um novo cliente.

**Request:**
```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "whatsapp_id": "5511999999999",
  "cep": "01234-567",
  "endereco": "Rua das Flores, 123",
  "numero_residencia": "123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "data_nascimento": "1990-01-01",
  "tipo_cliente": "Pessoa Física"
}
```

### `PATCH /clientes/:id`
Atualiza dados de um cliente.

### `DELETE /clientes/:id`
Remove um cliente (soft delete).

## 📱 Dispositivos

### `GET /clientes/:clienteId/dispositivos`
Lista dispositivos de um cliente específico.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "cliente_id": "uuid",
    "tipo": "Smartphone",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "numero_serie": "SN123456789",
    "cor": "Preto",
    "observacoes": "Tela trincada",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### `POST /clientes/:clienteId/dispositivos`
Adiciona um novo dispositivo para um cliente.

**Request:**
```json
{
  "tipo": "Smartphone",
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "numero_serie": "SN123456789",
  "cor": "Preto",
  "observacoes": "Tela trincada"
}
```

### `GET /dispositivos/:id`
Busca um dispositivo específico.

### `PATCH /dispositivos/:id`
Atualiza dados de um dispositivo.

### `DELETE /dispositivos/:id`
Remove um dispositivo (soft delete).

## 🔧 Ordens de Serviço

### `GET /ordensDeServico`
Lista todas as ordens de serviço com filtros opcionais.

**Query Parameters:**
- `status`: `recebido`, `em_diagnostico`, `aguardando_pecas`, `aguardando_aprovacao`, `em_reparo`, `testando`, `pronto_retirada`, `entregue`, `cancelado`, `garantia`
- `tipo_os`: `normal`, `retorno`, `preventiva`, `garantia`
- `prioridade`: `baixa`, `normal`, `alta`, `urgente`
- `cliente_id`: UUID do cliente
- `tecnico_responsavel_id`: UUID do técnico
- `data_inicio`: Data no formato YYYY-MM-DD
- `data_fim`: Data no formato YYYY-MM-DD
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

**Response (200):**
```json
{
  "ordens": [
    {
      "id": "uuid",
      "cliente_id": "uuid",
      "dispositivo_id": "uuid",
      "tecnico_responsavel_id": "uuid",
      "status": "em_diagnostico",
      "tipo_os": "normal",
      "prioridade": "alta",
      "relato_cliente": "Tela não liga",
      "diagnostico_tecnico": "Display danificado",
      "acessorios_inclusos": "Carregador, fone",
      "data_prevista_entrega": "2024-01-15",
      "data_entrega_real": null,
      "valor_total_aprovado": 250.00,
      "forma_pagamento": "pix",
      "parcelas": 1,
      "desconto_aplicado": 0,
      "desconto_justificativa": null,
      "observacoes_internas": "Cliente frequente",
      "observacoes_cliente": "Urgente",
      "orcamento_detalhado": {},
      "numero_aos": "AOS-2024-001",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `POST /ordensDeServico`
Cria uma nova ordem de serviço.

**Request:**
```json
{
  "cliente_id": "uuid",
  "dispositivo_id": "uuid",
  "tipo_os": "normal",
  "prioridade": "alta",
  "relato_cliente": "Tela não liga",
  "acessorios_inclusos": "Carregador, fone",
  "data_prevista_entrega": "2024-01-15",
  "observacoes_cliente": "Urgente"
}
```

### `GET /ordensDeServico/:id`
Busca uma ordem de serviço específica.

### `PATCH /ordensDeServico/:id`
Atualiza uma ordem de serviço.

### `DELETE /ordensDeServico/:id`
Remove uma ordem de serviço (soft delete).

## 🏢 Fornecedores

### `GET /fornecedores`
Lista todos os fornecedores.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "TechParts Ltda",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@techparts.com",
    "telefone": "(11) 3333-4444",
    "endereco": "Av. Tecnologia, 500",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "observacoes": "Fornecedor principal",
    "ativo": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### `POST /fornecedores`
Cria um novo fornecedor.

### `GET /fornecedores/:id`
Busca um fornecedor específico.

### `PATCH /fornecedores/:id`
Atualiza dados de um fornecedor.

### `DELETE /fornecedores/:id`
Remove um fornecedor (soft delete).

## 📦 Produtos

### `GET /produtos`
Lista todos os produtos.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Display iPhone 12",
    "descricao": "Tela original para iPhone 12",
    "codigo_barras": "1234567890123",
    "preco_custo": 150.00,
    "preco_venda": 250.00,
    "margem_lucro": 66.67,
    "categoria": "Displays",
    "fornecedor_id": "uuid",
    "quantidade_atual": 10,
    "quantidade_minima": 5,
    "quantidade_maxima": 50,
    "localizacao": "A1-B2",
    "controlar_estoque": true,
    "permitir_venda_sem_estoque": false,
    "ativo": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### `POST /produtos`
Cria um novo produto.

**Request:**
```json
{
  "nome": "Display iPhone 12",
  "descricao": "Tela original para iPhone 12",
  "codigo_barras": "1234567890123",
  "preco_custo": 150.00,
  "preco_venda": 250.00,
  "categoria": "Displays",
  "fornecedor_id": "uuid",
  "quantidade_minima": 5,
  "quantidade_maxima": 50,
  "localizacao": "A1-B2",
  "controlar_estoque": true,
  "permitir_venda_sem_estoque": false
}
```

### Endpoints Específicos de Produtos

#### `GET /produtos/ativos`
Lista apenas produtos ativos.

#### `GET /produtos/estoque-baixo`
Lista produtos com estoque abaixo do mínimo.

#### `GET /produtos/sem-estoque`
Lista produtos sem estoque.

#### `GET /produtos/:id/estoque-atual`
Retorna o estoque atual de um produto.

#### `GET /produtos/codigo-barras/:codigoBarras`
Busca produto por código de barras.

#### `POST /produtos/:id/verificar-estoque`
Verifica disponibilidade de estoque.

**Request:**
```json
{
  "quantidade": 5
}
```

**Response (200):**
```json
{
  "disponivel": true,
  "quantidade_atual": 10,
  "quantidade_solicitada": 5,
  "quantidade_disponivel": 10
}
```

## 💰 Orçamentos

### `GET /orcamentos`
Lista todos os orçamentos.

### `POST /orcamentos`
Cria um novo orçamento.

### `GET /orcamentos/:id`
Busca um orçamento específico.

### `GET /orcamentos/os/:osId`
Lista orçamentos de uma OS específica.

### `GET /orcamentos/os/:osId/latest`
Retorna a versão mais recente do orçamento de uma OS.

### `POST /orcamentos/:id/nova-versao`
Cria uma nova versão do orçamento.

### `POST /orcamentos/:id/recalcular`
Recalcula valores do orçamento.

### `GET /orcamentos/:id/can-edit`
Verifica se o orçamento pode ser editado.

## 📋 Itens de Orçamento

### `GET /orcamentos/:id/itens`
Lista itens de um orçamento.

### `POST /orcamentos/:id/itens`
Adiciona item ao orçamento.

### `PATCH /orcamentos/:id/itens/:itemId/aprovar`
Aprova um item do orçamento.

### `PATCH /orcamentos/:id/itens/:itemId/rejeitar`
Rejeita um item do orçamento.

### `GET /orcamentos/:id/calculations`
Retorna cálculos do orçamento (totais, impostos, etc.).

## 📊 Estoque

### Movimentações de Estoque

#### `POST /estoque/movimentacao`
Registra uma movimentação de estoque.

**Request:**
```json
{
  "produto_id": "uuid",
  "tipo_movimentacao": "entrada",
  "quantidade": 10,
  "valor_unitario": 150.00,
  "motivo": "compra_fornecedor",
  "documento_referencia": "NF-001",
  "observacoes": "Compra mensal",
  "usuario_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "produto_id": "uuid",
  "tipo_movimentacao": "entrada",
  "quantidade": 10,
  "quantidade_anterior": 5,
  "quantidade_atual": 15,
  "valor_unitario": 150.00,
  "valor_total": 1500.00,
  "motivo": "compra_fornecedor",
  "documento_referencia": "NF-001",
  "usuario_id": "uuid",
  "observacoes": "Compra mensal",
  "created_at": "2024-01-01T10:00:00Z"
}
```

#### `GET /estoque/movimentacoes`
Lista todas as movimentações com filtros.

**Query Parameters:**
- `produto_id`: UUID do produto
- `tipo_movimentacao`: `entrada`, `saida`, `ajuste`, `transferencia`
- `motivo`: Motivo da movimentação
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)
- `usuario_id`: UUID do usuário
- `page`: Número da página
- `limit`: Itens por página

#### `GET /estoque/movimentacoes/:id`
Busca uma movimentação específica.

#### `GET /estoque/produto/:produtoId`
Lista movimentações de um produto específico.

### Controle de Estoque

#### `POST /estoque/ajuste`
Realiza ajuste de estoque.

**Request:**
```json
{
  "produto_id": "uuid",
  "quantidade_nova": 20,
  "motivo": "Inventário mensal",
  "observacoes": "Contagem física",
  "usuario_id": "uuid"
}
```

#### `POST /estoque/transferencia`
Transfere estoque entre localizações.

### Consultas de Estoque

#### `GET /estoque/historico/:produtoId`
Histórico completo de um produto.

#### `GET /estoque/relatorio`
Relatório de movimentações.

### Integração com Orçamentos

#### `POST /estoque/validar-disponibilidade`
Valida disponibilidade para orçamento.

**Request:**
```json
{
  "orcamento_id": "uuid",
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "disponivel": true,
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade_solicitada": 2,
      "quantidade_disponivel": 10,
      "disponivel": true
    }
  ]
}
```

#### `POST /estoque/registrar-saida-orcamento`
Registra saída de estoque para orçamento aprovado.

#### `POST /estoque/estornar-saida-orcamento`
Estorna saída de estoque de orçamento cancelado.

## ❌ Códigos de Erro

### Códigos HTTP Padrão

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **403 Forbidden**: Permissões insuficientes
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito de dados (ex: CPF duplicado)
- **422 Unprocessable Entity**: Dados válidos mas regra de negócio violada
- **500 Internal Server Error**: Erro interno do servidor

### Estrutura de Resposta de Erro

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email já está em uso"
    }
  ],
  "code": "DUPLICATE_EMAIL"
}
```

### Códigos de Erro Específicos

#### Autenticação
- `INVALID_CREDENTIALS`: Credenciais inválidas
- `TOKEN_EXPIRED`: Token JWT expirado
- `TOKEN_INVALID`: Token JWT inválido
- `USER_BLOCKED`: Usuário bloqueado
- `USER_INACTIVE`: Usuário inativo

#### Validação
- `REQUIRED_FIELD`: Campo obrigatório não informado
- `INVALID_FORMAT`: Formato de dados inválido
- `DUPLICATE_ENTRY`: Entrada duplicada
- `INVALID_REFERENCE`: Referência inválida (FK)

#### Estoque
- `INSUFFICIENT_STOCK`: Estoque insuficiente
- `NEGATIVE_STOCK_NOT_ALLOWED`: Estoque negativo não permitido
- `PRODUCT_INACTIVE`: Produto inativo
- `STOCK_MOVEMENT_LOCKED`: Movimentação bloqueada

## 🔒 Middleware e Segurança

### Middleware de Autenticação

Todos os endpoints (exceto `/auth/login`) requerem autenticação JWT.

### Middleware de Permissões

Diferentes endpoints requerem permissões específicas:

- **Leitura Geral**: `read:basic`
- **Escrita Geral**: `write:basic`
- **Administração**: `admin:all`
- **Estoque**: `stock:read`, `stock:write`
- **Orçamentos**: `budget:read`, `budget:write`

### Rate Limiting

- **Login**: 5 tentativas por minuto por IP
- **API Geral**: 100 requisições por minuto por usuário
- **Endpoints Críticos**: 10 requisições por minuto

### Logs de Auditoria

Todas as operações críticas são registradas:
- Login/Logout
- Criação/Alteração de registros
- Movimentações de estoque
- Aprovações de orçamentos

## 📝 Notas para o Frontend

### Headers Obrigatórios

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### Paginação

Endpoints que retornam listas suportam paginação:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

### Filtros

Muitos endpoints suportam filtros via query parameters. Consulte a documentação específica de cada endpoint.

### Soft Delete

Recursos deletados não são removidos fisicamente, apenas marcados como deletados. Use filtros apropriados se necessário.

### Timestamps

Todas as datas são retornadas no formato ISO 8601 (UTC):
```
2024-01-01T10:00:00.000Z
```

### Validação de Dados

O backend valida todos os dados de entrada. Erros de validação retornam status 400 com detalhes específicos.

---

**Última atualização:** Janeiro 2024  
**Versão da API:** 1.0.0  
**Contato:** Equipe de Desenvolvimento EvolutechCRM