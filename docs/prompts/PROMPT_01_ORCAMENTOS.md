# PROMPT 01: Implementação do Módulo de Orçamentos - Evolutech CRM

## 🎯 OBJETIVO
Implementar o módulo completo de Orçamentos para o sistema Evolutech CRM, incluindo versionamento, aprovação parcial de itens e integração com Ordens de Serviço existentes.

## 📋 CONTEXTO DO PROJETO
Você está trabalhando no Evolutech CRM, um sistema para gestão de assistência técnica. O projeto já possui:
- Arquitetura Controller-Service-Repository implementada
- Módulos existentes: Clientes, Dispositivos, Ordens de Serviço, Fornecedores, Produtos
- Supabase como banco de dados (PostgreSQL)
- TypeScript + Express.js
- Soft delete implementado em todos os módulos

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### 1. ENTIDADES NECESSÁRIAS

#### 1.1 Tabela `orcamentos`
```sql
- id (UUID, PK)
- ordem_servico_id (UUID, FK para ordensDeServico)
- versao (INTEGER) - v1, v2, v3, etc.
- status (ENUM: 'pendente', 'aprovado_parcial', 'aprovado_total', 'rejeitado')
- desconto_percentual (DECIMAL(5,2)) - máximo 10%
- desconto_justificativa (TEXT) - obrigatório se > 10%
- valor_total_pecas (DECIMAL(10,2))
- valor_total_servicos (DECIMAL(10,2))
- valor_total_geral (DECIMAL(10,2))
- observacoes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP) - soft delete
```

#### 1.2 Tabela `orcamento_itens`
```sql
- id (UUID, PK)
- orcamento_id (UUID, FK para orcamentos)
- produto_id (UUID, FK para produtos, nullable)
- tipo_item (ENUM: 'peca', 'servico')
- descricao (VARCHAR(500))
- quantidade (INTEGER)
- valor_unitario (DECIMAL(10,2))
- valor_total (DECIMAL(10,2))
- status_aprovacao (ENUM: 'pendente', 'aprovado', 'rejeitado', 'cliente_traz_peca')
- garantia_dias (INTEGER) - 90 fixo para serviços, variável para peças
- observacoes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP)
```

### 2. REGRAS DE NEGÓCIO CRÍTICAS

#### 2.1 Versionamento
- Uma OS pode ter múltiplos orçamentos (versões)
- Apenas o orçamento da versão mais alta pode ser editado
- Versões anteriores ficam como histórico (não podem ser deletadas)

#### 2.2 Aprovação Parcial
- Cliente pode aprovar apenas alguns itens do orçamento
- Itens aprovados não podem mais ser editados
- Cliente pode trazer peça própria (aprovar apenas o serviço)

#### 2.3 Descontos e Validações
- Desconto até 10% é automático
- Desconto > 10% requer justificativa obrigatória
- Valor total é calculado automaticamente

#### 2.4 Garantias
- Serviços: 90 dias fixos
- Peças: conforme fornecedor (campo configurável)

### 3. ESTRUTURA DE ARQUIVOS A CRIAR

```
src/orcamentos/
├── orcamento.types.ts
├── orcamento.repository.ts
├── orcamento.service.ts
└── orcamento.controller.ts

src/orcamentoItens/
├── orcamentoItem.types.ts
├── orcamentoItem.repository.ts
├── orcamentoItem.service.ts
└── orcamentoItem.controller.ts
```

### 4. ENDPOINTS DA API

#### 4.1 Orçamentos
- `POST /api/orcamentos` - Criar novo orçamento
- `GET /api/orcamentos` - Listar todos
- `GET /api/orcamentos/:id` - Buscar por ID
- `PUT /api/orcamentos/:id` - Atualizar (apenas versão atual)
- `DELETE /api/orcamentos/:id` - Soft delete
- `GET /api/orcamentos/os/:osId` - Buscar por OS
- `POST /api/orcamentos/:id/nova-versao` - Criar nova versão

#### 4.2 Itens de Orçamento
- `POST /api/orcamentos/:id/itens` - Adicionar item
- `GET /api/orcamentos/:id/itens` - Listar itens
- `PUT /api/orcamentos/:id/itens/:itemId` - Atualizar item
- `DELETE /api/orcamentos/:id/itens/:itemId` - Remover item
- `PATCH /api/orcamentos/:id/itens/:itemId/aprovar` - Aprovar item
- `PATCH /api/orcamentos/:id/itens/:itemId/rejeitar` - Rejeitar item

### 5. VALIDAÇÕES OBRIGATÓRIAS

#### 5.1 Criação de Orçamento
- OS deve existir e estar ativa
- Versão é incrementada automaticamente
- Status inicial sempre 'pendente'

#### 5.2 Adição de Itens
- Descrição obrigatória
- Quantidade > 0
- Valor unitário > 0
- Tipo de item válido ('peca' ou 'servico')

#### 5.3 Aprovação
- Apenas itens 'pendente' podem ser aprovados/rejeitados
- Recalcular totais após mudança de status
- Atualizar status do orçamento baseado nos itens

## 🔧 INSTRUÇÕES TÉCNICAS

### 1. PADRÕES A SEGUIR
- Usar mesma estrutura dos módulos existentes
- Implementar soft delete em todas as operações
- Validar dados com TypeScript interfaces
- Retornar erros padronizados (400, 404, 500)
- Usar transações para operações que afetam múltiplas tabelas

### 2. INTEGRAÇÃO COM MÓDULOS EXISTENTES
- Validar se OS existe antes de criar orçamento
- Buscar dados de produtos para preenchimento automático
- Manter referências consistentes

### 3. CÁLCULOS AUTOMÁTICOS
- Valor total do item = quantidade × valor_unitario
- Valor total peças = soma de todos os itens tipo 'peca' aprovados
- Valor total serviços = soma de todos os itens tipo 'servico' aprovados
- Aplicar desconto no valor total geral

## 📝 TAREFAS ESPECÍFICAS

1. **Criar types/interfaces** para Orcamento e OrcamentoItem
2. **Implementar repositories** com métodos CRUD + específicos
3. **Desenvolver services** com regras de negócio
4. **Criar controllers** com validações e tratamento de erros
5. **Adicionar rotas** no arquivo routes.ts existente
6. **Testar integração** com módulos existentes

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Todas as entidades criadas e funcionais
- [ ] CRUD completo implementado
- [ ] Versionamento funcionando corretamente
- [ ] Aprovação parcial de itens operacional
- [ ] Cálculos automáticos precisos
- [ ] Validações de negócio implementadas
- [ ] Integração com OS testada
- [ ] Soft delete funcionando
- [ ] Endpoints documentados e testáveis

## 🔄 ATUALIZAÇÃO DO PLANO

**APÓS COMPLETAR ESTA IMPLEMENTAÇÃO, ATUALIZE O ARQUIVO:**
`/c:/Users/erick/OneDrive/Documentos/Projetos/EvolutechCRM_backend/PLANO_DESENVOLVIMENTO.md`

**Marque como CONCLUÍDO:**
- ✅ 1.1 Módulo de Orçamentos (Prioridade: CRÍTICA)

**Próximo passo sugerido:**
- Implementar 1.2 Módulo de Estoque e Movimentações

---

**IMPORTANTE:** Este módulo é CRÍTICO para o funcionamento do sistema. Priorize a estabilidade e teste todas as funcionalidades antes de prosseguir para o próximo módulo.
