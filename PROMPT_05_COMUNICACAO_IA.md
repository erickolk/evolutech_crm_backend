# PROMPT 05: Módulo de Comunicação e API para Agentes IA - Evolutech CRM

## 🎯 OBJETIVO
Implementar sistema completo de comunicação e histórico de interações, preparando a infraestrutura para integração com agentes de IA para atendimento automatizado via WhatsApp e outros canais.

## 📋 CONTEXTO DO PROJETO
Você está trabalhando no Evolutech CRM. O projeto já possui:
- Módulos base: Clientes, Dispositivos, OS, Fornecedores, Produtos
- Possíveis módulos: Orçamentos, Estoque, Autenticação, Status/Workflow
- **OBJETIVO FINAL:** Preparar para agentes IA que atendem clientes automaticamente

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### 1. ENTIDADE DE HISTÓRICO DE COMUNICAÇÃO

#### 1.1 Tabela `comunicacao_historico`
```sql
- id (UUID, PK)
- cliente_id (UUID, FK para clientes)
- ordem_servico_id (UUID, FK para ordensDeServico, nullable)
- canal (ENUM: 'whatsapp', 'telefone', 'presencial', 'email', 'sistema')
- tipo_interacao (ENUM: 'entrada', 'saida', 'automatica')
- remetente (VARCHAR(100)) - nome/telefone de quem enviou
- destinatario (VARCHAR(100)) - nome/telefone de quem recebeu
- conteudo (TEXT) - mensagem completa
- metadata (JSONB) - dados extras (ID da mensagem, timestamps, etc.)
- template_usado (VARCHAR(100), nullable) - se usou template
- usuario_responsavel_id (UUID, FK para usuarios, nullable)
- agente_ia (BOOLEAN DEFAULT false) - se foi processado por IA
- status_leitura (ENUM: 'nao_lido', 'lido', 'respondido')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 2. ENTIDADE DE TEMPLATES DE MENSAGEM

#### 2.1 Tabela `templates_mensagem`
```sql
- id (UUID, PK)
- nome (VARCHAR(100)) - identificador único
- categoria (ENUM: 'boas_vindas', 'status_os', 'cobranca', 'satisfacao', 'geral')
- titulo (VARCHAR(200)) - descrição do template
- conteudo (TEXT) - texto com variáveis {{nome}}, {{os_id}}, etc.
- variaveis_disponiveis (JSONB) - lista de variáveis que podem ser usadas
- ativo (BOOLEAN DEFAULT true)
- uso_automatico (BOOLEAN DEFAULT false) - se IA pode usar automaticamente
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 3. ENTIDADE DE CONFIGURAÇÃO IA

#### 3.1 Tabela `configuracao_ia`
```sql
- id (UUID, PK)
- chave (VARCHAR(100), UNIQUE) - 'webhook_whatsapp_url', 'api_key_ia', etc.
- valor (TEXT) - valor da configuração
- descricao (VARCHAR(300)) - descrição da configuração
- tipo (ENUM: 'string', 'number', 'boolean', 'json')
- categoria (VARCHAR(50)) - 'whatsapp', 'ia', 'notificacoes'
- ativo (BOOLEAN DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 4. ESTRUTURA DE ARQUIVOS

```
src/comunicacao/
├── comunicacao.types.ts
├── comunicacao.repository.ts
├── comunicacao.service.ts
└── comunicacao.controller.ts

src/templates/
├── template.types.ts
├── template.repository.ts
├── template.service.ts
└── template.controller.ts

src/agentesIA/
├── agenteIA.types.ts
├── agenteIA.service.ts
├── agenteIA.controller.ts
└── webhooks.controller.ts

