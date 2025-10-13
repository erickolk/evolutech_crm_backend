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

### `PATCH /orcamentos/:id`
Atualiza um orçamento.

### `DELETE /orcamentos/:id`
Remove um orçamento.

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

### `GET /orcamentos/:id/itens/:itemId`
Busca um item específico do orçamento.

### `PATCH /orcamentos/:id/itens/:itemId`
Atualiza um item do orçamento.

### `DELETE /orcamentos/:id/itens/:itemId`
Remove um item do orçamento.

### `PATCH /orcamentos/:id/itens/:itemId/aprovar`
Aprova um item do orçamento.

### `PATCH /orcamentos/:id/itens/:itemId/rejeitar`
Rejeita um item do orçamento.

### `PATCH /orcamentos/:id/itens/:itemId/cliente-traz-peca`
Marca que o cliente trará a peça.

### `PATCH /orcamentos/:id/itens/:itemId/status`
Atualiza o status de aprovação do item.

### `GET /orcamentos/:id/itens/:itemId/can-edit`
Verifica se o item pode ser editado.

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

## 💳 Pagamentos

### `GET /pagamentos`
Lista todos os pagamentos com filtros opcionais.

**Query Parameters:**
- `os_id`: UUID da ordem de serviço
- `status`: `pendente`, `pago`, `vencido`, `cancelado`
- `forma_pagamento`: `dinheiro`, `pix`, `cartao_credito`, `cartao_debito`, `transferencia`
- `tipo_pagamento`: `a_vista`, `parcelado`
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)
- `page`: Número da página
- `limit`: Itens por página

