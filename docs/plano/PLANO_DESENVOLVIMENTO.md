# Plano de Desenvolvimento Detalhado - Evolutech CRM

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Projeto:** Sistema CRM para Assistência Técnica com Integração IA  

---

## 📋 Resumo Executivo

Este documento apresenta o plano de desenvolvimento completo para o Evolutech CRM, baseado na análise minuciosa dos requisitos e do estado atual do sistema. O projeto visa criar uma solução robusta para gestão de assistência técnica, preparada para integração futura com agentes de IA para atendimento automatizado.

---

## 🎯 Estado Atual do Projeto

### ✅ Módulos Implementados (CRUD Completo)
- **Clientes** - Controller, Service, Repository, Types
- **Dispositivos** - Controller, Service, Repository, Types  
- **Ordens de Serviço** - Controller, Service, Repository, Types (parcial)
- **Fornecedores** - Controller, Service, Repository, Types
- **Produtos** - Controller, Service, Repository, Types

### 🔧 Infraestrutura Atual
- Node.js + TypeScript + Express
- Supabase (PostgreSQL)
- Arquitetura Controller-Service-Repository
- Soft Delete implementado
- Roteamento estruturado com prefixo `/api`

---

## 🚀 Funcionalidades Pendentes Priorizadas

### **FASE 1: Módulos Essenciais (4-6 semanas)**

#### ✅ 1.1 Módulo de Orçamentos (Prioridade: CRÍTICA) - **CONCLUÍDO**
**Complexidade:** Alta | **Tempo estimado:** 2 semanas | **Status:** ✅ IMPLEMENTADO

**Entidades implementadas:**
- ✅ `Orcamentos` - Múltiplas versões por OS
- ✅ `OrcamentoItens` - Detalhamento de peças/serviços com aprovação individual

**Funcionalidades implementadas:**
- ✅ CRUD completo de orçamentos
- ✅ Versionamento de orçamentos (v1, v2, etc.)
- ✅ Aprovação parcial por item
- ✅ Cálculo automático de totais
- ✅ Status: Pendente, Aprovado Parcial, Aprovado Total, Rejeitado
- ✅ Integração com OS (uma OS pode ter múltiplos orçamentos)

**Regras de negócio implementadas:**
- ✅ Cliente pode autorizar apenas alguns itens
- ✅ Cliente pode trazer peça própria (autorizar serviço, não peça)
- ✅ Desconto até 10% (exceções requerem justificativa)
- ✅ Garantia: 90 dias fixo para serviços, variável para peças

**Arquivos criados:**
- ✅ `src/orcamentos/orcamento.types.ts`
- ✅ `src/orcamentos/orcamento.repository.ts`
- ✅ `src/orcamentos/orcamento.service.ts`
- ✅ `src/orcamentos/orcamento.controller.ts`
- ✅ `src/orcamentos/orcamentoItem.repository.ts`
- ✅ `src/orcamentos/orcamentoItem.service.ts`
- ✅ `src/orcamentos/orcamentoItem.controller.ts`
- ✅ Rotas adicionadas em `src/routes.ts`

**Endpoints implementados:**
- ✅ POST/GET/PATCH/DELETE `/api/orcamentos`
- ✅ GET `/api/orcamentos/os/:osId` - Buscar por OS
- ✅ POST `/api/orcamentos/:id/nova-versao` - Criar nova versão
- ✅ POST/GET/PATCH/DELETE `/api/orcamentos/:id/itens`
- ✅ PATCH `/api/orcamentos/:id/itens/:itemId/aprovar|rejeitar`

#### ✅ 1.2 Módulo de Estoque e Movimentações (Prioridade: ALTA) - **CONCLUÍDO**
**Complexidade:** Alta | **Tempo estimado:** 2 semanas | **Status:** ✅ IMPLEMENTADO

**Entidades implementadas:**
- ✅ `EstoqueMovimentacoes` - Histórico de entradas/saídas com auditoria completa
- ✅ Extensão da entidade `Produtos` com controle de estoque

**Funcionalidades implementadas:**
- ✅ Controle de quantidade atual por produto
- ✅ Registro de movimentações (entrada, saída, ajuste, transferência)
- ✅ Histórico completo para auditoria
- ✅ Alertas de estoque baixo e produtos sem estoque
- ✅ Integração com orçamentos aprovados
- ✅ Cálculo automático de saldo atual
- ✅ Relatórios de movimentações e estoque
- ✅ Validações de estoque disponível
- ✅ Controle de estoque mínimo e máximo

