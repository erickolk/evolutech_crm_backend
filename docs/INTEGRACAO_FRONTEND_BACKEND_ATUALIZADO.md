# Integração Frontend-Backend - CRM EvoluTech

## 📋 Informações Gerais

### URL Base do Backend
```
http://localhost:5000
```

### Prefixo da API
Todos os endpoints da API utilizam o prefixo `/api`:
```
http://localhost:5000/api/{endpoint}
```

### Headers Obrigatórios
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### CORS
O backend está configurado com CORS habilitado para todas as origens durante o desenvolvimento.

---

## 🔐 Autenticação

### Endpoints de Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/logout` | Logout do usuário |
| GET | `/api/auth/me` | Dados do usuário logado |
| GET | `/api/auth` | Verificar token |
| POST | `/api/auth/refresh` | Renovar token |
| POST | `/api/auth/forgot-password` | Esqueci minha senha |
| POST | `/api/auth/reset-password` | Resetar senha |
| PATCH | `/api/auth/change-password` | Alterar senha |

### Exemplo de Login
```javascript
// Requisição
POST http://localhost:5000/api/auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

// Resposta de Sucesso
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@exemplo.com",
      "nome": "Nome do Usuário"
    },
    "token": "jwt_token_aqui"
  }
}
```

---

## 👥 Clientes

### Endpoints de Clientes
| Método | Endpoint | Descrição | Query Params |
|--------|----------|-----------|--------------|
| GET | `/api/clientes` | Listar clientes | `page`, `limit`, `search` |
| POST | `/api/clientes` | Criar cliente | - |
| PATCH | `/api/clientes/:id` | Atualizar cliente | - |
| DELETE | `/api/clientes/:id` | Deletar cliente | - |

### Exemplo de Listagem de Clientes
```javascript
// Requisição
GET http://localhost:5000/api/clientes?page=1&limit=10&search=João

// Resposta
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "telefone": "(11) 99999-9999",
      "cpf_cnpj": "123.456.789-00",
      "endereco": "Rua das Flores, 123",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Exemplo de Criação de Cliente
```javascript
// Requisição
POST http://localhost:5000/api/clientes
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "telefone": "(11) 88888-8888",
  "cpf_cnpj": "987.654.321-00",
  "endereco": "Av. Principal, 456"
}

