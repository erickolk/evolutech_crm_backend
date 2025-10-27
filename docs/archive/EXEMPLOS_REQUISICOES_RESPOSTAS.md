# Exemplos de Requisições e Respostas - API CRM EvoluTech

## 📋 Informações Gerais

### URL Base
```
http://localhost:3008/api
```

### Headers Padrão
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Códigos de Status HTTP
- `200` - OK (Sucesso)
- `201` - Created (Criado com sucesso)
- `204` - No Content (Deletado com sucesso)
- `400` - Bad Request (Dados inválidos)
- `401` - Unauthorized (Não autorizado)
- `403` - Forbidden (Acesso negado)
- `404` - Not Found (Não encontrado)
- `423` - Locked (Usuário bloqueado)
- `500` - Internal Server Error (Erro interno)

---

## 🔐 AUTENTICAÇÃO

### 1. Login
**POST** `/api/auth/login`

#### Requisição
```json
{
  "email": "admin@evolutech.com",
  "senha": "senha123"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "usuario": {
      "id": "uuid-123",
      "nome": "Administrador",
      "email": "admin@evolutech.com",
      "role": "admin",
      "permissoes": ["read", "write", "delete", "admin"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": "24h"
  }
}
```

#### Resposta de Erro - Credenciais Inválidas (401)
```json
{
  "success": false,
  "message": "Credenciais inválidas"
}
```

#### Resposta de Erro - Usuário Bloqueado (423)
```json
{
  "success": false,
  "message": "Usuário bloqueado por múltiplas tentativas de login"
}
```

#### Resposta de Erro - Usuário Inativo (403)
```json
{
  "success": false,
  "message": "Usuário inativo"
}
```

### 2. Logout
**POST** `/api/auth/logout`

#### Headers
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 3. Dados do Usuário Logado
**GET** `/api/auth/me`

#### Headers
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid-123",
      "nome": "Administrador",
      "email": "admin@evolutech.com",
      "role": "admin",
      "permissoes": ["read", "write", "delete", "admin"]
    }
  }
}
```

### 4. Verificar Token
**GET** `/api/auth`

#### Headers
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Token válido"
}
```

#### Resposta de Erro (401)
```json
{
  "success": false,
  "message": "Token inválido"
}
```

### 5. Renovar Token
**POST** `/api/auth/refresh`

#### Requisição
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new_refresh_token_here",
    "expiresIn": "24h"
  }
}
```

### 6. Esqueci Minha Senha
**POST** `/api/auth/forgot-password`

#### Requisição
```json
{
  "email": "usuario@exemplo.com"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

### 7. Resetar Senha
**POST** `/api/auth/reset-password`

#### Requisição
```json
{
  "token": "reset_token_from_email",
  "novaSenha": "novaSenha123"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### 8. Alterar Senha
**PATCH** `/api/auth/change-password`

#### Headers
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Requisição
```json
{
  "senhaAtual": "senhaAtual123",
  "novaSenha": "novaSenha456"
}
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

## 👥 CLIENTES

### 1. Listar Clientes
**GET** `/api/clientes`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&search=João
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-cliente-1",
    "created_at": "2024-01-15T10:30:00.000Z",
    "nome": "João Silva Santos",
    "cpf": "123.456.789-00",
    "whatsapp_id": "5511999999999",
    "cep": "01234-567",
    "endereco": "Rua das Flores, 123",
    "numero_residencia": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "data_nascimento": "1985-03-15",
    "tipo_cliente": "Pessoa Física",
    "cnpj": null,
    "razao_social": null
  },
  {
    "id": "uuid-cliente-2",
    "created_at": "2024-01-16T14:20:00.000Z",
    "nome": "Empresa XYZ Ltda",
    "cpf": null,
    "whatsapp_id": "5511888888888",
    "cep": "04567-890",
    "endereco": "Av. Paulista, 1000",
    "numero_residencia": "1000",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "data_nascimento": null,
    "tipo_cliente": "Pessoa Jurídica",
    "cnpj": "12.345.678/0001-90",
    "razao_social": "Empresa XYZ Ltda"
  }
]
```

### 2. Criar Cliente
**POST** `/api/clientes`

#### Requisição - Pessoa Física
```json
{
  "nome": "Maria Santos Silva",
  "cpf": "987.654.321-00",
  "whatsapp_id": "5511777777777",
  "cep": "12345-678",
  "endereco": "Rua Nova, 456",
  "numero_residencia": "456",
  "bairro": "Vila Nova",
  "cidade": "São Paulo",
  "data_nascimento": "1990-07-20",
  "tipo_cliente": "Pessoa Física"
}
```

#### Requisição - Pessoa Jurídica
```json
{
  "nome": "Contato da Empresa ABC",
  "whatsapp_id": "5511666666666",
  "cep": "54321-987",
  "endereco": "Rua Comercial, 789",
  "numero_residencia": "789",
  "bairro": "Centro Comercial",
  "cidade": "São Paulo",
  "tipo_cliente": "Pessoa Jurídica",
  "cnpj": "98.765.432/0001-10",
  "razao_social": "Empresa ABC Comércio Ltda"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-cliente",
  "created_at": "2024-01-17T09:15:00.000Z",
  "nome": "Maria Santos Silva",
  "cpf": "987.654.321-00",
  "whatsapp_id": "5511777777777",
  "cep": "12345-678",
  "endereco": "Rua Nova, 456",
  "numero_residencia": "456",
  "bairro": "Vila Nova",
  "cidade": "São Paulo",
  "data_nascimento": "1990-07-20",
  "tipo_cliente": "Pessoa Física",
  "cnpj": null,
  "razao_social": null
}
```

#### Resposta de Erro - Dados Obrigatórios (400)
```json
{
  "message": "Nome, CPF e WhatsApp são obrigatórios."
}
```

### 3. Atualizar Cliente
**PATCH** `/api/clientes/:id`

#### Requisição
```json
{
  "nome": "João Silva Santos Atualizado",
  "endereco": "Rua das Flores, 456",
  "numero_residencia": "456",
  "telefone": "(11) 98888-7777"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-cliente-1",
  "created_at": "2024-01-15T10:30:00.000Z",
  "nome": "João Silva Santos Atualizado",
  "cpf": "123.456.789-00",
  "whatsapp_id": "5511999999999",
  "cep": "01234-567",
  "endereco": "Rua das Flores, 456",
  "numero_residencia": "456",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "data_nascimento": "1985-03-15",
  "tipo_cliente": "Pessoa Física",
  "cnpj": null,
  "razao_social": null
}
```

#### Resposta de Erro - CPF não pode ser alterado (400)
```json
{
  "message": "Não é permitido alterar o CPF de um cliente."
}
```

### 4. Deletar Cliente
**DELETE** `/api/clientes/:id`

#### Resposta de Sucesso (204)
```
(Sem conteúdo)
```

#### Resposta de Erro - ID obrigatório (400)
```json
{
  "message": "O ID do cliente é obrigatório."
}
```

---

## 📱 DISPOSITIVOS

### 1. Listar Todos os Dispositivos
**GET** `/api/dispositivos`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-dispositivo-1",
    "cliente_id": "uuid-cliente-1",
    "tipo": "Smartphone",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "numero_serie": "SN123456789",
    "imei": "123456789012345",
    "cor": "Preto",
    "estado_conservacao": "Bom",
    "acessorios": "Carregador, Fone de ouvido",
    "observacoes": "Tela com pequeno risco",
    "created_at": "2024-01-15T11:00:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "deleted_at": null
  }
]
```

