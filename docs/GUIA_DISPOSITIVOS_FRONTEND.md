# 📱 Guia de Comunicação Frontend-Backend: Dispositivos

## 🎯 Cenário: Tela de Nova OS - Seleção/Criação de Dispositivos

### 📋 Fluxo da Funcionalidade

1. **Cliente selecionado** → Buscar dispositivos do cliente
2. **Listar dispositivos** → Permitir seleção ou criação de novo
3. **Criar novo dispositivo** → Se necessário

---

## 🔗 Endpoints Disponíveis

### 1. **Buscar Dispositivos de um Cliente**
```http
GET /api/clientes/{clienteId}/dispositivos
```

**Quando usar**: Após o usuário selecionar um cliente na tela de nova OS

**Frontend envia**:
```javascript
// Exemplo de requisição
const clienteId = "550e8400-e29b-41d4-a716-446655440000";
const response = await fetch(`/api/clientes/${clienteId}/dispositivos`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Se necessário
  }
});
```

**Backend retorna**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2024-01-15T10:30:00Z",
    "cliente_id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Smartphone",
    "marca_modelo": "Samsung Galaxy S21",
    "fotos_entrada": [
      "https://storage.url/foto1.jpg",
      "https://storage.url/foto2.jpg"
    ],
    "senha_equipamento": "1234",
    "deleted_at": null
  },
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "created_at": "2024-01-10T14:20:00Z",
    "cliente_id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Notebook",
    "marca_modelo": "Dell Inspiron 15",
    "fotos_entrada": null,
    "senha_equipamento": null,
    "deleted_at": null
  }
]
```

---

### 2. **Criar Novo Dispositivo**
```http
POST /api/clientes/{clienteId}/dispositivos
```

**Quando usar**: Quando o usuário clicar em "Criar Novo Dispositivo"

**Frontend envia**:
```javascript
const novoDispositivo = {
  tipo: "Smartphone",           // Obrigatório
  marca_modelo: "iPhone 13",    // Opcional
  fotos_entrada: [              // Opcional - URLs das fotos
    "https://storage.url/foto1.jpg"
  ],
  senha_equipamento: "0000"     // Opcional
};

const response = await fetch(`/api/clientes/${clienteId}/dispositivos`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(novoDispositivo)
});
```

**Backend retorna** (Status 201):
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "created_at": "2024-01-20T16:45:00Z",
  "cliente_id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "Smartphone",
  "marca_modelo": "iPhone 13",
  "fotos_entrada": [
    "https://storage.url/foto1.jpg"
  ],
  "senha_equipamento": "0000",
  "deleted_at": null
}
```

---

## 🎨 Implementação no Frontend

### **Componente de Seleção de Dispositivo**

```javascript
// Exemplo em React/Vue/Angular
const DispositivoSelector = ({ clienteId, onDispositivoSelected }) => {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Buscar dispositivos quando cliente for selecionado
  useEffect(() => {
    if (clienteId) {
      buscarDispositivosDoCliente();
    }
  }, [clienteId]);

  const buscarDispositivosDoCliente = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clientes/${clienteId}/dispositivos`);
      const data = await response.json();
      setDispositivos(data);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarNovoDispositivo = async (dadosDispositivo) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/dispositivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosDispositivo)
      });
      
      if (response.ok) {
        const novoDispositivo = await response.json();
        setDispositivos([...dispositivos, novoDispositivo]);
        setShowCreateForm(false);
        onDispositivoSelected(novoDispositivo);
      }
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
    }
  };

  return (
    <div className="dispositivo-selector">
      <h3>Selecionar Dispositivo</h3>
      
      {loading && <p>Carregando dispositivos...</p>}
      
      {/* Lista de dispositivos existentes */}
      <div className="dispositivos-list">
        {dispositivos.map(dispositivo => (
          <div 
            key={dispositivo.id} 
            className="dispositivo-item"
            onClick={() => onDispositivoSelected(dispositivo)}
          >
            <strong>{dispositivo.tipo}</strong>
            <p>{dispositivo.marca_modelo}</p>
          </div>
        ))}
      </div>

      {/* Botão para criar novo */}
      <button onClick={() => setShowCreateForm(true)}>
        + Criar Novo Dispositivo
      </button>

      {/* Formulário de criação */}
      {showCreateForm && (
        <CreateDispositivoForm 
          onSubmit={criarNovoDispositivo}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};
```

---

## 📝 Campos do Dispositivo

### **Campos Obrigatórios**
- `cliente_id` - Automaticamente preenchido pela rota

### **Campos Opcionais**
- `tipo` - Tipo do dispositivo (ex: "Smartphone", "Notebook", "Tablet")
- `marca_modelo` - Marca e modelo (ex: "Samsung Galaxy S21")
- `fotos_entrada` - Array de URLs das fotos
- `senha_equipamento` - Senha/PIN do dispositivo

---

## ⚠️ Tratamento de Erros

### **Erros Comuns**

**400 - Bad Request**:
```json
{
  "message": "O ID do cliente é obrigatório."
}
```

**404 - Not Found**:
```json
{
  "message": "Cliente não encontrado."
}
```

**500 - Server Error**:
```json
{
  "message": "Erro interno do servidor."
}
```

---

## 🔄 Fluxo Completo na Tela de Nova OS

```mermaid
graph TD
    A[Usuário seleciona Cliente] --> B[Frontend: GET /clientes/{id}/dispositivos]
    B --> C{Dispositivos encontrados?}
    C -->|Sim| D[Mostrar lista de dispositivos]
    C -->|Não| E[Mostrar opção "Criar Primeiro Dispositivo"]
    D --> F[Usuário seleciona dispositivo OU clica "Criar Novo"]
    E --> G[Mostrar formulário de criação]
    F -->|Criar Novo| G
    F -->|Selecionar Existente| H[Dispositivo selecionado para OS]
    G --> I[Frontend: POST /clientes/{id}/dispositivos]
    I --> J[Backend retorna novo dispositivo]
    J --> H
    H --> K[Continuar criação da OS]
```

---

## 🎯 Resumo para o Frontend

### **O que o Frontend precisa fazer:**

1. **Quando cliente for selecionado**: Fazer `GET /api/clientes/{clienteId}/dispositivos`
2. **Exibir lista**: Mostrar dispositivos existentes em cards/lista
3. **Permitir seleção**: Click no dispositivo para selecioná-lo
4. **Botão "Criar Novo"**: Abrir formulário de criação
5. **Ao criar novo**: Fazer `POST /api/clientes/{clienteId}/dispositivos`
6. **Após criação**: Adicionar à lista e selecionar automaticamente

### **O que o Backend retorna:**

- **Lista de dispositivos**: Array com todos os dispositivos do cliente
- **Novo dispositivo**: Objeto completo do dispositivo criado
- **Erros**: Mensagens claras de validação ou erro

### **Campos mínimos para criação:**

- `tipo` (obrigatório)
- `marca_modelo` (recomendado)
- `senha_equipamento` (se aplicável)

Essa estrutura permite uma experiência fluida na criação de OS, onde o usuário pode rapidamente selecionar um dispositivo existente ou criar um novo conforme necessário! 🚀