// Resposta
{
  "success": true,
  "data": {
    "id": 2,
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "telefone": "(11) 88888-8888",
    "cpf_cnpj": "987.654.321-00",
    "endereco": "Av. Principal, 456",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

## 📱 Dispositivos

### Endpoints de Dispositivos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dispositivos` | Listar todos dispositivos |
| GET | `/api/dispositivos/:id` | Buscar dispositivo por ID |
| PATCH | `/api/dispositivos/:id` | Atualizar dispositivo |
| DELETE | `/api/dispositivos/:id` | Deletar dispositivo (soft delete) |
| GET | `/api/clientes/:clienteId/dispositivos` | Dispositivos de um cliente |
| POST | `/api/clientes/:clienteId/dispositivos` | Criar dispositivo para cliente |

---

## 🔧 Ordens de Serviço

### Endpoints de OS
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/ordensDeServico` | Listar OS |
| POST | `/api/ordensDeServico` | Criar OS |
| GET | `/api/ordensDeServico/:id` | Buscar OS por ID |
| PATCH | `/api/ordensDeServico/:id` | Atualizar OS |
| DELETE | `/api/ordensDeServico/:id` | Deletar OS |

---

## 🏪 Fornecedores

### Endpoints de Fornecedores
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/fornecedores` | Listar fornecedores |
| POST | `/api/fornecedores` | Criar fornecedor |
| GET | `/api/fornecedores/:id` | Buscar fornecedor por ID |
| PATCH | `/api/fornecedores/:id` | Atualizar fornecedor |
| DELETE | `/api/fornecedores/:id` | Deletar fornecedor |

---

## 📦 Produtos

### Endpoints de Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Listar produtos |
| POST | `/api/produtos` | Criar produto |
| GET | `/api/produtos/:id` | Buscar produto por ID |
| PATCH | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Deletar produto |
| PATCH | `/api/produtos/:id/estoque` | Atualizar config de estoque |
| GET | `/api/produtos/ativos` | Produtos ativos |
| GET | `/api/produtos/estoque-baixo` | Produtos com estoque baixo |
| GET | `/api/produtos/sem-estoque` | Produtos sem estoque |
| GET | `/api/produtos/:id/estoque-atual` | Estoque atual do produto |
| GET | `/api/produtos/codigo-barras/:codigoBarras` | Buscar por código de barras |
| POST | `/api/produtos/:id/verificar-estoque` | Verificar disponibilidade |

---

## 💰 Orçamentos

### Endpoints de Orçamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orcamentos` | Listar orçamentos |
| POST | `/api/orcamentos` | Criar orçamento |
| GET | `/api/orcamentos/:id` | Buscar orçamento por ID |
| PATCH | `/api/orcamentos/:id` | Atualizar orçamento |
| DELETE | `/api/orcamentos/:id` | Deletar orçamento |
| GET | `/api/orcamentos/os/:osId` | Orçamentos de uma OS |
| GET | `/api/orcamentos/os/:osId/latest` | Última versão do orçamento |
| POST | `/api/orcamentos/:id/nova-versao` | Criar nova versão |
| POST | `/api/orcamentos/:id/recalcular` | Recalcular orçamento |
| GET | `/api/orcamentos/:id/can-edit` | Verificar se pode editar |

### Endpoints de Itens de Orçamento
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orcamentos/:id/itens` | Itens do orçamento |
| POST | `/api/orcamentos/:id/itens` | Adicionar item |
| GET | `/api/orcamentos/:id/itens/:itemId` | Buscar item específico |
| PATCH | `/api/orcamentos/:id/itens/:itemId` | Atualizar item |
| DELETE | `/api/orcamentos/:id/itens/:itemId` | Deletar item |
| PATCH | `/api/orcamentos/:id/itens/:itemId/aprovar` | Aprovar item |
| PATCH | `/api/orcamentos/:id/itens/:itemId/rejeitar` | Rejeitar item |
| PATCH | `/api/orcamentos/:id/itens/:itemId/cliente-traz-peca` | Cliente traz peça |
| PATCH | `/api/orcamentos/:id/itens/:itemId/status` | Atualizar status |
| GET | `/api/orcamentos/:id/itens/:itemId/can-edit` | Verificar se pode editar |
| GET | `/api/orcamentos/:id/calculations` | Cálculos do orçamento |

---

## 📊 Estoque

### Endpoints de Estoque
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/estoque/movimentacao` | Criar movimentação |
| GET | `/api/estoque/movimentacoes` | Listar movimentações |
| GET | `/api/estoque/movimentacoes/:id` | Buscar movimentação |
| GET | `/api/estoque/produto/:produtoId` | Movimentações por produto |
| DELETE | `/api/estoque/movimentacoes/:id` | Excluir movimentação |
| POST | `/api/estoque/ajuste` | Ajustar estoque |
| POST | `/api/estoque/transferencia` | Transferir estoque |
| GET | `/api/estoque/historico/:produtoId` | Histórico do produto |
| GET | `/api/estoque/relatorio` | Relatório de movimentações |
| POST | `/api/estoque/reserva` | Reservar estoque |
| POST | `/api/estoque/baixa-orcamento` | Baixar estoque para orçamento |
| POST | `/api/estoque/auditoria` | Auditar estoque |
| POST | `/api/estoque/validar-disponibilidade` | Validar disponibilidade |
| POST | `/api/estoque/registrar-saida-orcamento` | Registrar saída |
| POST | `/api/estoque/estornar-saida-orcamento` | Estornar saída |

---

## 💳 Pagamentos

### Endpoints de Pagamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pagamentos` | Listar pagamentos |
| POST | `/api/pagamentos` | Criar pagamento |
| GET | `/api/pagamentos/:id` | Buscar pagamento por ID |
| PATCH | `/api/pagamentos/:id` | Atualizar pagamento |
| DELETE | `/api/pagamentos/:id` | Deletar pagamento |
| GET | `/api/pagamentos/os/:os_id` | Pagamentos de uma OS |
| GET | `/api/pagamentos/search` | Buscar com filtros |
| GET | `/api/pagamentos/stats` | Estatísticas |
| PATCH | `/api/pagamentos/:id/parcelas/:parcelaId/pagar` | Pagar parcela |
| PATCH | `/api/pagamentos/:id/parcelas/:parcelaId/estornar` | Estornar parcela |

---

## 💬 Sistema de Atendimento

### Conversas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/conversas` | Listar conversas |
| POST | `/api/conversas` | Criar conversa |
| GET | `/api/conversas/:id` | Buscar conversa por ID |
| PATCH | `/api/conversas/:id` | Atualizar conversa |
| DELETE | `/api/conversas/:id` | Deletar conversa |
| GET | `/api/conversas/cliente/:clienteId` | Conversas do cliente |
| GET | `/api/conversas/agente/:agenteId` | Conversas do agente |
| PATCH | `/api/conversas/:id/atribuir-agente` | Atribuir agente |
| PATCH | `/api/conversas/:id/fechar` | Fechar conversa |
| PATCH | `/api/conversas/:id/reabrir` | Reabrir conversa |
| GET | `/api/conversas/stats` | Estatísticas |
| GET | `/api/conversas/abertas` | Conversas abertas |
| GET | `/api/conversas/sem-agente` | Conversas sem agente |
| GET | `/api/conversas/prioridade/:prioridade` | Por prioridade |

### Mensagens
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/mensagens` | Listar mensagens |
| POST | `/api/mensagens` | Criar mensagem |
| GET | `/api/mensagens/:id` | Buscar mensagem por ID |
| PATCH | `/api/mensagens/:id` | Atualizar mensagem |
| DELETE | `/api/mensagens/:id` | Deletar mensagem |
| GET | `/api/mensagens/conversa/:conversaId` | Mensagens da conversa |
| POST | `/api/mensagens/enviar` | Enviar mensagem |
| PATCH | `/api/mensagens/:id/lida` | Marcar como lida |
| PATCH | `/api/mensagens/conversa/:conversaId/marcar-todas-lidas` | Marcar todas como lidas |
| GET | `/api/mensagens/nao-lidas` | Mensagens não lidas |
| GET | `/api/mensagens/nao-lidas/count` | Contar não lidas |
| GET | `/api/mensagens/conversa/:conversaId/ultima` | Última mensagem |
| GET | `/api/mensagens/stats` | Estatísticas |
| GET | `/api/mensagens/buscar/conteudo` | Buscar por conteúdo |
| GET | `/api/mensagens/buscar/tipo/:tipo` | Buscar por tipo |

### Agentes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/agentes` | Listar agentes |
| POST | `/api/agentes` | Criar agente |
| GET | `/api/agentes/:id` | Buscar agente por ID |
| PATCH | `/api/agentes/:id` | Atualizar agente |
| DELETE | `/api/agentes/:id` | Deletar agente |
| GET | `/api/agentes/email/:email` | Buscar por email |
| PATCH | `/api/agentes/:id/status` | Atualizar status |
| PATCH | `/api/agentes/:id/online` | Definir como online |
| PATCH | `/api/agentes/:id/offline` | Definir como offline |
| PATCH | `/api/agentes/:id/ocupado` | Definir como ocupado |
| PATCH | `/api/agentes/:id/ausente` | Definir como ausente |
| GET | `/api/agentes/disponiveis` | Agentes disponíveis |
| POST | `/api/agentes/atribuicao-automatica` | Atribuição automática |
| PATCH | `/api/agentes/:id/liberar-conversa` | Liberar conversa |
| PATCH | `/api/agentes/:id/registrar-atividade` | Registrar atividade |
| GET | `/api/agentes/stats` | Estatísticas |
| GET | `/api/agentes/:id/performance` | Performance do agente |
| GET | `/api/agentes/departamento/:departamento` | Por departamento |
| GET | `/api/agentes/especialidade/:especialidade` | Por especialidade |

---

## 🏷️ Etiquetas

### Endpoints de Etiquetas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/etiquetas` | Listar etiquetas |
| POST | `/api/etiquetas` | Criar etiqueta |
| GET | `/api/etiquetas/:id` | Buscar etiqueta por ID |
| PATCH | `/api/etiquetas/:id` | Atualizar etiqueta |
| DELETE | `/api/etiquetas/:id` | Deletar etiqueta |
| GET | `/api/etiquetas/categoria/:categoria` | Por categoria |
| PATCH | `/api/etiquetas/reorganizar` | Reorganizar etiquetas |
| GET | `/api/etiquetas/automaticas` | Etiquetas automáticas |
| POST | `/api/etiquetas/aplicar-automaticas` | Aplicar automáticas |
| GET | `/api/etiquetas/stats` | Estatísticas |

### Etiquetas em Conversas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/conversas/:conversaId/etiquetas` | Aplicar etiqueta |
| DELETE | `/api/conversas/:conversaId/etiquetas` | Remover etiqueta |
| GET | `/api/conversas/:conversaId/etiquetas` | Etiquetas da conversa |

### Etiquetas em Mensagens
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/mensagens/:mensagemId/etiquetas` | Aplicar etiqueta |
| DELETE | `/api/mensagens/:mensagemId/etiquetas` | Remover etiqueta |
| GET | `/api/mensagens/:mensagemId/etiquetas` | Etiquetas da mensagem |

---

## 📱 WhatsApp

### Webhook
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/whatsapp/webhook` | Verificar webhook |
| POST | `/api/whatsapp/webhook` | Receber webhook |

### Envio de Mensagens
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/whatsapp/send/text` | Enviar texto |
| POST | `/api/whatsapp/send/media` | Enviar mídia |
| POST | `/api/whatsapp/send/location` | Enviar localização |
| POST | `/api/whatsapp/send/buttons` | Enviar botões |
| POST | `/api/whatsapp/send/list` | Enviar lista |
| POST | `/api/whatsapp/send/template` | Enviar template |

### Outros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/whatsapp/media/:mediaId` | Download de mídia |
| GET | `/api/whatsapp/profile` | Perfil do negócio |
| GET | `/api/whatsapp/config` | Verificar configuração |

---

## 📝 Templates

### Endpoints de Templates
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/templates` | Criar template |
| GET | `/api/templates` | Listar templates |
| GET | `/api/templates/:id` | Buscar template por ID |
| PUT | `/api/templates/:id` | Atualizar template |
| DELETE | `/api/templates/:id` | Deletar template |
| GET | `/api/templates/categoria/:categoria` | Por categoria |
| PATCH | `/api/templates/:id/toggle` | Alternar status |
| POST | `/api/templates/process` | Processar template |
| POST | `/api/templates/process-system` | Processar com sistema |
| POST | `/api/templates/preview` | Visualizar template |

---

## 📞 Comunicação

### Endpoints de Comunicação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/comunicacao` | Criar comunicação |
| GET | `/api/comunicacao` | Listar comunicações |
| GET | `/api/comunicacao/:id` | Buscar por ID |
| PUT | `/api/comunicacao/:id` | Atualizar comunicação |
| PATCH | `/api/comunicacao/:id/lida` | Marcar como lida |
| PATCH | `/api/comunicacao/lidas` | Marcar múltiplas como lidas |
| GET | `/api/comunicacao/cliente/:clienteId` | Por cliente |
| GET | `/api/comunicacao/os/:osId` | Por OS |
| GET | `/api/comunicacao/nao-lidas` | Não lidas |
| GET | `/api/comunicacao/estatisticas` | Estatísticas |
| GET | `/api/comunicacao/agregado` | Dados agregados |
| POST | `/api/comunicacao/ia/processar` | Processar com IA |
| POST | `/api/comunicacao/whatsapp/processar` | Processar WhatsApp |
| GET | `/api/comunicacao/whatsapp/cliente/:numero` | Cliente por WhatsApp |
| GET | `/api/comunicacao/os/:osId/status` | Status da OS |
| GET | `/api/comunicacao/cliente/:clienteId/os-ativas` | OS ativas do cliente |

---

## 📋 Padrões de Resposta

### Resposta de Sucesso
```javascript
{
  "success": true,
  "data": {
    // dados solicitados
  },
  "message": "Operação realizada com sucesso" // opcional
}
```

### Resposta de Erro
```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro detalhada",
    "details": {} // opcional
  }
}
```

### Resposta com Paginação
```javascript
{
  "success": true,
  "data": [
    // array de dados
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔧 Como Usar no Frontend

### Configuração do Cliente HTTP
```javascript
// lib/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Authorization': `Bearer ${token}` // se necessário
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Authorization': `Bearer ${token}` // se necessário
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Implementar patch, put, delete conforme necessário
};
```

### Exemplo de Serviço de Clientes
```javascript
// lib/services/clientes.ts
import { api } from '../api';

export const clientesService = {
  async getAll(options = {}) {
    const { page = 1, limit = 10, search } = options;
    return api.get('/clientes', { page, limit, search });
  },

  async getById(id) {
    return api.get(`/clientes/${id}`);
  },

  async create(clienteData) {
    return api.post('/clientes', clienteData);
  },

  async update(id, clienteData) {
    return api.patch(`/clientes/${id}`, clienteData);
  },

  async delete(id) {
    return api.delete(`/clientes/${id}`);
  }
};
```

### Exemplo de Uso em Componente React
```javascript
// components/ClientesList.tsx
import { useState, useEffect } from 'react';
import { clientesService } from '../lib/services/clientes';

export function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadClientes() {
      try {
        setLoading(true);
        const response = await clientesService.getAll({ 
          page: 1, 
          limit: 10 
        });
        
        if (response.success) {
          setClientes(response.data);
        } else {
          setError(response.error.message);
        }
      } catch (err) {
        setError('Erro ao carregar clientes');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClientes();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {clientes.map(cliente => (
        <div key={cliente.id}>
          <h3>{cliente.nome}</h3>
          <p>{cliente.email}</p>
          <p>{cliente.telefone}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 Tratamento de Erros

### Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação/dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

### Exemplo de Tratamento de Erro
```javascript
try {
  const response = await clientesService.getAll();
  if (response.success) {
    // Sucesso
    setClientes(response.data);
  } else {
    // Erro retornado pela API
    setError(response.error.message);
  }
} catch (error) {
  // Erro de rede ou outro erro
  if (error.message.includes('404')) {
    setError('Endpoint não encontrado');
  } else if (error.message.includes('500')) {
    setError('Erro interno do servidor');
  } else {
    setError('Erro de conexão com o servidor');
  }
}
```

---

## 📝 Notas Importantes

1. **Servidor Backend**: Certifique-se de que o servidor backend está rodando na porta 3008
2. **CORS**: O CORS está habilitado para desenvolvimento
3. **Autenticação**: Alguns endpoints podem requerer autenticação (implementar conforme necessário)
4. **Paginação**: Muitos endpoints suportam paginação via query parameters
5. **Soft Delete**: Alguns recursos usam soft delete (não são removidos fisicamente)
6. **Validação**: O backend faz validação dos dados enviados
7. **Logs**: Verifique os logs do backend para debugging

---

## 🔍 Debugging

### Verificar se o Backend está Rodando
```bash
curl http://localhost:5000
# Deve retornar: "API do CRM está no ar!"
```

### Testar Endpoint Específico
```bash
curl http://localhost:5000/api/clientes
```

### Verificar Logs do Backend
Os logs aparecem no terminal onde o backend está rodando (`npm run dev`).

---

Este documento deve ser usado como referência para integração entre o frontend e backend. Mantenha-o atualizado conforme novos endpoints forem adicionados ou modificados.
