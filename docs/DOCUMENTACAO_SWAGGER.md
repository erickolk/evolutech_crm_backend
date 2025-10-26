# 📚 Documentação Swagger - CRM EvoluTech API

## ✨ Acesso à Documentação Interativa

### 🌐 URL da Documentação Swagger

**Produção (Replit):**
```
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api-docs
```

**Desenvolvimento Local:**
```
http://localhost:5000/api-docs
```

### 📄 Especificação OpenAPI (JSON)

Você também pode acessar a especificação OpenAPI completa em formato JSON:

```
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api-docs/swagger.json
```

---

## 🎯 O que é o Swagger?

O Swagger é uma ferramenta de documentação interativa que permite:

- ✅ Visualizar todos os endpoints da API
- ✅ Testar requisições diretamente no navegador
- ✅ Ver exemplos de requisições e respostas
- ✅ Entender os parâmetros necessários
- ✅ Conhecer os códigos de status HTTP retornados
- ✅ Testar autenticação com tokens JWT

---

## 🚀 Como Usar o Swagger UI

### 1. Acessar a Documentação

Abra o navegador e acesse a URL do Swagger:
```
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api-docs
```

### 2. Navegar pelos Endpoints

Os endpoints estão organizados por tags/categorias:

- 🔐 **Autenticação** - Login, logout, refresh token
- 👥 **Clientes** - CRUD de clientes
- 📱 **Dispositivos** - Gestão de dispositivos
- 🔧 **Ordens de Serviço** - Gestão de OS
- 🏪 **Fornecedores** - Cadastro de fornecedores
- 📦 **Produtos** - Catálogo de produtos
- 💰 **Orçamentos** - Criação e gestão de orçamentos
- 📊 **Estoque** - Controle de estoque
- 💳 **Pagamentos** - Gestão de pagamentos
- 💬 **Conversas** - Sistema de atendimento
- 📧 **Mensagens** - Mensagens nas conversas
- 👨‍💼 **Agentes** - Gestão de agentes
- 🏷️ **Etiquetas** - Sistema de etiquetas
- 📱 **WhatsApp** - Integração WhatsApp
- 📝 **Templates** - Templates de mensagens
- 📞 **Comunicação** - Sistema de comunicação

### 3. Testar um Endpoint

#### Passo a Passo:

1. **Clique em uma categoria** (ex: "Clientes")
2. **Escolha um endpoint** (ex: GET /clientes)
3. **Clique em "Try it out"**
4. **Preencha os parâmetros** (se necessário)
5. **Clique em "Execute"**
6. **Veja a resposta** abaixo

#### Exemplo Prático:

**Testando o endpoint GET /api/clientes:**

1. Acesse a categoria "Clientes"
2. Clique em `GET /clientes`
3. Clique no botão **"Try it out"**
4. Preencha os parâmetros opcionais:
   - `page`: 1
   - `limit`: 10
   - `search`: (deixe vazio ou coloque um nome)
5. Clique em **"Execute"**
6. Veja a resposta no formato JSON abaixo

---

## 🔐 Testando Endpoints Protegidos (com Autenticação)

Alguns endpoints requerem autenticação JWT. Para testá-los:

### Passo 1: Fazer Login

1. Vá até a categoria **"Autenticação"**
2. Clique em `POST /auth/login`
3. Clique em **"Try it out"**
4. No Request Body, coloque:
```json
{
  "email": "admin@evolutech.com",
  "senha": "senha123"
}
```
5. Clique em **"Execute"**
6. **Copie o token** da resposta (campo `data.token`)

### Passo 2: Autorizar no Swagger

1. Clique no botão **"Authorize"** (cadeado) no topo da página
2. Cole o token JWT no campo **"Value"** assim:
```
Bearer SEU_TOKEN_AQUI
```
3. Clique em **"Authorize"**
4. Clique em **"Close"**

### Passo 3: Testar Endpoints Protegidos

Agora você pode testar endpoints que requerem autenticação, como:

- GET /auth/me
- PATCH /auth/change-password
- POST /clientes
- etc.

O Swagger automaticamente incluirá o token no header `Authorization` das requisições.

---

## 📖 Estrutura da Documentação

### Informações do Endpoint

Cada endpoint mostra:

- **Método HTTP**: GET, POST, PATCH, DELETE
- **Caminho**: `/api/clientes`, `/api/produtos`, etc.
- **Descrição**: O que o endpoint faz
- **Parâmetros**: Query params, path params, body
- **Respostas**: Códigos de status e exemplos

### Exemplo de Documentação:

```yaml
POST /api/clientes
Summary: Criar novo cliente
Tags: Clientes

Request Body:
{
  "nome": "João Silva Santos",
  "cpf": "123.456.789-00",
  "whatsapp_id": "5511999999999",
  "tipo_cliente": "Pessoa Física"
}

Responses:
  201 - Cliente criado com sucesso
  400 - Dados inválidos
```

---

## 💡 Dicas de Uso

### 1. Entender os Códigos de Status

- **200** - Sucesso
- **201** - Criado com sucesso
- **204** - Deletado (sem conteúdo)
- **400** - Requisição inválida
- **401** - Não autorizado (token inválido)
- **403** - Acesso negado
- **404** - Não encontrado
- **500** - Erro interno do servidor

### 2. Usar os Schemas

Os schemas mostram a estrutura exata dos objetos:

- **Cliente**: Campos de um cliente
- **Produto**: Campos de um produto
- **OrdemServico**: Campos de uma OS
- etc.

