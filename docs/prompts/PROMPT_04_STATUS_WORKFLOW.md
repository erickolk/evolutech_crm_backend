# PROMPT 04: Sistema de Status e Workflow de OS + Pagamentos - Evolutech CRM

## 🎯 OBJETIVO
Implementar sistema completo de status e workflow para Ordens de Serviço, incluindo transições controladas, histórico de mudanças, tipos de OS e módulo básico de pagamentos.

## 📋 CONTEXTO DO PROJETO
Você está trabalhando no Evolutech CRM. O projeto já possui:
- Módulo de OS básico implementado
- Sistema de autenticação (se implementado)
- Possíveis módulos: Orçamentos, Estoque
- **DEPENDÊNCIA:** Este módulo estende o módulo de OS existente

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### 1. EXTENSÃO DA ENTIDADE ORDENS DE SERVIÇO

#### 1.1 Novos campos na tabela `ordensDeServico`
```sql
-- Adicionar à tabela existente:
- status (ENUM) - ver lista completa abaixo
- tipo_os (ENUM: 'normal', 'retorno', 'preventiva', 'garantia')
- prioridade (ENUM: 'baixa', 'normal', 'alta', 'urgente')
- tecnico_responsavel_id (UUID, FK para usuarios)
- data_prevista_entrega (DATE)
- data_entrega_real (TIMESTAMP)
- valor_total_aprovado (DECIMAL(10,2))
- forma_pagamento (ENUM: 'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'parcelado')
- parcelas (INTEGER DEFAULT 1)
- desconto_aplicado (DECIMAL(5,2))
- desconto_justificativa (TEXT)
- observacoes_internas (TEXT) - apenas para técnicos
- observacoes_cliente (TEXT) - visível para cliente
```

### 2. NOVA ENTIDADE: HISTÓRICO DE STATUS

#### 2.1 Tabela `os_status_historico`
```sql
- id (UUID, PK)
- ordem_servico_id (UUID, FK para ordensDeServico)
- status_anterior (VARCHAR(50))
- status_novo (VARCHAR(50))
- usuario_id (UUID, FK para usuarios) - quem fez a mudança
- motivo (TEXT) - razão da mudança
- observacoes (TEXT)
- data_mudanca (TIMESTAMP)
- created_at (TIMESTAMP)
```

### 3. NOVA ENTIDADE: TIPOS DE OS