**Response (200):**
```json
{
  "pagamentos": [
    {
      "id": "uuid",
      "os_id": "uuid",
      "valor_total": 1000.00,
      "forma_pagamento": "pix",
      "tipo_pagamento": "parcelado",
      "numero_parcelas": 3,
      "status": "pendente",
      "data_vencimento": "2024-02-15",
      "observacoes": "Pagamento do reparo",
      "parcelas": [
        {
          "id": "uuid",
          "numero_parcela": 1,
          "valor": 333.33,
          "data_vencimento": "2024-02-15",
          "status": "pendente",
          "data_pagamento": null
        }
      ],
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `POST /pagamentos`
Cria um novo pagamento.

**Request:**
```json
{
  "os_id": "550e8400-e29b-41d4-a716-446655440002",
  "valor_total": 1000.00,
  "forma_pagamento": "pix",
  "tipo_pagamento": "parcelado",
  "numero_parcelas": 3,
  "data_vencimento": "2024-02-15",
  "observacoes": "Pagamento do reparo"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pagamento criado com sucesso",
  "data": {
    "id": "uuid",
    "os_id": "uuid",
    "valor_total": 1000.00,
    "forma_pagamento": "pix",
    "tipo_pagamento": "parcelado",
    "numero_parcelas": 3,
    "status": "pendente",
    "parcelas": [
      {
        "id": "uuid",
        "numero_parcela": 1,
        "valor": 333.33,
        "data_vencimento": "2024-02-15",
        "status": "pendente"
      }
    ]
  }
}
```

### `GET /pagamentos/:id`
Busca um pagamento específico.

### `PATCH /pagamentos/:id`
Atualiza dados de um pagamento.

### `DELETE /pagamentos/:id`
Remove um pagamento (soft delete).

### `GET /pagamentos/os/:os_id`
Lista pagamentos de uma OS específica.

### `GET /pagamentos/search`
Busca pagamentos com filtros avançados.

### `GET /pagamentos/stats`
Retorna estatísticas de pagamentos.

**Response (200):**
```json
{
  "total_pagamentos": 150,
  "valor_total": 45000.00,
  "pagamentos_pendentes": 25,
  "valor_pendente": 8500.00,
  "pagamentos_vencidos": 5,
  "valor_vencido": 1200.00,
  "por_forma_pagamento": {
    "pix": 80,
    "cartao_credito": 45,
    "dinheiro": 25
  }
}
```

### `PATCH /pagamentos/:id/parcelas/:parcelaId/pagar`
Marca uma parcela como paga.

**Request:**
```json
{
  "data_pagamento": "2024-02-15",
  "valor_pago": 333.33,
  "observacoes": "Pagamento via PIX"
}
```

### `PATCH /pagamentos/:id/parcelas/:parcelaId/estornar`
Estorna o pagamento de uma parcela.

## 💬 Conversas (Customer Service)

### `GET /conversas`
Lista todas as conversas.

**Query Parameters:**
- `status`: `aberta`, `fechada`, `aguardando_cliente`, `aguardando_agente`
- `prioridade`: `baixa`, `normal`, `alta`, `urgente`
- `agente_id`: UUID do agente
- `cliente_id`: UUID do cliente
- `data_inicio`: Data inicial
- `data_fim`: Data final
- `page`: Número da página
- `limit`: Itens por página

### `POST /conversas`
Cria uma nova conversa.

**Request:**
```json
{
  "cliente_id": "uuid",
  "assunto": "Dúvida sobre reparo",
  "prioridade": "normal",
  "canal": "whatsapp",
  "observacoes": "Cliente perguntou sobre prazo"
}
```

### `GET /conversas/:id`
Busca uma conversa específica.

### `PATCH /conversas/:id`
Atualiza dados de uma conversa.

### `DELETE /conversas/:id`
Remove uma conversa (soft delete).

### `GET /conversas/cliente/:clienteId`
Lista conversas de um cliente específico.

### `GET /conversas/agente/:agenteId`
Lista conversas de um agente específico.

### `PATCH /conversas/:id/atribuir-agente`
Atribui um agente à conversa.

**Request:**
```json
{
  "agente_id": "uuid"
}
```

### `PATCH /conversas/:id/fechar`
Fecha uma conversa.

### `PATCH /conversas/:id/reabrir`
Reabre uma conversa fechada.

### `GET /conversas/stats`
Retorna estatísticas de conversas.

### `GET /conversas/abertas`
Lista apenas conversas abertas.

### `GET /conversas/sem-agente`
Lista conversas sem agente atribuído.

### `GET /conversas/prioridade/:prioridade`
Lista conversas por prioridade.

## 📨 Mensagens

### `GET /mensagens`
Lista todas as mensagens.

### `POST /mensagens`
Cria uma nova mensagem.

**Request:**
```json
{
  "conversa_id": "uuid",
  "remetente_tipo": "agente",
  "remetente_id": "uuid",
  "conteudo": "Olá! Como posso ajudá-lo?",
  "tipo": "texto",
  "canal": "whatsapp"
}
```

### `GET /mensagens/:id`
Busca uma mensagem específica.

### `PATCH /mensagens/:id`
Atualiza uma mensagem.

### `DELETE /mensagens/:id`
Remove uma mensagem (soft delete).

### `GET /mensagens/conversa/:conversaId`
Lista mensagens de uma conversa específica.

### `POST /mensagens/enviar`
Envia uma mensagem.

### `PATCH /mensagens/:id/lida`
Marca uma mensagem como lida.

### `PATCH /mensagens/conversa/:conversaId/marcar-todas-lidas`
Marca todas as mensagens de uma conversa como lidas.

### `GET /mensagens/nao-lidas`
Lista mensagens não lidas.

### `GET /mensagens/nao-lidas/count`
Conta mensagens não lidas.

### `GET /mensagens/conversa/:conversaId/ultima`
Retorna a última mensagem de uma conversa.

### `GET /mensagens/stats`
Retorna estatísticas de mensagens.

### `GET /mensagens/buscar/conteudo`
Busca mensagens por conteúdo.

### `GET /mensagens/buscar/tipo/:tipo`
Busca mensagens por tipo.

## 👥 Agentes

### `GET /agentes`
Lista todos os agentes.

### `POST /agentes`
Cria um novo agente.

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "(11) 99999-9999",
  "departamento": "Suporte Técnico",
  "especialidades": ["hardware", "software"],
  "status": "online",
  "limite_conversas": 5
}
```

### `GET /agentes/:id`
Busca um agente específico.

### `PATCH /agentes/:id`
Atualiza dados de um agente.

### `DELETE /agentes/:id`
Remove um agente (soft delete).

### `GET /agentes/email/:email`
Busca agente por email.

### `PATCH /agentes/:id/status`
Atualiza status do agente.

### `PATCH /agentes/:id/online`
Define agente como online.

### `PATCH /agentes/:id/offline`
Define agente como offline.

### `PATCH /agentes/:id/ocupado`
Define agente como ocupado.

### `PATCH /agentes/:id/ausente`
Define agente como ausente.

### `GET /agentes/disponiveis`
Lista agentes disponíveis.

### `POST /agentes/atribuicao-automatica`
Realiza atribuição automática de conversa.

### `PATCH /agentes/:id/liberar-conversa`
Libera uma conversa do agente.

### `PATCH /agentes/:id/registrar-atividade`
Registra atividade do agente.

### `GET /agentes/stats`
Retorna estatísticas de agentes.

### `GET /agentes/:id/performance`
Retorna performance de um agente.

### `GET /agentes/departamento/:departamento`
Lista agentes por departamento.

### `GET /agentes/especialidade/:especialidade`
Lista agentes por especialidade.

## 🏷️ Etiquetas (Tags)

### `GET /etiquetas`
Lista todas as etiquetas.

### `POST /etiquetas`
Cria uma nova etiqueta.