### 2. Buscar Dispositivo por ID
**GET** `/api/dispositivos/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-dispositivo-1",
  "cliente_id": "uuid-cliente-1",
  "tipo": "Smartphone",
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "numero_serie": "SN123456789",
  "imei": "123456789012345",
  "cor": "Preto",
  "estado_conservacao": "Bom",
  "acessorios": "Carregador, Fone de ouvido",
  "observacoes": "Tela com pequeno risco",
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "deleted_at": null
}
```

### 3. Dispositivos de um Cliente
**GET** `/api/clientes/:clienteId/dispositivos`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-dispositivo-1",
    "cliente_id": "uuid-cliente-1",
    "tipo": "Smartphone",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "numero_serie": "SN123456789",
    "imei": "123456789012345",
    "cor": "Preto",
    "estado_conservacao": "Bom",
    "acessorios": "Carregador, Fone de ouvido",
    "observacoes": "Tela com pequeno risco",
    "created_at": "2024-01-15T11:00:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z",
    "deleted_at": null
  }
]
```

### 4. Criar Dispositivo para Cliente
**POST** `/api/clientes/:clienteId/dispositivos`

#### Requisição
```json
{
  "tipo": "Notebook",
  "marca": "Dell",
  "modelo": "Inspiron 15",
  "numero_serie": "DL987654321",
  "cor": "Prata",
  "estado_conservacao": "Excelente",
  "acessorios": "Carregador, Mouse",
  "observacoes": "Sem defeitos aparentes"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-dispositivo",
  "cliente_id": "uuid-cliente-1",
  "tipo": "Notebook",
  "marca": "Dell",
  "modelo": "Inspiron 15",
  "numero_serie": "DL987654321",
  "imei": null,
  "cor": "Prata",
  "estado_conservacao": "Excelente",
  "acessorios": "Carregador, Mouse",
  "observacoes": "Sem defeitos aparentes",
  "created_at": "2024-01-17T10:30:00.000Z",
  "updated_at": "2024-01-17T10:30:00.000Z",
  "deleted_at": null
}
```

### 5. Atualizar Dispositivo
**PATCH** `/api/dispositivos/:id`

#### Requisição
```json
{
  "estado_conservacao": "Regular",
  "observacoes": "Tela com risco maior, bateria com problema"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-dispositivo-1",
  "cliente_id": "uuid-cliente-1",
  "tipo": "Smartphone",
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "numero_serie": "SN123456789",
  "imei": "123456789012345",
  "cor": "Preto",
  "estado_conservacao": "Regular",
  "acessorios": "Carregador, Fone de ouvido",
  "observacoes": "Tela com risco maior, bateria com problema",
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-17T14:20:00.000Z",
  "deleted_at": null
}
```

### 6. Deletar Dispositivo (Soft Delete)
**DELETE** `/api/dispositivos/:id`

#### Resposta de Sucesso (204)
```
(Sem conteúdo)
```

---

## 🔧 ORDENS DE SERVIÇO

### 1. Listar Ordens de Serviço
**GET** `/api/ordensDeServico`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&status=Aberta&cliente_id=uuid-cliente-1
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-os-1",
    "numero_os": "OS-2024-001",
    "cliente_id": "uuid-cliente-1",
    "dispositivo_id": "uuid-dispositivo-1",
    "descricao_problema": "Tela não liga, possível problema na bateria",
    "descricao_servico": "Diagnóstico completo do dispositivo",
    "status": "Em Andamento",
    "prioridade": "Alta",
    "data_entrada": "2024-01-15T09:00:00.000Z",
    "data_prevista": "2024-01-18T18:00:00.000Z",
    "data_conclusao": null,
    "valor_servico": 150.00,
    "valor_pecas": 80.00,
    "valor_total": 230.00,
    "observacoes": "Cliente relatou que o problema começou após queda",
    "tecnico_responsavel": "João Técnico",
    "created_at": "2024-01-15T09:00:00.000Z",
    "updated_at": "2024-01-16T14:30:00.000Z"
  }
]
```

### 2. Criar Ordem de Serviço
**POST** `/api/ordensDeServico`

#### Requisição
```json
{
  "cliente_id": "uuid-cliente-1",
  "dispositivo_id": "uuid-dispositivo-1",
  "descricao_problema": "Smartphone não carrega, conector USB com problema",
  "descricao_servico": "Troca do conector de carga",
  "prioridade": "Média",
  "data_prevista": "2024-01-20T18:00:00.000Z",
  "valor_servico": 80.00,
  "observacoes": "Cliente precisa do aparelho até sexta-feira",
  "tecnico_responsavel": "Maria Técnica"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-nova-os",
  "numero_os": "OS-2024-002",
  "cliente_id": "uuid-cliente-1",
  "dispositivo_id": "uuid-dispositivo-1",
  "descricao_problema": "Smartphone não carrega, conector USB com problema",
  "descricao_servico": "Troca do conector de carga",
  "status": "Aberta",
  "prioridade": "Média",
  "data_entrada": "2024-01-17T10:00:00.000Z",
  "data_prevista": "2024-01-20T18:00:00.000Z",
  "data_conclusao": null,
  "valor_servico": 80.00,
  "valor_pecas": 0.00,
  "valor_total": 80.00,
  "observacoes": "Cliente precisa do aparelho até sexta-feira",
  "tecnico_responsavel": "Maria Técnica",
  "created_at": "2024-01-17T10:00:00.000Z",
  "updated_at": "2024-01-17T10:00:00.000Z"
}
```

### 3. Buscar OS por ID
**GET** `/api/ordensDeServico/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-os-1",
  "numero_os": "OS-2024-001",
  "cliente_id": "uuid-cliente-1",
  "dispositivo_id": "uuid-dispositivo-1",
  "descricao_problema": "Tela não liga, possível problema na bateria",
  "descricao_servico": "Diagnóstico completo do dispositivo",
  "status": "Em Andamento",
  "prioridade": "Alta",
  "data_entrada": "2024-01-15T09:00:00.000Z",
  "data_prevista": "2024-01-18T18:00:00.000Z",
  "data_conclusao": null,
  "valor_servico": 150.00,
  "valor_pecas": 80.00,
  "valor_total": 230.00,
  "observacoes": "Cliente relatou que o problema começou após queda",
  "tecnico_responsavel": "João Técnico",
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-01-16T14:30:00.000Z"
}
```

### 4. Atualizar OS
**PATCH** `/api/ordensDeServico/:id`

#### Requisição
```json
{
  "status": "Concluída",
  "data_conclusao": "2024-01-17T16:00:00.000Z",
  "valor_pecas": 120.00,
  "valor_total": 270.00,
  "observacoes": "Serviço concluído. Trocada bateria e display. Testado e funcionando perfeitamente."
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-os-1",
  "numero_os": "OS-2024-001",
  "cliente_id": "uuid-cliente-1",
  "dispositivo_id": "uuid-dispositivo-1",
  "descricao_problema": "Tela não liga, possível problema na bateria",
  "descricao_servico": "Diagnóstico completo do dispositivo",
  "status": "Concluída",
  "prioridade": "Alta",
  "data_entrada": "2024-01-15T09:00:00.000Z",
  "data_prevista": "2024-01-18T18:00:00.000Z",
  "data_conclusao": "2024-01-17T16:00:00.000Z",
  "valor_servico": 150.00,
  "valor_pecas": 120.00,
  "valor_total": 270.00,
  "observacoes": "Serviço concluído. Trocada bateria e display. Testado e funcionando perfeitamente.",
  "tecnico_responsavel": "João Técnico",
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-01-17T16:00:00.000Z"
}
```

### 5. Deletar OS
**DELETE** `/api/ordensDeServico/:id`

#### Resposta de Sucesso (204)
```
(Sem conteúdo)
```

---

## 🏪 FORNECEDORES