src/configuracao/
├── configuracao.types.ts
├── configuracao.repository.ts
├── configuracao.service.ts
└── configuracao.controller.ts
```

### 5. ENDPOINTS DA API

#### 5.1 Histórico de Comunicação
- `POST /api/comunicacao` - Registrar nova interação
- `GET /api/comunicacao/cliente/:clienteId` - Histórico por cliente
- `GET /api/comunicacao/os/:osId` - Comunicações de uma OS
- `GET /api/comunicacao` - Listar todas (com filtros)
- `PATCH /api/comunicacao/:id/lida` - Marcar como lida
- `GET /api/comunicacao/nao-lidas` - Mensagens não lidas

#### 5.2 Templates de Mensagem
- `GET /api/templates` - Listar templates
- `POST /api/templates` - Criar template
- `PUT /api/templates/:id` - Atualizar template
- `DELETE /api/templates/:id` - Desativar template
- `POST /api/templates/:id/processar` - Processar template com variáveis
- `GET /api/templates/categoria/:categoria` - Templates por categoria

#### 5.3 API para Agentes IA (CRÍTICO)
- `POST /api/webhook/whatsapp` - Receber mensagens do WhatsApp
- `GET /api/agente/cliente/whatsapp/:numero` - Buscar cliente por WhatsApp
- `GET /api/agente/os/:id/status` - Consultar status de OS
- `GET /api/agente/cliente/:id/os-ativas` - OS ativas do cliente
- `POST /api/agente/comunicacao` - Registrar interação da IA
- `GET /api/agente/templates/automaticos` - Templates para uso automático
- `POST /api/agente/enviar-mensagem` - Enviar mensagem via IA

#### 5.4 Configurações
- `GET /api/configuracao` - Listar configurações
- `PUT /api/configuracao/:chave` - Atualizar configuração
- `GET /api/configuracao/categoria/:categoria` - Configs por categoria

### 6. REGRAS DE NEGÓCIO PARA IA

#### 6.1 Identificação de Cliente
- Buscar cliente por número de WhatsApp
- Se não encontrar, solicitar CPF/nome para identificação
- Criar histórico de tentativas de identificação

#### 6.2 Consultas Automáticas Permitidas
- Status de OS ativas do cliente
- Previsão de entrega
- Valor de orçamentos aprovados
- Histórico de OS finalizadas (últimos 6 meses)

#### 6.3 Ações Automáticas Permitidas
- Registrar comunicação no histórico
- Enviar templates pré-aprovados
- Agendar follow-ups
- Escalar para atendimento humano

#### 6.4 Limitações de Segurança
- Não revelar dados de outros clientes
- Não alterar status de OS
- Não aprovar orçamentos
- Não acessar dados financeiros sensíveis

### 7. TEMPLATES PADRÃO NECESSÁRIOS

#### 7.1 Boas-vindas
```
Olá {{nome_cliente}}! 👋
Sou o assistente virtual da Evolutech. Como posso ajudá-lo hoje?

Para consultar suas ordens de serviço, digite: *consultar*
Para falar com um atendente, digite: *atendente*
```

#### 7.2 Status de OS
```
📋 *Status da sua OS #{{os_numero}}*

Equipamento: {{dispositivo_tipo}} - {{dispositivo_marca}}
Status atual: {{status_atual}}
Técnico responsável: {{tecnico_nome}}
Previsão de entrega: {{data_prevista}}

{{observacoes_cliente}}
```

#### 7.3 Orçamento Disponível
```
💰 *Orçamento Pronto - OS #{{os_numero}}*

Valor total: R$ {{valor_total}}
Prazo para aprovação: {{prazo_aprovacao}} dias