**Request:**
```json
{
  "nome": "Urgente",
  "cor": "#FF0000",
  "categoria": "prioridade",
  "descricao": "Para casos urgentes",
  "automatica": false,
  "condicoes": {}
}
```

### `GET /etiquetas/:id`
Busca uma etiqueta específica.

### `PATCH /etiquetas/:id`
Atualiza uma etiqueta.

### `DELETE /etiquetas/:id`
Remove uma etiqueta (soft delete).

### `GET /etiquetas/categoria/:categoria`
Lista etiquetas por categoria.

### `PATCH /etiquetas/reorganizar`
Reorganiza ordem das etiquetas.

### `GET /etiquetas/automaticas`
Lista etiquetas automáticas.

### `POST /etiquetas/aplicar-automaticas`
Aplica etiquetas automáticas.

### `GET /etiquetas/stats`
Retorna estatísticas de etiquetas.

### Etiquetas em Conversas

#### `POST /conversas/:conversaId/etiquetas`
Aplica etiqueta a uma conversa.

#### `DELETE /conversas/:conversaId/etiquetas`
Remove etiqueta de uma conversa.

#### `GET /conversas/:conversaId/etiquetas`
Lista etiquetas de uma conversa.

### Etiquetas em Mensagens

#### `POST /mensagens/:mensagemId/etiquetas`
Aplica etiqueta a uma mensagem.

#### `DELETE /mensagens/:mensagemId/etiquetas`
Remove etiqueta de uma mensagem.

#### `GET /mensagens/:mensagemId/etiquetas`
Lista etiquetas de uma mensagem.

## 📱 WhatsApp Integration

### Webhook

#### `GET /whatsapp/webhook`
Verifica webhook do WhatsApp.

#### `POST /whatsapp/webhook`
Recebe webhook do WhatsApp.

### Envio de Mensagens

#### `POST /whatsapp/send/text`
Envia mensagem de texto.

**Request:**
```json
{
  "to": "5511999999999",
  "message": "Olá! Seu dispositivo está pronto para retirada."
}
```

#### `POST /whatsapp/send/media`
Envia mensagem com mídia.

**Request:**
```json
{
  "to": "5511999999999",
  "media_type": "image",
  "media_url": "https://example.com/image.jpg",
  "caption": "Foto do reparo concluído"
}
```

#### `POST /whatsapp/send/location`
Envia localização.

#### `POST /whatsapp/send/buttons`
Envia mensagem com botões interativos.

#### `POST /whatsapp/send/list`
Envia mensagem com lista interativa.

#### `POST /whatsapp/send/template`
Envia template aprovado.

### Mídia e Configuração

#### `GET /whatsapp/media/:mediaId`
Baixa mídia do WhatsApp.

#### `GET /whatsapp/profile`
Retorna perfil do negócio.

#### `GET /whatsapp/config`
Verifica configuração do WhatsApp.

## 📄 Templates

### `POST /templates`
Cria um novo template.

**Request:**
```json
{
  "nome": "Boas-vindas",
  "categoria": "atendimento",
  "conteudo": "Olá {{nome_cliente}}! Bem-vindo à nossa assistência técnica.",
  "variaveis": ["nome_cliente"],
  "ativo": true,
  "descricao": "Template de boas-vindas para novos clientes"
}
```

### `GET /templates`
Lista todos os templates.

### `GET /templates/:id`
Busca um template específico.

### `PUT /templates/:id`
Atualiza um template.

### `DELETE /templates/:id`
Remove um template.

### `GET /templates/categoria/:categoria`
Lista templates por categoria.

### `PATCH /templates/:id/toggle`
Alterna status ativo/inativo do template.

### Processamento de Templates

#### `POST /templates/process`
Processa um template com variáveis.

**Request:**
```json
{
  "template_id": "uuid",
  "variaveis": {
    "nome_cliente": "João Silva",
    "numero_os": "AOS-2024-001"
  }
}
```

#### `POST /templates/process-system`
Processa template com dados do sistema.

#### `POST /templates/preview`
Visualiza template processado.

## 📞 Comunicação IA

### `POST /comunicacao`
Cria uma nova comunicação.

### `GET /comunicacao`
Lista todas as comunicações.

### `GET /comunicacao/:id`
Busca uma comunicação específica.

### `PUT /comunicacao/:id`
Atualiza uma comunicação.

### `PATCH /comunicacao/:id/lida`
Marca comunicação como lida.

### `PATCH /comunicacao/lidas`
Marca múltiplas comunicações como lidas.

### Consultas Específicas

#### `GET /comunicacao/cliente/:clienteId`
Lista comunicações de um cliente.

#### `GET /comunicacao/os/:osId`
Lista comunicações de uma OS.

#### `GET /comunicacao/nao-lidas`
Lista comunicações não lidas.