### 1. Listar Fornecedores
**GET** `/api/fornecedores`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-fornecedor-1",
    "nome": "TechParts Distribuidora",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@techparts.com.br",
    "telefone": "(11) 3333-4444",
    "endereco": "Rua das Peças, 100",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "contato_principal": "Carlos Vendas",
    "observacoes": "Fornecedor principal de displays e baterias",
    "ativo": true,
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": "2024-01-10T08:00:00.000Z"
  }
]
```

### 2. Criar Fornecedor
**POST** `/api/fornecedores`

#### Requisição
```json
{
  "nome": "MobileParts Ltda",
  "cnpj": "98.765.432/0001-10",
  "email": "vendas@mobileparts.com.br",
  "telefone": "(11) 5555-6666",
  "endereco": "Av. Tecnologia, 500",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "04567-890",
  "contato_principal": "Ana Comercial",
  "observacoes": "Especializado em peças para smartphones"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-fornecedor",
  "nome": "MobileParts Ltda",
  "cnpj": "98.765.432/0001-10",
  "email": "vendas@mobileparts.com.br",
  "telefone": "(11) 5555-6666",
  "endereco": "Av. Tecnologia, 500",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "04567-890",
  "contato_principal": "Ana Comercial",
  "observacoes": "Especializado em peças para smartphones",
  "ativo": true,
  "created_at": "2024-01-17T11:00:00.000Z",
  "updated_at": "2024-01-17T11:00:00.000Z"
}
```

### 3. Buscar Fornecedor por ID
**GET** `/api/fornecedores/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-fornecedor-1",
  "nome": "TechParts Distribuidora",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@techparts.com.br",
  "telefone": "(11) 3333-4444",
  "endereco": "Rua das Peças, 100",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "contato_principal": "Carlos Vendas",
  "observacoes": "Fornecedor principal de displays e baterias",
  "ativo": true,
  "created_at": "2024-01-10T08:00:00.000Z",
  "updated_at": "2024-01-10T08:00:00.000Z"
}
```

### 4. Atualizar Fornecedor
**PATCH** `/api/fornecedores/:id`

#### Requisição
```json
{
  "telefone": "(11) 3333-5555",
  "email": "novo-contato@techparts.com.br",
  "contato_principal": "Roberto Vendas"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-fornecedor-1",
  "nome": "TechParts Distribuidora",
  "cnpj": "12.345.678/0001-90",
  "email": "novo-contato@techparts.com.br",
  "telefone": "(11) 3333-5555",
  "endereco": "Rua das Peças, 100",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "contato_principal": "Roberto Vendas",
  "observacoes": "Fornecedor principal de displays e baterias",
  "ativo": true,
  "created_at": "2024-01-10T08:00:00.000Z",
  "updated_at": "2024-01-17T12:00:00.000Z"
}
```

### 5. Deletar Fornecedor
**DELETE** `/api/fornecedores/:id`

#### Resposta de Sucesso (204)
```
(Sem conteúdo)
```

---

## 📦 PRODUTOS

### 1. Listar Produtos
**GET** `/api/produtos`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&search=bateria&categoria=Peças
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-produto-1",
    "nome": "Bateria Samsung Galaxy S21",
    "descricao": "Bateria original Samsung para Galaxy S21",
    "categoria": "Baterias",
    "codigo_barras": "7891234567890",
    "preco_custo": 45.00,
    "preco_venda": 89.90,
    "margem_lucro": 99.78,
    "fornecedor_id": "uuid-fornecedor-1",
    "controla_estoque": true,
    "estoque_minimo": 5,
    "estoque_atual": 15,
    "unidade_medida": "UN",
    "peso": 0.05,
    "dimensoes": "7x5x0.5cm",
    "observacoes": "Compatível com modelo SM-G991B",
    "ativo": true,
    "created_at": "2024-01-12T10:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
]
```

### 2. Criar Produto
**POST** `/api/produtos`

#### Requisição
```json
{
  "nome": "Display iPhone 12",
  "descricao": "Display LCD original para iPhone 12",
  "categoria": "Displays",
  "codigo_barras": "7891234567891",
  "preco_custo": 180.00,
  "preco_venda": 350.00,
  "fornecedor_id": "uuid-fornecedor-1",
  "controla_estoque": true,
  "estoque_minimo": 3,
  "unidade_medida": "UN",
  "peso": 0.15,
  "dimensoes": "15x7x0.3cm",
  "observacoes": "Inclui touch screen integrado"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-produto",
  "nome": "Display iPhone 12",
  "descricao": "Display LCD original para iPhone 12",
  "categoria": "Displays",
  "codigo_barras": "7891234567891",
  "preco_custo": 180.00,
  "preco_venda": 350.00,
  "margem_lucro": 94.44,
  "fornecedor_id": "uuid-fornecedor-1",
  "controla_estoque": true,
  "estoque_minimo": 3,
  "estoque_atual": 0,
  "unidade_medida": "UN",
  "peso": 0.15,
  "dimensoes": "15x7x0.3cm",
  "observacoes": "Inclui touch screen integrado",
  "ativo": true,
  "created_at": "2024-01-17T13:00:00.000Z",
  "updated_at": "2024-01-17T13:00:00.000Z"
}
```

### 3. Buscar Produto por ID
**GET** `/api/produtos/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-produto-1",
  "nome": "Bateria Samsung Galaxy S21",
  "descricao": "Bateria original Samsung para Galaxy S21",
  "categoria": "Baterias",
  "codigo_barras": "7891234567890",
  "preco_custo": 45.00,
  "preco_venda": 89.90,
  "margem_lucro": 99.78,
  "fornecedor_id": "uuid-fornecedor-1",
  "controla_estoque": true,
  "estoque_minimo": 5,
  "estoque_atual": 15,
  "unidade_medida": "UN",
  "peso": 0.05,
  "dimensoes": "7x5x0.5cm",
  "observacoes": "Compatível com modelo SM-G991B",
  "ativo": true,
  "created_at": "2024-01-12T10:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

### 4. Produtos Ativos
**GET** `/api/produtos/ativos`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-produto-1",
    "nome": "Bateria Samsung Galaxy S21",
    "preco_venda": 89.90,
    "estoque_atual": 15,
    "ativo": true
  }
]
```

### 5. Produtos com Estoque Baixo
**GET** `/api/produtos/estoque-baixo`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-produto-2",
    "nome": "Display iPhone 12",
    "estoque_atual": 2,
    "estoque_minimo": 3,
    "diferenca": -1
  }
]
```

### 6. Produtos Sem Estoque
**GET** `/api/produtos/sem-estoque`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-produto-3",
    "nome": "Carregador Universal",
    "estoque_atual": 0,
    "estoque_minimo": 10
  }
]
```

### 7. Buscar por Código de Barras
**GET** `/api/produtos/codigo-barras/:codigoBarras`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-produto-1",
  "nome": "Bateria Samsung Galaxy S21",
  "codigo_barras": "7891234567890",
  "preco_venda": 89.90,
  "estoque_atual": 15
}
```

### 8. Verificar Disponibilidade
**POST** `/api/produtos/:id/verificar-estoque`

#### Requisição
```json
{
  "quantidade": 3
}
```

#### Resposta de Sucesso (200)
```json
{
  "disponivel": true,
  "estoque_atual": 15,
  "quantidade_solicitada": 3,
  "quantidade_disponivel": 15
}
```

#### Resposta - Estoque Insuficiente (200)
```json
{
  "disponivel": false,
  "estoque_atual": 2,
  "quantidade_solicitada": 5,
  "quantidade_disponivel": 2,
  "message": "Estoque insuficiente"
}
```

---

## 💰 ORÇAMENTOS

### 1. Listar Orçamentos
**GET** `/api/orcamentos`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&status=Pendente&os_id=uuid-os-1
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-orcamento-1",
    "numero_orcamento": "ORC-2024-001",
    "os_id": "uuid-os-1",
    "versao": 1,
    "status": "Aprovado",
    "valor_servicos": 150.00,
    "valor_pecas": 89.90,
    "valor_desconto": 0.00,
    "valor_total": 239.90,
    "observacoes": "Orçamento para troca de bateria",
    "data_validade": "2024-01-25T23:59:59.000Z",
    "aprovado_em": "2024-01-16T10:30:00.000Z",
    "aprovado_por": "Cliente via WhatsApp",
    "created_at": "2024-01-15T14:00:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  }
]
```