Para ver os schemas:
1. Role até o final da página
2. Veja a seção **"Schemas"**
3. Clique para expandir e ver a estrutura

### 3. Copiar como cURL

Você pode copiar qualquer requisição como comando cURL:

1. Execute uma requisição
2. Clique em **"cURL"** abaixo do botão "Execute"
3. Copie o comando gerado
4. Use no terminal

Exemplo:
```bash
curl -X GET "https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api/clientes?page=1&limit=10" -H "accept: application/json"
```

### 4. Download da Especificação OpenAPI

Você pode baixar a especificação completa para usar em outras ferramentas:

1. Acesse: `/api-docs/swagger.json`
2. Salve o arquivo JSON
3. Importe em ferramentas como Postman, Insomnia, etc.

---

## 🔧 Integrando com Outras Ferramentas

### Postman

1. Abra o Postman
2. Clique em **"Import"**
3. Cole a URL: `https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api-docs/swagger.json`
4. Clique em **"Import"**
5. Todos os endpoints serão importados automaticamente

### Insomnia

1. Abra o Insomnia
2. Vá em **"Design" > "New Document"**
3. Clique em **"Import from URL"**
4. Cole a URL da especificação
5. Clique em **"Import"**

### Geração de Código (SDKs)

Você pode usar ferramentas como o **OpenAPI Generator** para gerar SDKs automaticamente:

```bash
# Instalar OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Gerar SDK TypeScript
openapi-generator-cli generate \
  -i https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api-docs/swagger.json \
  -g typescript-axios \
  -o ./sdk
```

---

## 📊 Endpoints Documentados

### Total de Endpoints: 100+

Principais módulos documentados:

| Módulo | Quantidade de Endpoints |
|--------|-------------------------|
| Autenticação | 8 |
| Clientes | 4 |
| Dispositivos | 6 |
| Ordens de Serviço | 5 |
| Fornecedores | 5 |
| Produtos | 10+ |
| Orçamentos | 15+ |
| Estoque | 15+ |
| Pagamentos | 9 |
| Conversas | 10+ |
| Mensagens | 10+ |
| Agentes | 15+ |
| Etiquetas | 10+ |
| WhatsApp | 10+ |
| Templates | 9 |
| Comunicação | 10+ |

---

## 🎨 Personalizações

### Tema

O Swagger UI foi personalizado para remover a barra superior (topbar) e usar o título:
- **"CRM EvoluTech API Documentation"**

### Servidores Configurados

A documentação vem pré-configurada com dois servidores:

1. **Produção (Replit)**
   ```
   https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api
   ```

2. **Desenvolvimento Local**
   ```
   http://localhost:5000/api
   ```

Você pode alternar entre os servidores usando o dropdown no topo do Swagger UI.

---

## 🐛 Troubleshooting

### Swagger não carrega

1. Verifique se o servidor está rodando
2. Acesse `/api-docs/swagger.json` para ver se a especificação está acessível
3. Verifique o console do navegador para erros

### "401 Unauthorized" ao testar endpoints

1. Faça login primeiro no endpoint `/auth/login`
2. Copie o token da resposta
3. Clique em **"Authorize"** e cole o token
4. Certifique-se de incluir "Bearer " antes do token

### Erro "CORS"

O CORS já está habilitado no backend. Se ainda tiver problemas:
1. Verifique se está usando HTTPS na produção
2. Limpe o cache do navegador
3. Tente em modo anônimo/privado

---

## 📝 Exemplos de Teste Completo

### Exemplo 1: Criar um Cliente

1. **Autenticar** (se necessário)
2. Ir em **POST /api/clientes**
3. Clicar em **"Try it out"**
4. Preencher o body:
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
5. Clicar em **"Execute"**
6. Ver a resposta **201 Created**

### Exemplo 2: Listar Produtos com Estoque Baixo

1. Ir em **GET /api/produtos/estoque-baixo**
2. Clicar em **"Try it out"**
3. Clicar em **"Execute"**
4. Ver a lista de produtos com estoque abaixo do mínimo

### Exemplo 3: Enviar Mensagem WhatsApp

1. **Autenticar** primeiro
2. Ir em **POST /api/whatsapp/send/text**
3. Clicar em **"Try it out"**
4. Preencher:
```json
{
  "to": "5511999999999",
  "message": "Olá! Sua OS está pronta para retirada."
}
```
5. Clicar em **"Execute"**
6. Ver a confirmação de envio

---

## 🎓 Recursos Adicionais

### Documentação OpenAPI

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI Tools](https://openapi.tools/)

### Ferramentas Complementares

- **Postman**: Testes de API
- **Insomnia**: Cliente REST
- **Stoplight**: Design de APIs
- **Redoc**: Documentação alternativa

---

## ✅ Checklist de Uso

- [ ] Acessar o Swagger UI
- [ ] Explorar as categorias de endpoints
- [ ] Testar um endpoint público (GET /clientes)
- [ ] Fazer login e obter token JWT
- [ ] Autorizar no Swagger com o token
- [ ] Testar endpoints protegidos
- [ ] Experimentar criação de recursos (POST)
- [ ] Ver schemas e exemplos
- [ ] Exportar especificação para outras ferramentas
- [ ] Integrar com Postman/Insomnia

---

**Última Atualização**: Outubro 2024  
**Versão da API**: 1.0.0  
**Ambiente**: Replit Production

---

## 💬 Suporte

Para dúvidas ou problemas com a API:
- 📧 Email: contato@evolutech.com
- 📚 Consulte também: `GUIA_RAPIDO_INTEGRACAO.md`