Para aprovar, compareça à loja ou ligue: {{telefone_loja}}
```

### 8. WEBHOOK DO WHATSAPP

#### 8.1 Estrutura de Recebimento
```typescript
interface WhatsAppWebhook {
  from: string;        // número do remetente
  to: string;          // número da empresa
  message: {
    type: 'text' | 'image' | 'document';
    text?: string;
    media?: {
      url: string;
      filename: string;
    };
  };
  timestamp: number;
  messageId: string;
}
```

#### 8.2 Processamento Automático
1. Receber mensagem via webhook
2. Identificar cliente pelo número
3. Processar intenção da mensagem
4. Consultar dados necessários
5. Gerar resposta usando templates
6. Registrar toda a interação
7. Enviar resposta via API do WhatsApp

## 🔧 INSTRUÇÕES TÉCNICAS

### 1. IMPLEMENTAÇÃO GRADUAL

#### Fase 1: Base de Comunicação
1. Criar entidade ComunicacaoHistorico
2. Implementar CRUD básico
3. Sistema de templates

#### Fase 2: API para IA
1. Endpoints específicos para consulta
2. Webhook do WhatsApp
3. Sistema de identificação de clientes

#### Fase 3: Inteligência Básica
1. Processamento de intenções
2. Respostas automáticas
3. Escalação para humanos

### 2. PROCESSAMENTO DE INTENÇÕES

```typescript
enum IntencaoCliente {
  CONSULTAR_STATUS = 'consultar_status',
  FALAR_ATENDENTE = 'falar_atendente',
  APROVAR_ORCAMENTO = 'aprovar_orcamento',
  RECLAMAR = 'reclamar',
  ELOGIAR = 'elogiar',
  OUTROS = 'outros'
}

const processarIntencao = (mensagem: string): IntencaoCliente => {
  // Lógica simples de palavras-chave
  // Futuramente pode ser substituída por IA mais avançada
}
```

### 3. INTEGRAÇÃO COM WHATSAPP BUSINESS API

```typescript
const enviarMensagemWhatsApp = async (numero: string, mensagem: string) => {
  // Integração com API oficial do WhatsApp Business
  // Ou serviços como Twilio, ChatAPI, etc.
}
```

## 📊 MÉTRICAS E MONITORAMENTO

### 1. Dashboard de Comunicação
- Mensagens recebidas por canal
- Taxa de resolução automática
- Tempo médio de resposta
- Satisfação do cliente

### 2. Eficiência da IA
- Percentual de consultas resolvidas automaticamente
- Escalações para atendimento humano
- Templates mais utilizados
- Horários de maior demanda

## 📝 TAREFAS ESPECÍFICAS

### 1. **Implementar Base de Comunicação**
- Criar entidades e repositories
- Sistema de templates com variáveis
- Histórico completo de interações

### 2. **Desenvolver API para IA**
- Endpoints otimizados para consulta rápida
- Webhook do WhatsApp funcional
- Sistema de identificação de clientes

### 3. **Criar Processamento Básico**
- Análise de intenções por palavras-chave
- Respostas automáticas com templates
- Escalação inteligente para humanos

### 4. **Implementar Segurança**
- Rate limiting nos endpoints de IA
- Validação de webhooks
- Logs detalhados para auditoria

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Sistema de histórico de comunicação funcional
- [ ] Templates dinâmicos com variáveis operacionais
- [ ] API para agentes IA implementada e testada
- [ ] Webhook do WhatsApp recebendo mensagens
- [ ] Identificação automática de clientes funcionando
- [ ] Consultas de status de OS via IA operacionais
- [ ] Sistema de escalação para humanos ativo
- [ ] Logs e auditoria completos
- [ ] Rate limiting e segurança implementados
- [ ] Templates padrão criados e testados

## 🔄 ATUALIZAÇÃO DO PLANO

**APÓS COMPLETAR ESTA IMPLEMENTAÇÃO, ATUALIZE O ARQUIVO:**
`/c:/Users/erick/OneDrive/Documentos/Projetos/EvolutechCRM_backend/PLANO_DESENVOLVIMENTO.md`

**Marque como CONCLUÍDO:**
- ✅ 3.1 Módulo de Comunicação/Histórico (Prioridade: ALTA para IA)
- ✅ 3.2 API para Agentes IA (Prioridade: CRÍTICA para IA)

**Próximo passo sugerido:**
- Implementar 4.1 Sistema de Anexos/Fotos
- Ou focar em testes e otimizações dos módulos críticos

---

**CRÍTICO PARA IA:** Este módulo é a base para toda a automação de atendimento. Priorize a performance dos endpoints de consulta (< 100ms) e a confiabilidade do webhook do WhatsApp.