### 2. Criar Orçamento
**POST** `/api/orcamentos`

#### Requisição
```json
{
  "os_id": "uuid-os-1",
  "valor_servicos": 80.00,
  "observacoes": "Orçamento para troca de conector de carga",
  "data_validade": "2024-01-30T23:59:59.000Z"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-orcamento",
  "numero_orcamento": "ORC-2024-002",
  "os_id": "uuid-os-1",
  "versao": 1,
  "status": "Pendente",
  "valor_servicos": 80.00,
  "valor_pecas": 0.00,
  "valor_desconto": 0.00,
  "valor_total": 80.00,
  "observacoes": "Orçamento para troca de conector de carga",
  "data_validade": "2024-01-30T23:59:59.000Z",
  "aprovado_em": null,
  "aprovado_por": null,
  "created_at": "2024-01-17T15:00:00.000Z",
  "updated_at": "2024-01-17T15:00:00.000Z"
}
```

### 3. Buscar Orçamento por ID
**GET** `/api/orcamentos/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-orcamento-1",
  "numero_orcamento": "ORC-2024-001",
  "os_id": "uuid-os-1",
  "versao": 1,
  "status": "Aprovado",
  "valor_servicos": 150.00,
  "valor_pecas": 89.90,
  "valor_desconto": 0.00,
  "valor_total": 239.90,
  "observacoes": "Orçamento para troca de bateria",
  "data_validade": "2024-01-25T23:59:59.000Z",
  "aprovado_em": "2024-01-16T10:30:00.000Z",
  "aprovado_por": "Cliente via WhatsApp",
  "created_at": "2024-01-15T14:00:00.000Z",
  "updated_at": "2024-01-16T10:30:00.000Z"
}
```

### 4. Orçamentos de uma OS
**GET** `/api/orcamentos/os/:osId`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-orcamento-1",
    "numero_orcamento": "ORC-2024-001",
    "versao": 1,
    "status": "Aprovado",
    "valor_total": 239.90,
    "created_at": "2024-01-15T14:00:00.000Z"
  },
  {
    "id": "uuid-orcamento-2",
    "numero_orcamento": "ORC-2024-001",
    "versao": 2,
    "status": "Rejeitado",
    "valor_total": 299.90,
    "created_at": "2024-01-16T09:00:00.000Z"
  }
]
```

### 5. Última Versão do Orçamento
**GET** `/api/orcamentos/os/:osId/latest`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-orcamento-1",
  "numero_orcamento": "ORC-2024-001",
  "os_id": "uuid-os-1",
  "versao": 2,
  "status": "Aprovado",
  "valor_servicos": 150.00,
  "valor_pecas": 89.90,
  "valor_desconto": 0.00,
  "valor_total": 239.90,
  "observacoes": "Orçamento para troca de bateria - versão atualizada",
  "data_validade": "2024-01-25T23:59:59.000Z",
  "aprovado_em": "2024-01-16T10:30:00.000Z",
  "aprovado_por": "Cliente via WhatsApp",
  "created_at": "2024-01-16T09:00:00.000Z",
  "updated_at": "2024-01-16T10:30:00.000Z"
}
```

### 6. Criar Nova Versão
**POST** `/api/orcamentos/:id/nova-versao`

#### Requisição
```json
{
  "valor_servicos": 180.00,
  "valor_pecas": 120.00,
  "observacoes": "Orçamento atualizado - incluído display adicional"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-nova-versao-orcamento",
  "numero_orcamento": "ORC-2024-001",
  "os_id": "uuid-os-1",
  "versao": 3,
  "status": "Pendente",
  "valor_servicos": 180.00,
  "valor_pecas": 120.00,
  "valor_desconto": 0.00,
  "valor_total": 300.00,
  "observacoes": "Orçamento atualizado - incluído display adicional",
  "data_validade": "2024-01-30T23:59:59.000Z",
  "aprovado_em": null,
  "aprovado_por": null,
  "created_at": "2024-01-17T16:00:00.000Z",
  "updated_at": "2024-01-17T16:00:00.000Z"
}
```

---

## 📋 ITENS DE ORÇAMENTO

### 1. Listar Itens do Orçamento
**GET** `/api/orcamentos/:id/itens`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-item-1",
    "orcamento_id": "uuid-orcamento-1",
    "produto_id": "uuid-produto-1",
    "tipo": "Peça",
    "descricao": "Bateria Samsung Galaxy S21",
    "quantidade": 1,
    "valor_unitario": 89.90,
    "valor_total": 89.90,
    "status": "Aprovado",
    "observacoes": "Peça original",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  },
  {
    "id": "uuid-item-2",
    "orcamento_id": "uuid-orcamento-1",
    "produto_id": null,
    "tipo": "Serviço",
    "descricao": "Mão de obra - Troca de bateria",
    "quantidade": 1,
    "valor_unitario": 150.00,
    "valor_total": 150.00,
    "status": "Aprovado",
    "observacoes": "Inclui teste completo",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  }
]
```

### 2. Adicionar Item ao Orçamento
**POST** `/api/orcamentos/:id/itens`

#### Requisição - Peça
```json
{
  "produto_id": "uuid-produto-2",
  "tipo": "Peça",
  "descricao": "Display iPhone 12",
  "quantidade": 1,
  "valor_unitario": 350.00,
  "observacoes": "Display original com touch"
}
```

#### Requisição - Serviço
```json
{
  "tipo": "Serviço",
  "descricao": "Diagnóstico completo",
  "quantidade": 1,
  "valor_unitario": 50.00,
  "observacoes": "Análise detalhada do problema"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-item",
  "orcamento_id": "uuid-orcamento-1",
  "produto_id": "uuid-produto-2",
  "tipo": "Peça",
  "descricao": "Display iPhone 12",
  "quantidade": 1,
  "valor_unitario": 350.00,
  "valor_total": 350.00,
  "status": "Pendente",
  "observacoes": "Display original com touch",
  "created_at": "2024-01-17T16:30:00.000Z",
  "updated_at": "2024-01-17T16:30:00.000Z"
}
```

### 3. Atualizar Item
**PATCH** `/api/orcamentos/:id/itens/:itemId`

#### Requisição
```json
{
  "quantidade": 2,
  "valor_unitario": 320.00,
  "observacoes": "Desconto por quantidade"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-item-1",
  "orcamento_id": "uuid-orcamento-1",
  "produto_id": "uuid-produto-2",
  "tipo": "Peça",
  "descricao": "Display iPhone 12",
  "quantidade": 2,
  "valor_unitario": 320.00,
  "valor_total": 640.00,
  "status": "Pendente",
  "observacoes": "Desconto por quantidade",
  "created_at": "2024-01-17T16:30:00.000Z",
  "updated_at": "2024-01-17T17:00:00.000Z"
}
```

### 4. Aprovar Item
**PATCH** `/api/orcamentos/:id/itens/:itemId/aprovar`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-item-1",
  "status": "Aprovado",
  "aprovado_em": "2024-01-17T17:30:00.000Z",
  "message": "Item aprovado com sucesso"
}
```