**Regras de negócio implementadas:**
- ✅ Toda movimentação registrada com quantidade anterior e atual
- ✅ Validação de estoque disponível antes de aprovação de orçamentos
- ✅ Estorno automático ao rejeitar itens aprovados
- ✅ Controle de produtos ativos/inativos
- ✅ Localização de estoque e código de barras

**Arquivos criados:**
- ✅ `src/estoque/estoque.types.ts`
- ✅ `src/estoque/estoque.repository.ts`
- ✅ `src/estoque/estoque.service.ts`
- ✅ `src/estoque/estoque.controller.ts`
- ✅ Extensões em `src/produtos/` (types, repository, service, controller)
- ✅ Rotas adicionadas em `src/routes.ts`

**Endpoints implementados:**
- ✅ POST/GET/DELETE `/api/estoque/movimentacao`
- ✅ POST `/api/estoque/ajuste` - Ajustes de inventário
- ✅ GET `/api/estoque/relatorio/movimentacoes` - Relatórios
- ✅ GET `/api/produtos/estoque-baixo` - Alertas de estoque
- ✅ PATCH `/api/produtos/:id/estoque` - Configurações de estoque
- ✅ Integração com orçamentos para controle automático

#### 1.3 Sistema de Autenticação e Usuários (Prioridade: ALTA)
**Complexidade:** Média | **Tempo estimado:** 1-2 semanas

**Entidades necessárias:**
- `Usuarios` - Técnicos, atendentes, administradores
- `Roles` - Controle de permissões

**Funcionalidades:**
- Login/logout com JWT
- Controle de acesso por role
- Atribuição de técnico responsável por OS
- Middleware de autenticação

### **FASE 2: Funcionalidades Avançadas (3-4 semanas)**

#### 2.1 Sistema de Status e Workflow de OS (Prioridade: ALTA)
**Complexidade:** Média | **Tempo estimado:** 1 semana

**Status necessários:**
- Recebido, Em Diagnóstico, Aguardando Peças, Aguardando Aprovação
- Em Reparo, Testando, Pronto para Retirada, Entregue, Cancelado

**Funcionalidades:**
- Transições de status controladas
- Histórico de mudanças de status
- Notificações automáticas para cliente

#### 2.2 Módulo de Pagamentos (Prioridade: MÉDIA)
**Complexidade:** Média | **Tempo estimado:** 1 semana

**Funcionalidades:**
- Registro de formas de pagamento
- Controle de parcelamento
- Aplicação de descontos com justificativa
- Integração com entrega de equipamento

#### 2.3 Sistema de Tipos de OS (Prioridade: MÉDIA)
**Complexidade:** Baixa | **Tempo estimado:** 3 dias

**Tipos necessários:**
- Serviço Normal, Retorno, Manutenção Preventiva, Garantia

#### 2.4 Campos Adicionais para Clientes (Prioridade: MÉDIA)
**Complexidade:** Baixa | **Tempo estimado:** 2 dias

**Campos a adicionar:**
- CPF, CNPJ (PJ), Email, Telefone secundário
- Endereço completo, Data de nascimento
- Tipo: Pessoa Física/Jurídica

### **FASE 3: Preparação para IA e CRM (2-3 semanas)**

#### 3.1 Módulo de Comunicação/Histórico (Prioridade: ALTA para IA)
**Complexidade:** Alta | **Tempo estimado:** 1-2 semanas

**Entidades necessárias:**
- `ComunicacaoHistorico` - Log de todas as interações
- `Templates` - Mensagens padrão

**Funcionalidades:**
- Registro de todas as comunicações (WhatsApp, telefone, presencial)
- Templates de mensagens para diferentes situações
- Histórico completo por cliente/OS
- API endpoints para agentes IA consultarem

#### 3.2 API para Agentes IA (Prioridade: CRÍTICA para IA)
**Complexidade:** Média | **Tempo estimado:** 1 semana

**Endpoints específicos:**
- `GET /api/agente/status-os/:id` - Consulta status de OS
- `POST /api/webhook/whatsapp` - Recebimento de mensagens
- `GET /api/agente/cliente/:whatsapp` - Busca cliente por WhatsApp
- `POST /api/agente/comunicacao` - Registro de interação

### **FASE 4: Funcionalidades Complementares (2 semanas)**

#### 4.1 Sistema de Anexos/Fotos (Prioridade: MÉDIA)
**Complexidade:** Média | **Tempo estimado:** 1 semana

**Funcionalidades:**
- Upload de fotos na entrada do equipamento
- Anexos em orçamentos e laudos
- Armazenamento seguro (Supabase Storage)

