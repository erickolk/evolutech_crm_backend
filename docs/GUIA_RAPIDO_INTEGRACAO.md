# 🚀 Guia Rápido de Integração - CRM EvoluTech

## ✅ URL do Backend no Replit

### URL Pública do Backend
```
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev
```

### URL Base da API (com prefixo /api)
```
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api
```

---

## ⚙️ Configuração no Frontend

### 1. Criar arquivo de configuração da API

```typescript
// lib/api/config.ts
export const API_CONFIG = {
  BASE_URL: 'https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api',
  TIMEOUT: 30000, // 30 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
```

### 2. Cliente HTTP com Axios (Recomendado)

```typescript
// lib/api/client.ts
import axios from 'axios';
import { API_CONFIG } from './config';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Cliente HTTP com Fetch (Alternativa)

```typescript
// lib/api/client.ts
import { API_CONFIG } from './config';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${endpoint}`,
    config
  );

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: any) => 
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: any) => 
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),
};
```

---

## 📦 Exemplos de Uso

### Autenticação

```typescript
// services/auth.service.ts
import { apiClient } from '../api/client';

export const authService = {
  async login(email: string, senha: string) {
    const response = await apiClient.post('/auth/login', { email, senha });
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    }
    throw new Error(response.data.message);
  },

  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

### Clientes

```typescript
// services/clientes.service.ts
import { apiClient } from '../api/client';

export const clientesService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    const response = await apiClient.get('/clientes', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/clientes/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/clientes', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.patch(`/clientes/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/clientes/${id}`);
  },
};
```

### Ordens de Serviço

```typescript
// services/ordensServico.service.ts
import { apiClient } from '../api/client';

export const osService = {
  async getAll(filters?: any) {
    const response = await apiClient.get('/ordensDeServico', { params: filters });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/ordensDeServico/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/ordensDeServico', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.patch(`/ordensDeServico/${id}`, data);
    return response.data;
  },
};
```

---

## 🔑 Principais Endpoints

| Recurso | Método | Endpoint | Descrição |
|---------|--------|----------|-----------|
| **Autenticação** |
| Login | POST | `/auth/login` | Fazer login |
| Logout | POST | `/auth/logout` | Fazer logout |
| Verificar | GET | `/auth/me` | Dados do usuário logado |
| **Clientes** |
| Listar | GET | `/clientes` | Lista todos os clientes |
| Criar | POST | `/clientes` | Cria novo cliente |
| Atualizar | PATCH | `/clientes/:id` | Atualiza cliente |
| Deletar | DELETE | `/clientes/:id` | Remove cliente |
| **Dispositivos** |
| Listar todos | GET | `/dispositivos` | Lista todos dispositivos |
| Por cliente | GET | `/clientes/:clienteId/dispositivos` | Dispositivos do cliente |
| Criar | POST | `/clientes/:clienteId/dispositivos` | Cria dispositivo |
| **Ordens de Serviço** |
| Listar | GET | `/ordensDeServico` | Lista todas OS |
| Criar | POST | `/ordensDeServico` | Cria nova OS |
| Buscar | GET | `/ordensDeServico/:id` | Busca OS por ID |
| Atualizar | PATCH | `/ordensDeServico/:id` | Atualiza OS |
| **Produtos** |
| Listar | GET | `/produtos` | Lista todos produtos |
| Criar | POST | `/produtos` | Cria novo produto |
| Estoque baixo | GET | `/produtos/estoque-baixo` | Produtos com estoque baixo |
| **Pagamentos** |
| Listar | GET | `/pagamentos` | Lista pagamentos |
| Criar | POST | `/pagamentos` | Cria pagamento |
| Estatísticas | GET | `/pagamentos/stats` | Estatísticas de pagamentos |
| **Orçamentos** |
| Listar | GET | `/orcamentos` | Lista orçamentos |
| Criar | POST | `/orcamentos` | Cria orçamento |
| Por OS | GET | `/orcamentos/os/:osId` | Orçamentos de uma OS |
| Itens | GET | `/orcamentos/:id/itens` | Itens do orçamento |

---

## 🎯 Exemplo Completo de Componente React

```typescript
// components/ClientesList.tsx
import { useState, useEffect } from 'react';
import { clientesService } from '../services/clientes.service';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  whatsapp_id: string;
  endereco: string;
  cidade: string;
}

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getAll({ page: 1, limit: 20 });
      setClientes(data);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="clientes-list">
      <h2>Clientes</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>WhatsApp</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.cpf}</td>
              <td>{cliente.whatsapp_id}</td>
              <td>{cliente.cidade}</td>
              <td>
                <button onClick={() => {}}>Editar</button>
                <button onClick={() => {}}>Ver OS</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🐛 Testando a Conexão

### 1. Teste Manual com cURL

```bash
# Testar se o backend está no ar
curl https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev

# Testar endpoint de clientes
curl https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api/clientes

# Testar login
curl -X POST https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","senha":"senha123"}'
```

### 2. Teste no Console do Navegador

```javascript
// Testar conexão básica
fetch('https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev')
  .then(res => res.text())
  .then(console.log);

// Testar endpoint da API
fetch('https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api/clientes')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
```

---

## ⚠️ Notas Importantes

1. **HTTPS**: A URL do Replit usa HTTPS automaticamente
2. **CORS**: O backend já está configurado com CORS habilitado
3. **Prefixo /api**: Lembre-se que TODOS os endpoints precisam do prefixo `/api`
4. **Autenticação**: Endpoints protegidos requerem o header `Authorization: Bearer <token>`
5. **Formato de Dados**: Sempre envie e receba JSON
6. **Timeout**: Configure um timeout adequado (30s recomendado)

---

## 📚 Documentação Completa

Para mais detalhes sobre todos os endpoints disponíveis, consulte:

- **`INTEGRACAO_FRONTEND_BACKEND_ATUALIZADO.md`** - Guia completo de integração
- **`EXEMPLOS_REQUISICOES_RESPOSTAS_ATUALIZADO.md`** - Exemplos detalhados de todas as requisições

---

## 🆘 Troubleshooting

### Erro de CORS
- ✅ O CORS já está habilitado no backend
- Certifique-se de que está usando HTTPS na URL

### Erro 401 (Não Autorizado)
- Verifique se o token está sendo enviado corretamente
- Confirme que o token não expirou

### Erro 404 (Não Encontrado)
- Confirme que está usando o prefixo `/api` na URL
- Verifique se o endpoint está correto

### Timeout
- Aumente o timeout da requisição
- Verifique se o backend está rodando (acesse a URL raiz)

---

**Última Atualização**: Outubro 2024
**Ambiente**: Replit Production