### 5. Rejeitar Item
**PATCH** `/api/orcamentos/:id/itens/:itemId/rejeitar`

#### Requisição
```json
{
  "motivo": "Cliente optou por peça mais barata"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-item-1",
  "status": "Rejeitado",
  "rejeitado_em": "2024-01-17T17:45:00.000Z",
  "motivo_rejeicao": "Cliente optou por peça mais barata",
  "message": "Item rejeitado"
}
```

---

## 📊 ESTOQUE

### 1. Criar Movimentação de Estoque
**POST** `/api/estoque/movimentacao`

#### Requisição - Entrada
```json
{
  "produto_id": "uuid-produto-1",
  "tipo": "Entrada",
  "quantidade": 10,
  "motivo": "Compra",
  "observacoes": "Reposição de estoque - Nota Fiscal 12345",
  "valor_unitario": 45.00
}
```

#### Requisição - Saída
```json
{
  "produto_id": "uuid-produto-1",
  "tipo": "Saída",
  "quantidade": 2,
  "motivo": "Venda",
  "observacoes": "Usado na OS-2024-001",
  "os_id": "uuid-os-1"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-movimentacao-1",
  "produto_id": "uuid-produto-1",
  "tipo": "Entrada",
  "quantidade": 10,
  "motivo": "Compra",
  "observacoes": "Reposição de estoque - Nota Fiscal 12345",
  "valor_unitario": 45.00,
  "valor_total": 450.00,
  "estoque_anterior": 5,
  "estoque_atual": 15,
  "os_id": null,
  "usuario_id": "uuid-usuario-1",
  "created_at": "2024-01-17T09:00:00.000Z"
}
```

### 2. Listar Movimentações
**GET** `/api/estoque/movimentacoes`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&produto_id=uuid-produto-1&tipo=Entrada&data_inicio=2024-01-01&data_fim=2024-01-31
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-movimentacao-1",
    "produto_id": "uuid-produto-1",
    "produto_nome": "Bateria Samsung Galaxy S21",
    "tipo": "Entrada",
    "quantidade": 10,
    "motivo": "Compra",
    "observacoes": "Reposição de estoque - Nota Fiscal 12345",
    "valor_unitario": 45.00,
    "valor_total": 450.00,
    "estoque_anterior": 5,
    "estoque_atual": 15,
    "os_id": null,
    "usuario_id": "uuid-usuario-1",
    "usuario_nome": "João Admin",
    "created_at": "2024-01-17T09:00:00.000Z"
  }
]
```

### 3. Movimentações por Produto
**GET** `/api/estoque/produto/:produtoId`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-movimentacao-1",
    "tipo": "Entrada",
    "quantidade": 10,
    "motivo": "Compra",
    "estoque_anterior": 5,
    "estoque_atual": 15,
    "created_at": "2024-01-17T09:00:00.000Z"
  },
  {
    "id": "uuid-movimentacao-2",
    "tipo": "Saída",
    "quantidade": 2,
    "motivo": "Venda",
    "estoque_anterior": 15,
    "estoque_atual": 13,
    "os_id": "uuid-os-1",
    "created_at": "2024-01-17T14:00:00.000Z"
  }
]
```

### 4. Ajustar Estoque
**POST** `/api/estoque/ajuste`

#### Requisição
```json
{
  "produto_id": "uuid-produto-1",
  "quantidade_atual": 12,
  "motivo": "Inventário",
  "observacoes": "Ajuste após contagem física - diferença encontrada"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-ajuste-1",
  "produto_id": "uuid-produto-1",
  "tipo": "Ajuste",
  "quantidade": -1,
  "motivo": "Inventário",
  "observacoes": "Ajuste após contagem física - diferença encontrada",
  "estoque_anterior": 13,
  "estoque_atual": 12,
  "usuario_id": "uuid-usuario-1",
  "created_at": "2024-01-17T18:00:00.000Z",
  "message": "Estoque ajustado com sucesso"
}
```

### 5. Reservar Estoque
**POST** `/api/estoque/reserva`

#### Requisição
```json
{
  "produto_id": "uuid-produto-1",
  "quantidade": 3,
  "os_id": "uuid-os-2",
  "observacoes": "Reserva para OS em andamento"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-reserva-1",
  "produto_id": "uuid-produto-1",
  "quantidade": 3,
  "os_id": "uuid-os-2",
  "status": "Reservado",
  "observacoes": "Reserva para OS em andamento",
  "created_at": "2024-01-17T19:00:00.000Z",
  "message": "Estoque reservado com sucesso"
}
```

### 6. Validar Disponibilidade
**POST** `/api/estoque/validar-disponibilidade`

#### Requisição
```json
{
  "itens": [
    {
      "produto_id": "uuid-produto-1",
      "quantidade": 2
    },
    {
      "produto_id": "uuid-produto-2",
      "quantidade": 1
    }
  ]
}
```

#### Resposta de Sucesso (200)
```json
{
  "disponivel": true,
  "itens": [
    {
      "produto_id": "uuid-produto-1",
      "produto_nome": "Bateria Samsung Galaxy S21",
      "quantidade_solicitada": 2,
      "estoque_atual": 12,
      "disponivel": true
    },
    {
      "produto_id": "uuid-produto-2",
      "produto_nome": "Display iPhone 12",
      "quantidade_solicitada": 1,
      "estoque_atual": 3,
      "disponivel": true
    }
  ]
}
```

#### Resposta - Estoque Insuficiente (200)
```json
{
  "disponivel": false,
  "itens": [
    {
      "produto_id": "uuid-produto-1",
      "produto_nome": "Bateria Samsung Galaxy S21",
      "quantidade_solicitada": 15,
      "estoque_atual": 12,
      "disponivel": false,
      "faltam": 3
    }
  ],
  "message": "Estoque insuficiente para alguns itens"
}
```

---

## 💳 PAGAMENTOS