#### `GET /comunicacao/estatisticas`
Retorna estatísticas de comunicação.

#### `GET /comunicacao/agregado`
Retorna dados agregados de comunicação.

### Processamento IA

#### `POST /comunicacao/ia/processar`
Processa mensagem com IA.

#### `POST /comunicacao/whatsapp/processar`
Processa mensagem do WhatsApp.

### Integração WhatsApp

#### `GET /comunicacao/whatsapp/cliente/:numero`
Busca cliente por número do WhatsApp.

#### `GET /comunicacao/os/:osId/status`
Retorna status de uma OS.

#### `GET /comunicacao/cliente/:clienteId/os-ativas`
Lista OS ativas de um cliente.

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

#### Pagamentos
- `PAYMENT_NOT_FOUND`: Pagamento não encontrado
- `OS_NOT_FOUND`: Ordem de serviço não encontrada
- `INVALID_PAYMENT_STATUS`: Status de pagamento inválido
- `PARCELA_ALREADY_PAID`: Parcela já foi paga
- `INVALID_PAYMENT_AMOUNT`: Valor de pagamento inválido

#### Customer Service
- `CONVERSATION_NOT_FOUND`: Conversa não encontrada
- `AGENT_NOT_AVAILABLE`: Agente não disponível
- `MESSAGE_NOT_FOUND`: Mensagem não encontrada
- `INVALID_CONVERSATION_STATUS`: Status de conversa inválido

#### WhatsApp
- `WHATSAPP_CONFIG_ERROR`: Erro de configuração do WhatsApp
- `INVALID_PHONE_NUMBER`: Número de telefone inválido
- `MEDIA_UPLOAD_ERROR`: Erro no upload de mídia
- `TEMPLATE_NOT_APPROVED`: Template não aprovado

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

## 📝 Notas para Integração Frontend

### Status dos Endpoints
- ✅ **Funcionais e Testados**: Autenticação, Clientes, Dispositivos, OS, Fornecedores, Produtos, Orçamentos, Estoque
- ⚠️ **Implementados mas Necessitam Testes**: Pagamentos, Customer Service, WhatsApp, Templates
- 🔄 **Em Desenvolvimento**: Comunicação AI, Análises avançadas

### Estrutura de Resposta Padrão
Todos os endpoints seguem a estrutura:
```json
{
  "success": true,
  "data": {...},
  "message": "Mensagem de sucesso",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Headers Obrigatórios
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Validação de Dados
- Todos os campos obrigatórios devem ser enviados
- Formatos de data: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- Valores monetários: números decimais (ex: 150.50)
- IDs: números inteiros positivos

### Paginação
Parâmetros de query disponíveis:
- `page`: Página atual (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)
- `search`: Busca textual (quando disponível)
- `sort`: Campo para ordenação
- `order`: Direção da ordenação (asc/desc)

### Filtros Comuns
- `status`: Filtrar por status
- `data_inicio` e `data_fim`: Filtros de período
- `cliente_id`: Filtrar por cliente
- `ativo`: Filtrar por registros ativos/inativos

### Tratamento de Erros
- Sempre verificar o campo `success` na resposta
- Códigos HTTP apropriados são retornados
- Mensagens de erro em português
- Detalhes de validação no campo `errors` quando aplicável

### Testes Recomendados
1. **Autenticação**: Testar login, logout e renovação de token
2. **CRUD Básico**: Criar, listar, atualizar e deletar registros
3. **Validações**: Testar campos obrigatórios e formatos
4. **Paginação**: Testar diferentes páginas e limites
5. **Filtros**: Testar busca e filtros específicos
6. **Relacionamentos**: Testar endpoints que dependem de outros dados

### Endpoints Prioritários para Testes
1. `/api/auth/login` - Autenticação
2. `/api/clientes` - Gestão de clientes
3. `/api/os` - Ordens de serviço
4. `/api/produtos` - Catálogo de produtos
5. `/api/orcamentos` - Sistema de orçamentos
6. `/api/pagamentos` - Gestão financeira
7. `/api/estoque` - Controle de estoque

### Configuração de Ambiente
- **Base URL**: `http://localhost:3000/api`
- **Timeout**: 30 segundos para requests normais
- **Upload de Arquivos**: Timeout de 5 minutos
- **WebSocket**: Disponível em `/socket.io` para notificações em tempo real

### Observações Importantes
- O sistema utiliza soft delete (campo `ativo`)
- Timestamps são gerenciados automaticamente
- Relacionamentos são validados antes de operações
- Logs detalhados estão disponíveis para debugging
- Rate limiting aplicado: 100 requests/minuto por IP

---

**Última atualização:** Janeiro 2024  
**Versão da API:** 1.0.0  
**Contato:** Equipe de Desenvolvimento EvolutechCRM