#### 4.2 Relatórios e Dashboard (Prioridade: BAIXA)
**Complexidade:** Média | **Tempo estimado:** 1 semana

**Relatórios necessários:**
- OS por período, técnico, status
- Faturamento e produtos mais vendidos
- Tempo médio de reparo

---

## 🏗️ Lacunas Arquiteturais Identificadas

### 1. **Falta de Sistema de Autenticação**
**Impacto:** Crítico  
**Solução:** Implementar JWT com Supabase Auth ou custom

### 2. **Ausência de Controle de Permissões**
**Impacto:** Alto  
**Solução:** Middleware de autorização baseado em roles

### 3. **Falta de Validação de Dados Robusta**
**Impacto:** Médio  
**Solução:** Implementar Zod ou Joi para validação

### 4. **Ausência de Logging Estruturado**
**Impacto:** Médio  
**Solução:** Implementar Winston ou similar

### 5. **Falta de Testes Automatizados**
**Impacto:** Alto  
**Solução:** Jest + Supertest para testes de integração

### 6. **Ausência de Documentação da API**
**Impacto:** Médio  
**Solução:** Swagger/OpenAPI

---

## 📅 Cronograma Detalhado

### **Sprint 1 (Semanas 1-2): Orçamentos**
- **Semana 1:** Modelagem e implementação de entidades
- **Semana 2:** Lógica de negócio e testes

### **Sprint 2 (Semanas 3-4): Estoque**
- **Semana 3:** Sistema de movimentações
- **Semana 4:** Integração com orçamentos

### **Sprint 3 (Semanas 5-6): Autenticação**
- **Semana 5:** Implementação de auth
- **Semana 6:** Controle de permissões

### **Sprint 4 (Semanas 7-8): Status e Workflow**
- **Semana 7:** Sistema de status
- **Semana 8:** Pagamentos e tipos de OS

### **Sprint 5 (Semanas 9-10): Preparação IA**
- **Semana 9:** Módulo de comunicação
- **Semana 10:** API para agentes IA

### **Sprint 6 (Semanas 11-12): Finalização**
- **Semana 11:** Anexos e melhorias
- **Semana 12:** Testes, documentação e deploy

---

## 🤖 Considerações para Integração com IA

### **Endpoints Essenciais para IA:**
1. **Consulta de Status:** Agente precisa informar status de OS ao cliente
2. **Busca de Cliente:** Identificar cliente pelo WhatsApp
3. **Histórico:** Acessar histórico de comunicações
4. **Registro de Interação:** Salvar conversas para contexto futuro

### **Dados Necessários para IA:**
- Histórico completo de comunicações
- Status atual de todas as OS do cliente
- Informações de contato atualizadas
- Templates de resposta padrão

### **Preparação da Arquitetura:**
- Endpoints otimizados para consulta rápida
- Cache para dados frequentemente acessados
- Rate limiting para proteger a API
- Logs detalhados para monitoramento

---

## 🚀 Estratégia de Deploy

### **Ambiente de Desenvolvimento**
- Docker para padronização
- Hot reload para desenvolvimento ágil

### **Ambiente de Produção**
- Vercel ou Railway para deploy automático
- Supabase para banco de dados
- Monitoramento com Sentry

### **CI/CD Pipeline**
- GitHub Actions
- Testes automatizados antes do deploy
- Deploy automático na branch main

---

## 📊 Métricas de Sucesso

### **Técnicas:**
- Cobertura de testes > 80%
- Tempo de resposta da API < 200ms
- Uptime > 99.5%

### **Funcionais:**
- Redução de 50% no tempo de atendimento
- 90% de satisfação do cliente
- Zero perda de dados de OS

### **Preparação para IA:**
- API respondendo em < 100ms
- 100% das interações registradas
- Templates cobrindo 80% dos casos

---

## 🔄 Próximos Passos Imediatos

1. **Validar este plano** com stakeholders
2. **Configurar ambiente de desenvolvimento** com Docker
3. **Implementar testes básicos** para módulos existentes
4. **Iniciar Sprint 1** - Módulo de Orçamentos
5. **Configurar CI/CD pipeline**

---

## 📝 Notas Importantes

- **Priorizar sempre a estabilidade** dos módulos existentes
- **Manter compatibilidade** com dados já inseridos
- **Documentar todas as decisões** arquiteturais
- **Testar integração** entre módulos constantemente
- **Preparar desde o início** para escala e IA

---

*Este documento será atualizado conforme o progresso do desenvolvimento e feedback dos stakeholders.*