### 1. Listar Pagamentos
**GET** `/api/pagamentos`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&status=Pendente&os_id=uuid-os-1&data_inicio=2024-01-01&data_fim=2024-01-31
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-pagamento-1",
    "os_id": "uuid-os-1",
    "numero_os": "OS-2024-001",
    "cliente_nome": "João Silva Santos",
    "valor_total": 239.90,
    "forma_pagamento": "Cartão de Crédito",
    "status": "Pago",
    "numero_parcelas": 2,
    "valor_parcela": 119.95,
    "data_vencimento": "2024-01-20T00:00:00.000Z",
    "data_pagamento": "2024-01-18T14:30:00.000Z",
    "observacoes": "Pagamento via cartão Visa",
    "created_at": "2024-01-17T10:00:00.000Z",
    "updated_at": "2024-01-18T14:30:00.000Z"
  }
]
```

### 2. Criar Pagamento
**POST** `/api/pagamentos`

#### Requisição - À Vista
```json
{
  "os_id": "uuid-os-1",
  "valor_total": 239.90,
  "forma_pagamento": "Dinheiro",
  "numero_parcelas": 1,
  "data_vencimento": "2024-01-20T00:00:00.000Z",
  "observacoes": "Pagamento à vista com desconto"
}
```

#### Requisição - Parcelado
```json
{
  "os_id": "uuid-os-2",
  "valor_total": 450.00,
  "forma_pagamento": "Cartão de Crédito",
  "numero_parcelas": 3,
  "data_primeira_parcela": "2024-01-25T00:00:00.000Z",
  "observacoes": "Parcelado em 3x sem juros"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-pagamento",
  "os_id": "uuid-os-1",
  "valor_total": 239.90,
  "forma_pagamento": "Dinheiro",
  "status": "Pendente",
  "numero_parcelas": 1,
  "valor_parcela": 239.90,
  "data_vencimento": "2024-01-20T00:00:00.000Z",
  "data_pagamento": null,
  "observacoes": "Pagamento à vista com desconto",
  "parcelas": [
    {
      "id": "uuid-parcela-1",
      "numero_parcela": 1,
      "valor": 239.90,
      "data_vencimento": "2024-01-20T00:00:00.000Z",
      "status": "Pendente"
    }
  ],
  "created_at": "2024-01-17T11:00:00.000Z",
  "updated_at": "2024-01-17T11:00:00.000Z"
}
```

### 3. Buscar Pagamento por ID
**GET** `/api/pagamentos/:id`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-pagamento-1",
  "os_id": "uuid-os-1",
  "numero_os": "OS-2024-001",
  "cliente_nome": "João Silva Santos",
  "valor_total": 450.00,
  "forma_pagamento": "Cartão de Crédito",
  "status": "Parcialmente Pago",
  "numero_parcelas": 3,
  "observacoes": "Parcelado em 3x sem juros",
  "parcelas": [
    {
      "id": "uuid-parcela-1",
      "numero_parcela": 1,
      "valor": 150.00,
      "data_vencimento": "2024-01-25T00:00:00.000Z",
      "data_pagamento": "2024-01-25T10:00:00.000Z",
      "status": "Pago"
    },
    {
      "id": "uuid-parcela-2",
      "numero_parcela": 2,
      "valor": 150.00,
      "data_vencimento": "2024-02-25T00:00:00.000Z",
      "data_pagamento": null,
      "status": "Pendente"
    },
    {
      "id": "uuid-parcela-3",
      "numero_parcela": 3,
      "valor": 150.00,
      "data_vencimento": "2024-03-25T00:00:00.000Z",
      "data_pagamento": null,
      "status": "Pendente"
    }
  ],
  "created_at": "2024-01-17T11:00:00.000Z",
  "updated_at": "2024-01-25T10:00:00.000Z"
}
```

### 4. Pagamentos de uma OS
**GET** `/api/pagamentos/os/:osId`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-pagamento-1",
    "valor_total": 450.00,
    "forma_pagamento": "Cartão de Crédito",
    "status": "Parcialmente Pago",
    "numero_parcelas": 3,
    "valor_pago": 150.00,
    "valor_pendente": 300.00,
    "created_at": "2024-01-17T11:00:00.000Z"
  }
]
```

### 5. Registrar Pagamento de Parcela
**PATCH** `/api/pagamentos/:id/parcelas/:parcelaId/pagar`

#### Requisição
```json
{
  "data_pagamento": "2024-02-25T15:30:00.000Z",
  "observacoes": "Pagamento via PIX"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-parcela-2",
  "numero_parcela": 2,
  "valor": 150.00,
  "data_vencimento": "2024-02-25T00:00:00.000Z",
  "data_pagamento": "2024-02-25T15:30:00.000Z",
  "status": "Pago",
  "observacoes": "Pagamento via PIX",
  "message": "Pagamento registrado com sucesso"
}
```

### 6. Cancelar Pagamento
**PATCH** `/api/pagamentos/:id/cancelar`

#### Requisição
```json
{
  "motivo": "Cliente desistiu do serviço"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-pagamento-1",
  "status": "Cancelado",
  "cancelado_em": "2024-01-18T16:00:00.000Z",
  "motivo_cancelamento": "Cliente desistiu do serviço",
  "message": "Pagamento cancelado com sucesso"
}
```

---

## 💬 SISTEMA DE ATENDIMENTO

### CONVERSAS

#### 1. Listar Conversas
**GET** `/api/conversas`

#### Query Parameters (Opcionais)
```
?page=1&limit=10&status=Ativa&agente_id=uuid-agente-1&cliente_id=uuid-cliente-1
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-conversa-1",
    "cliente_id": "uuid-cliente-1",
    "cliente_nome": "João Silva Santos",
    "cliente_whatsapp": "5511999999999",
    "agente_id": "uuid-agente-1",
    "agente_nome": "Maria Atendente",
    "status": "Ativa",
    "prioridade": "Normal",
    "assunto": "Dúvida sobre reparo",
    "canal": "WhatsApp",
    "ultima_mensagem": "Quando ficará pronto meu celular?",
    "ultima_mensagem_em": "2024-01-17T14:30:00.000Z",
    "mensagens_nao_lidas": 2,
    "etiquetas": ["Urgente", "Reparo"],
    "created_at": "2024-01-17T10:00:00.000Z",
    "updated_at": "2024-01-17T14:30:00.000Z"
  }
]
```

#### 2. Criar Conversa
**POST** `/api/conversas`

#### Requisição
```json
{
  "cliente_id": "uuid-cliente-1",
  "assunto": "Solicitação de orçamento",
  "canal": "WhatsApp",
  "prioridade": "Normal",
  "observacoes": "Cliente interessado em reparo de tela"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-nova-conversa",
  "cliente_id": "uuid-cliente-1",
  "cliente_nome": "João Silva Santos",
  "cliente_whatsapp": "5511999999999",
  "agente_id": null,
  "agente_nome": null,
  "status": "Aguardando",
  "prioridade": "Normal",
  "assunto": "Solicitação de orçamento",
  "canal": "WhatsApp",
  "ultima_mensagem": null,
  "ultima_mensagem_em": null,
  "mensagens_nao_lidas": 0,
  "etiquetas": [],
  "observacoes": "Cliente interessado em reparo de tela",
  "created_at": "2024-01-17T15:00:00.000Z",
  "updated_at": "2024-01-17T15:00:00.000Z"
}
```

#### 3. Atribuir Agente
**PATCH** `/api/conversas/:id/atribuir`

#### Requisição
```json
{
  "agente_id": "uuid-agente-1"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-conversa-1",
  "agente_id": "uuid-agente-1",
  "agente_nome": "Maria Atendente",
  "status": "Ativa",
  "atribuida_em": "2024-01-17T15:30:00.000Z",
  "message": "Conversa atribuída com sucesso"
}
```

#### 4. Finalizar Conversa
**PATCH** `/api/conversas/:id/finalizar`

#### Requisição
```json
{
  "motivo": "Problema resolvido",
  "observacoes": "Cliente satisfeito com o atendimento"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-conversa-1",
  "status": "Finalizada",
  "finalizada_em": "2024-01-17T16:00:00.000Z",
  "motivo_finalizacao": "Problema resolvido",
  "observacoes_finalizacao": "Cliente satisfeito com o atendimento",
  "message": "Conversa finalizada com sucesso"
}
```

### MENSAGENS

#### 1. Listar Mensagens da Conversa
**GET** `/api/conversas/:id/mensagens`

#### Query Parameters (Opcionais)
```
?page=1&limit=50&tipo=Recebida
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-mensagem-1",
    "conversa_id": "uuid-conversa-1",
    "remetente_tipo": "Cliente",
    "remetente_id": "uuid-cliente-1",
    "remetente_nome": "João Silva Santos",
    "destinatario_tipo": "Agente",
    "destinatario_id": "uuid-agente-1",
    "destinatario_nome": "Maria Atendente",
    "tipo": "Texto",
    "conteudo": "Olá, gostaria de saber sobre o reparo do meu celular",
    "anexos": [],
    "status": "Entregue",
    "lida": true,
    "lida_em": "2024-01-17T10:05:00.000Z",
    "whatsapp_message_id": "wamid.123456789",
    "created_at": "2024-01-17T10:00:00.000Z",
    "updated_at": "2024-01-17T10:05:00.000Z"
  },
  {
    "id": "uuid-mensagem-2",
    "conversa_id": "uuid-conversa-1",
    "remetente_tipo": "Agente",
    "remetente_id": "uuid-agente-1",
    "remetente_nome": "Maria Atendente",
    "destinatario_tipo": "Cliente",
    "destinatario_id": "uuid-cliente-1",
    "destinatario_nome": "João Silva Santos",
    "tipo": "Texto",
    "conteudo": "Olá João! Vou verificar o status do seu reparo. Qual o número da sua OS?",
    "anexos": [],
    "status": "Entregue",
    "lida": false,
    "lida_em": null,
    "whatsapp_message_id": "wamid.987654321",
    "created_at": "2024-01-17T10:02:00.000Z",
    "updated_at": "2024-01-17T10:02:00.000Z"
  }
]
```

#### 2. Enviar Mensagem
**POST** `/api/conversas/:id/mensagens`

#### Requisição - Texto
```json
{
  "tipo": "Texto",
  "conteudo": "Seu reparo está quase pronto! Deve ficar pronto até amanhã.",
  "remetente_tipo": "Agente",
  "remetente_id": "uuid-agente-1"
}
```

#### Requisição - Com Anexo
```json
{
  "tipo": "Imagem",
  "conteudo": "Foto do reparo concluído",
  "anexos": [
    {
      "tipo": "Imagem",
      "url": "https://storage.exemplo.com/foto-reparo.jpg",
      "nome": "reparo_concluido.jpg",
      "tamanho": 245760
    }
  ],
  "remetente_tipo": "Agente",
  "remetente_id": "uuid-agente-1"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-nova-mensagem",
  "conversa_id": "uuid-conversa-1",
  "remetente_tipo": "Agente",
  "remetente_id": "uuid-agente-1",
  "remetente_nome": "Maria Atendente",
  "destinatario_tipo": "Cliente",
  "destinatario_id": "uuid-cliente-1",
  "destinatario_nome": "João Silva Santos",
  "tipo": "Texto",
  "conteudo": "Seu reparo está quase pronto! Deve ficar pronto até amanhã.",
  "anexos": [],
  "status": "Enviando",
  "lida": false,
  "lida_em": null,
  "whatsapp_message_id": null,
  "created_at": "2024-01-17T15:00:00.000Z",
  "updated_at": "2024-01-17T15:00:00.000Z"
}
```

#### 3. Marcar Mensagem como Lida
**PATCH** `/api/mensagens/:id/marcar-lida`

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-mensagem-1",
  "lida": true,
  "lida_em": "2024-01-17T15:30:00.000Z",
  "message": "Mensagem marcada como lida"
}
```