#### 3.1 Tabela `tipos_os`
```sql
- id (UUID, PK)
- nome (VARCHAR(50)) - 'normal', 'retorno', 'preventiva', 'garantia'
- descricao (VARCHAR(200))
- cor_hex (VARCHAR(7)) - para UI (#FF5733)
- prazo_padrao_dias (INTEGER) - prazo padrão em dias
- requer_aprovacao (BOOLEAN) - se precisa aprovação para iniciar
- ativo (BOOLEAN DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 4. SISTEMA DE STATUS COMPLETO

#### 4.1 Status Disponíveis
```typescript
enum StatusOS {
  RECEBIDO = 'recebido',                    // OS criada, equipamento recebido
  EM_DIAGNOSTICO = 'em_diagnostico',        // Técnico analisando problema
  AGUARDANDO_PECAS = 'aguardando_pecas',    // Esperando peças chegarem
  AGUARDANDO_APROVACAO = 'aguardando_aprovacao', // Cliente precisa aprovar orçamento
  EM_REPARO = 'em_reparo',                  // Técnico executando reparo
  TESTANDO = 'testando',                    // Testando funcionamento
  PRONTO_RETIRADA = 'pronto_retirada',      // Pronto para cliente buscar
  ENTREGUE = 'entregue',                    // Entregue ao cliente
  CANCELADO = 'cancelado',                  // OS cancelada
  GARANTIA = 'garantia'                     // Retorno em garantia
}
```

#### 4.2 Transições Permitidas
```typescript
const transicoesPossíveis = {
  'recebido': ['em_diagnostico', 'cancelado'],
  'em_diagnostico': ['aguardando_pecas', 'aguardando_aprovacao', 'em_reparo', 'cancelado'],
  'aguardando_pecas': ['em_reparo', 'cancelado'],
  'aguardando_aprovacao': ['em_reparo', 'cancelado', 'em_diagnostico'],
  'em_reparo': ['testando', 'aguardando_pecas', 'cancelado'],
  'testando': ['pronto_retirada', 'em_reparo'],
  'pronto_retirada': ['entregue'],
  'entregue': ['garantia'],
  'cancelado': [], // status final
  'garantia': ['em_diagnostico', 'em_reparo']
}
```

### 5. MÓDULO DE PAGAMENTOS BÁSICO

#### 5.1 Tabela `pagamentos`
```sql
- id (UUID, PK)
- ordem_servico_id (UUID, FK para ordensDeServico)
- valor_total (DECIMAL(10,2))
- desconto_percentual (DECIMAL(5,2))
- desconto_valor (DECIMAL(10,2))
- valor_final (DECIMAL(10,2))
- forma_pagamento (ENUM: 'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'parcelado')
- numero_parcelas (INTEGER DEFAULT 1)
- status_pagamento (ENUM: 'pendente', 'pago', 'parcial', 'cancelado')
- data_pagamento (TIMESTAMP)
- observacoes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 6. ESTRUTURA DE ARQUIVOS

```
-- Estender módulo OS existente:
src/ordensDeServico/
├── os.types.ts (adicionar novos campos e enums)
├── os.repository.ts (adicionar métodos de status)
├── os.service.ts (adicionar lógica de workflow)
└── os.controller.ts (adicionar endpoints de status)

-- Criar novos módulos:
src/osStatusHistorico/
├── osStatusHistorico.types.ts
├── osStatusHistorico.repository.ts
├── osStatusHistorico.service.ts
└── osStatusHistorico.controller.ts

src/pagamentos/
├── pagamento.types.ts
├── pagamento.repository.ts
├── pagamento.service.ts
└── pagamento.controller.ts
```

### 7. ENDPOINTS DA API

#### 7.1 Status e Workflow
- `PATCH /api/os/:id/status` - Alterar status da OS
- `GET /api/os/:id/historico` - Histórico de mudanças de status
- `GET /api/os/status/:status` - Listar OS por status
- `GET /api/os/tecnico/:tecnicoId` - OS atribuídas a um técnico
- `PATCH /api/os/:id/atribuir-tecnico` - Atribuir técnico responsável

#### 7.2 Tipos de OS
- `GET /api/tipos-os` - Listar tipos disponíveis
- `POST /api/tipos-os` - Criar novo tipo (admin)
- `PUT /api/tipos-os/:id` - Atualizar tipo (admin)

#### 7.3 Pagamentos
- `POST /api/os/:id/pagamento` - Registrar pagamento
- `GET /api/os/:id/pagamento` - Consultar pagamento da OS
- `PATCH /api/pagamentos/:id` - Atualizar dados do pagamento
- `GET /api/pagamentos/relatorio` - Relatório de pagamentos

### 8. REGRAS DE NEGÓCIO CRÍTICAS

#### 8.1 Controle de Transições
- Apenas transições válidas são permitidas
- Registrar motivo obrigatório para mudanças críticas
- Validar permissões do usuário para cada transição
- Não permitir voltar de 'entregue' (exceto para garantia)

#### 8.2 Atribuição de Técnicos
- Apenas usuários com role 'tecnico' podem ser atribuídos
- Técnico pode ver apenas suas OS (exceto admin)
- Histórico de atribuições para auditoria

#### 8.3 Prazos e Notificações
- Calcular prazo baseado no tipo de OS
- Alertar sobre OS em atraso
- Notificar cliente sobre mudanças de status importantes

#### 8.4 Pagamentos
- Registrar pagamento apenas para OS 'pronto_retirada' ou 'entregue'
- Validar desconto conforme regras de orçamento
- Controlar parcelamento

## 🔧 INSTRUÇÕES TÉCNICAS

### 1. IMPLEMENTAÇÃO GRADUAL

#### Fase 1: Status e Workflow
1. Estender entidade OS com novos campos
2. Criar sistema de transições de status
3. Implementar histórico de mudanças

#### Fase 2: Tipos e Atribuições
1. Criar entidade TiposOS
2. Implementar atribuição de técnicos
3. Adicionar controle de prazos

#### Fase 3: Pagamentos
1. Criar entidade Pagamentos
2. Integrar com finalização de OS
3. Implementar relatórios básicos

### 2. VALIDAÇÕES DE TRANSIÇÃO

```typescript
const validarTransicao = (statusAtual: string, novoStatus: string): boolean => {
  const transicoesPossíveis = getTransicoesPossíveis();
  return transicoesPossíveis[statusAtual]?.includes(novoStatus) || false;
}
```

### 3. NOTIFICAÇÕES AUTOMÁTICAS

```typescript
// Notificar cliente sobre mudanças importantes
const statusNotificaveis = [
  'aguardando_aprovacao',
  'pronto_retirada',
  'entregue'
];
```

## 📊 RELATÓRIOS NECESSÁRIOS

### 1. Dashboard de OS
- OS por status (gráfico)
- OS em atraso
- OS por técnico
- Tempo médio por status

### 2. Relatório de Produtividade
- OS finalizadas por técnico
- Tempo médio de reparo
- Taxa de retrabalho (garantia)

### 3. Relatório Financeiro
- Faturamento por período
- Formas de pagamento mais usadas
- Descontos aplicados

## 📝 TAREFAS ESPECÍFICAS

### 1. **Estender Módulo OS**
- Adicionar novos campos na interface
- Implementar enums de status e tipos
- Criar métodos de transição de status

### 2. **Implementar Workflow**
- Sistema de validação de transições
- Histórico automático de mudanças
- Controle de permissões por status

### 3. **Criar Módulo Pagamentos**
- Entidade e CRUD básico
- Integração com finalização de OS
- Validações de desconto

### 4. **Desenvolver Relatórios**
- Dashboard básico de status
- Relatórios de produtividade
- Métricas financeiras

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Sistema de status implementado e funcional
- [ ] Transições controladas e validadas
- [ ] Histórico de mudanças registrado
- [ ] Tipos de OS configuráveis
- [ ] Atribuição de técnicos operacional
- [ ] Módulo de pagamentos básico funcionando
- [ ] Relatórios de status implementados
- [ ] Validações de negócio ativas
- [ ] Notificações automáticas (básicas)
- [ ] Integração com módulos existentes

## 🔄 ATUALIZAÇÃO DO PLANO

**APÓS COMPLETAR ESTA IMPLEMENTAÇÃO, ATUALIZE O ARQUIVO:**
`/c:/Users/erick/OneDrive/Documentos/Projetos/EvolutechCRM_backend/PLANO_DESENVOLVIMENTO.md`

**Marque como CONCLUÍDO:**
- ✅ 2.1 Sistema de Status e Workflow de OS (Prioridade: ALTA)
- ✅ 2.2 Módulo de Pagamentos (Prioridade: MÉDIA)
- ✅ 2.3 Sistema de Tipos de OS (Prioridade: MÉDIA)

**Próximo passo sugerido:**
- Implementar 2.4 Campos Adicionais para Clientes
- Ou pular para 3.1 Módulo de Comunicação/Histórico (preparação IA)

---

**IMPORTANTE:** Este módulo é central para a operação diária. Teste todas as transições de status e garanta que o workflow seja intuitivo para os usuários.