### AGENTES

#### 1. Listar Agentes
**GET** `/api/agentes`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-agente-1",
    "nome": "Maria Atendente",
    "email": "maria@evolutech.com",
    "telefone": "(11) 98888-1111",
    "status": "Online",
    "departamento": "Atendimento",
    "nivel_acesso": "Operador",
    "conversas_ativas": 3,
    "conversas_hoje": 12,
    "ultima_atividade": "2024-01-17T15:45:00.000Z",
    "ativo": true,
    "created_at": "2024-01-10T09:00:00.000Z",
    "updated_at": "2024-01-17T15:45:00.000Z"
  }
]
```

#### 2. Criar Agente
**POST** `/api/agentes`

#### Requisição
```json
{
  "nome": "Carlos Suporte",
  "email": "carlos@evolutech.com",
  "telefone": "(11) 98888-2222",
  "departamento": "Suporte Técnico",
  "nivel_acesso": "Supervisor",
  "senha": "senha123"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-agente",
  "nome": "Carlos Suporte",
  "email": "carlos@evolutech.com",
  "telefone": "(11) 98888-2222",
  "status": "Offline",
  "departamento": "Suporte Técnico",
  "nivel_acesso": "Supervisor",
  "conversas_ativas": 0,
  "conversas_hoje": 0,
  "ultima_atividade": null,
  "ativo": true,
  "created_at": "2024-01-17T16:00:00.000Z",
  "updated_at": "2024-01-17T16:00:00.000Z"
}
```

#### 3. Atualizar Status do Agente
**PATCH** `/api/agentes/:id/status`

#### Requisição
```json
{
  "status": "Ocupado"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-agente-1",
  "status": "Ocupado",
  "ultima_atividade": "2024-01-17T16:30:00.000Z",
  "message": "Status atualizado com sucesso"
}
```

---

## 🏷️ ETIQUETAS

### 1. Listar Etiquetas
**GET** `/api/etiquetas`

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-etiqueta-1",
    "nome": "Urgente",
    "cor": "#FF0000",
    "descricao": "Atendimentos que precisam de prioridade máxima",
    "categoria": "Prioridade",
    "ativa": true,
    "uso_count": 25,
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-15T14:20:00.000Z"
  },
  {
    "id": "uuid-etiqueta-2",
    "nome": "Reparo",
    "cor": "#0066CC",
    "descricao": "Conversas relacionadas a reparos de dispositivos",
    "categoria": "Tipo de Serviço",
    "ativa": true,
    "uso_count": 45,
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-16T09:30:00.000Z"
  }
]
```

### 2. Criar Etiqueta
**POST** `/api/etiquetas`

#### Requisição
```json
{
  "nome": "VIP",
  "cor": "#FFD700",
  "descricao": "Clientes VIP com atendimento diferenciado",
  "categoria": "Cliente"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-nova-etiqueta",
  "nome": "VIP",
  "cor": "#FFD700",
  "descricao": "Clientes VIP com atendimento diferenciado",
  "categoria": "Cliente",
  "ativa": true,
  "uso_count": 0,
  "created_at": "2024-01-17T17:00:00.000Z",
  "updated_at": "2024-01-17T17:00:00.000Z"
}
```

### 3. Adicionar Etiqueta à Conversa
**POST** `/api/conversas/:id/etiquetas`

#### Requisição
```json
{
  "etiqueta_id": "uuid-etiqueta-1"
}
```

#### Resposta de Sucesso (200)
```json
{
  "conversa_id": "uuid-conversa-1",
  "etiqueta_id": "uuid-etiqueta-1",
  "etiqueta_nome": "Urgente",
  "etiqueta_cor": "#FF0000",
  "adicionada_em": "2024-01-17T17:30:00.000Z",
  "message": "Etiqueta adicionada com sucesso"
}
```

### 4. Remover Etiqueta da Conversa
**DELETE** `/api/conversas/:id/etiquetas/:etiquetaId`

#### Resposta de Sucesso (204)
```
(Sem conteúdo)
```

---

## 📱 WHATSAPP

### 1. Status da Conexão
**GET** `/api/whatsapp/status`

#### Resposta de Sucesso (200)
```json
{
  "conectado": true,
  "numero": "5511999999999",
  "nome": "EvoluTech CRM",
  "status": "Conectado",
  "ultima_atividade": "2024-01-17T18:00:00.000Z",
  "qr_code": null,
  "sessao_ativa": true
}
```

#### Resposta - Desconectado (200)
```json
{
  "conectado": false,
  "numero": null,
  "nome": null,
  "status": "Desconectado",
  "ultima_atividade": null,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "sessao_ativa": false
}
```

### 2. Enviar Mensagem
**POST** `/api/whatsapp/enviar`

#### Requisição - Texto
```json
{
  "numero": "5511999999999",
  "tipo": "texto",
  "conteudo": "Olá! Seu reparo está pronto para retirada."
}
```

#### Requisição - Imagem
```json
{
  "numero": "5511999999999",
  "tipo": "imagem",
  "arquivo": "base64_da_imagem",
  "legenda": "Foto do reparo concluído"
}
```

#### Resposta de Sucesso (200)
```json
{
  "sucesso": true,
  "message_id": "wamid.123456789",
  "status": "Enviado",
  "timestamp": "2024-01-17T18:30:00.000Z",
  "message": "Mensagem enviada com sucesso"
}
```

### 3. Histórico de Mensagens
**GET** `/api/whatsapp/historico/:numero`

#### Query Parameters (Opcionais)
```
?page=1&limit=50&data_inicio=2024-01-01&data_fim=2024-01-31
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-msg-whats-1",
    "numero": "5511999999999",
    "nome_contato": "João Silva Santos",
    "tipo": "Recebida",
    "conteudo": "Oi, gostaria de saber sobre meu celular",
    "message_id": "wamid.987654321",
    "status": "Entregue",
    "timestamp": "2024-01-17T10:00:00.000Z"
  },
  {
    "id": "uuid-msg-whats-2",
    "numero": "5511999999999",
    "nome_contato": "João Silva Santos",
    "tipo": "Enviada",
    "conteudo": "Olá João! Vou verificar o status do seu reparo.",
    "message_id": "wamid.123456789",
    "status": "Lida",
    "timestamp": "2024-01-17T10:02:00.000Z"
  }
]
```

### 4. Desconectar WhatsApp
**POST** `/api/whatsapp/desconectar`

#### Resposta de Sucesso (200)
```json
{
  "sucesso": true,
  "message": "WhatsApp desconectado com sucesso"
}
```

---

## 📄 TEMPLATES

### 1. Listar Templates
**GET** `/api/templates`

#### Query Parameters (Opcionais)
```
?categoria=Atendimento&ativo=true
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-template-1",
    "nome": "Boas-vindas",
    "categoria": "Atendimento",
    "assunto": "Bem-vindo à EvoluTech!",
    "conteudo": "Olá {{nome_cliente}}! Bem-vindo à EvoluTech. Como posso ajudá-lo hoje?",
    "variaveis": ["nome_cliente"],
    "tipo": "WhatsApp",
    "ativo": true,
    "uso_count": 150,
    "created_at": "2024-01-10T11:00:00.000Z",
    "updated_at": "2024-01-15T16:20:00.000Z"
  }
]
```

### 2. Criar Template
**POST** `/api/templates`

#### Requisição
```json
{
  "nome": "Orçamento Aprovado",
  "categoria": "Orçamento",
  "assunto": "Orçamento Aprovado - OS {{numero_os}}",
  "conteudo": "Olá {{nome_cliente}}! Seu orçamento de R$ {{valor_total}} foi aprovado. Iniciaremos o reparo em breve.",
  "variaveis": ["nome_cliente", "numero_os", "valor_total"],
  "tipo": "WhatsApp"
}
```

#### Resposta de Sucesso (201)
```json
{
  "id": "uuid-novo-template",
  "nome": "Orçamento Aprovado",
  "categoria": "Orçamento",
  "assunto": "Orçamento Aprovado - OS {{numero_os}}",
  "conteudo": "Olá {{nome_cliente}}! Seu orçamento de R$ {{valor_total}} foi aprovado. Iniciaremos o reparo em breve.",
  "variaveis": ["nome_cliente", "numero_os", "valor_total"],
  "tipo": "WhatsApp",
  "ativo": true,
  "uso_count": 0,
  "created_at": "2024-01-17T19:00:00.000Z",
  "updated_at": "2024-01-17T19:00:00.000Z"
}
```

### 3. Processar Template
**POST** `/api/templates/:id/processar`

#### Requisição
```json
{
  "variaveis": {
    "nome_cliente": "João Silva",
    "numero_os": "OS-2024-001",
    "valor_total": "239,90"
  }
}
```

#### Resposta de Sucesso (200)
```json
{
  "template_id": "uuid-template-1",
  "assunto_processado": "Orçamento Aprovado - OS OS-2024-001",
  "conteudo_processado": "Olá João Silva! Seu orçamento de R$ 239,90 foi aprovado. Iniciaremos o reparo em breve.",
  "variaveis_utilizadas": {
    "nome_cliente": "João Silva",
    "numero_os": "OS-2024-001",
    "valor_total": "239,90"
  }
}
```

---

## 📞 COMUNICAÇÃO

### 1. Enviar Notificação
**POST** `/api/comunicacao/notificar`

#### Requisição
```json
{
  "cliente_id": "uuid-cliente-1",
  "tipo": "WhatsApp",
  "template_id": "uuid-template-1",
  "variaveis": {
    "nome_cliente": "João Silva",
    "numero_os": "OS-2024-001"
  },
  "agendado_para": "2024-01-18T09:00:00.000Z"
}
```

#### Resposta de Sucesso (200)
```json
{
  "id": "uuid-notificacao-1",
  "cliente_id": "uuid-cliente-1",
  "tipo": "WhatsApp",
  "status": "Agendado",
  "template_id": "uuid-template-1",
  "conteudo": "Olá João Silva! Seu orçamento para a OS OS-2024-001 está pronto.",
  "agendado_para": "2024-01-18T09:00:00.000Z",
  "enviado_em": null,
  "created_at": "2024-01-17T20:00:00.000Z"
}
```

### 2. Histórico de Comunicações
**GET** `/api/comunicacao/historico`

#### Query Parameters (Opcionais)
```
?cliente_id=uuid-cliente-1&tipo=WhatsApp&status=Enviado&page=1&limit=20
```

#### Resposta de Sucesso (200)
```json
[
  {
    "id": "uuid-comunicacao-1",
    "cliente_id": "uuid-cliente-1",
    "cliente_nome": "João Silva Santos",
    "tipo": "WhatsApp",
    "status": "Enviado",
    "assunto": "Orçamento Pronto",
    "conteudo": "Olá João Silva! Seu orçamento está pronto...",
    "agendado_para": "2024-01-17T09:00:00.000Z",
    "enviado_em": "2024-01-17T09:00:15.000Z",
    "lido_em": "2024-01-17T09:05:00.000Z",
    "created_at": "2024-01-16T18:00:00.000Z"
  }
]
```

---

## ⚠️ TRATAMENTO DE ERROS

### Estrutura Padrão de Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "CODIGO_ERRO",
  "details": {
    "campo": "Detalhes específicos do erro"
  }
}
```

### Códigos de Erro Comuns

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Dados inválidos fornecidos",
  "error": "VALIDATION_ERROR",
  "details": {
    "nome": "Nome é obrigatório",
    "email": "Email deve ter formato válido"
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de acesso inválido ou expirado",
  "error": "INVALID_TOKEN"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Acesso negado para esta operação",
  "error": "ACCESS_DENIED"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Recurso não encontrado",
  "error": "RESOURCE_NOT_FOUND"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "INTERNAL_ERROR"
}
```

---

## 📝 NOTAS IMPORTANTES

### Autenticação
- Todos os endpoints (exceto login) requerem token JWT no header `Authorization: Bearer <token>`
- Tokens expiram em 24 horas
- Use o endpoint `/api/auth/refresh` para renovar tokens

### Paginação
- Endpoints de listagem suportam paginação via query parameters `page` e `limit`
- Limite máximo por página: 100 itens
- Página padrão: 1, Limite padrão: 10

### Datas
- Todas as datas estão no formato ISO 8601 (UTC)
- Exemplo: `2024-01-17T10:30:00.000Z`

### Validações
- CPF deve estar no formato: `123.456.789-00`
- CNPJ deve estar no formato: `12.345.678/0001-90`
- WhatsApp deve incluir código do país: `5511999999999`

### Rate Limiting
- Máximo de 1000 requisições por hora por IP
- Máximo de 100 requisições por minuto por usuário autenticado

---

*Documento gerado em: 17/01/2024*
*Versão da API: 1.0.0*
