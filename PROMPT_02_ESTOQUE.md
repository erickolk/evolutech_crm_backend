# PROMPT 02: Implementação do Módulo de Estoque e Movimentações - Evolutech CRM

## 🎯 OBJETIVO
Implementar o sistema completo de controle de estoque com movimentações, integração com produtos existentes e alertas de estoque baixo para o Evolutech CRM.

## 📋 CONTEXTO DO PROJETO
Você está trabalhando no Evolutech CRM. O projeto já possui:
- Módulo de Produtos implementado (src/produtos/)
- Arquitetura Controller-Service-Repository
- Supabase (PostgreSQL) + TypeScript + Express.js
- Soft delete em todos os módulos
- **DEPENDÊNCIA:** Este módulo deve integrar com o módulo de Orçamentos (se já implementado)

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### 1. EXTENSÃO DA ENTIDADE PRODUTOS

#### 1.1 Novos campos na tabela `produtos`
```sql
-- Adicionar à tabela existente:
- quantidade_minima (INTEGER DEFAULT 0) - alerta de estoque baixo
- quantidade_maxima (INTEGER DEFAULT 1000) - controle de estoque
- localizacao_estoque (VARCHAR(100)) - onde está armazenado
- codigo_barras (VARCHAR(50)) - para facilitar movimentações
- ativo (BOOLEAN DEFAULT true) - produto ativo/inativo
```

### 2. NOVA ENTIDADE: MOVIMENTAÇÕES DE ESTOQUE

#### 2.1 Tabela `estoque_movimentacoes`
```sql
- id (UUID, PK)
- produto_id (UUID, FK para produtos)
- tipo_movimentacao (ENUM: 'entrada', 'saida', 'ajuste', 'transferencia')
- quantidade (INTEGER) - positivo para entrada, negativo para saída
- quantidade_anterior (INTEGER) - estoque antes da movimentação
- quantidade_atual (INTEGER) - estoque após a movimentação
- valor_unitario (DECIMAL(10,2)) - custo da movimentação
- valor_total (DECIMAL(10,2)) - quantidade × valor_unitario
- motivo (VARCHAR(200)) - razão da movimentação
- documento_referencia (VARCHAR(100)) - NF, OS, etc.
- usuario_id (UUID) - quem fez a movimentação (futuro)
- observacoes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP)
```

### 3. TIPOS DE MOVIMENTAÇÃO

#### 3.1 Entrada
- Compra de fornecedor
- Devolução de cliente
- Ajuste positivo
- Transferência recebida

#### 3.2 Saída
- Venda/uso em OS
- Perda/avaria
- Ajuste negativo
- Transferência enviada

#### 3.3 Ajuste
- Correção de inventário
- Acerto de divergências

### 4. ESTRUTURA DE ARQUIVOS A CRIAR

```
src/estoque/
├── estoque.types.ts
├── estoque.repository.ts
├── estoque.service.ts
└── estoque.controller.ts

-- Atualizar módulo produtos existente:
src/produtos/
├── produto.types.ts (adicionar novos campos)
├── produto.repository.ts (adicionar métodos de estoque)
├── produto.service.ts (adicionar validações de estoque)
└── produto.controller.ts (adicionar endpoints de estoque)
```

### 5. ENDPOINTS DA API

#### 5.1 Movimentações de Estoque
- `POST /api/estoque/movimentacao` - Registrar movimentação
- `GET /api/estoque/movimentacoes` - Listar todas (com filtros)
- `GET /api/estoque/movimentacoes/:id` - Buscar por ID
- `GET /api/estoque/produto/:produtoId` - Histórico por produto
- `GET /api/estoque/relatorio` - Relatório de movimentações

#### 5.2 Controle de Estoque
- `GET /api/estoque/atual` - Estoque atual de todos os produtos
- `GET /api/estoque/baixo` - Produtos com estoque baixo
- `GET /api/estoque/zerado` - Produtos sem estoque
- `POST /api/estoque/ajuste` - Ajuste de estoque
- `GET /api/estoque/produto/:id/saldo` - Saldo atual de um produto

#### 5.3 Extensões no módulo Produtos
- `PATCH /api/produtos/:id/estoque` - Atualizar configurações de estoque
- `GET /api/produtos/:id/movimentacoes` - Histórico de movimentações

### 6. REGRAS DE NEGÓCIO CRÍTICAS

#### 6.1 Controle de Quantidade
- Quantidade atual sempre calculada pelas movimentações
- Não permitir estoque negativo (exceto com justificativa)
- Registrar quantidade anterior e atual em cada movimentação

#### 6.2 Alertas de Estoque
- Alerta quando quantidade atual ≤ quantidade_minima
- Bloquear vendas quando estoque = 0 (configurável)
- Notificar sobre produtos inativos

#### 6.3 Integração com Orçamentos
- Ao aprovar item de orçamento, dar baixa no estoque
- Ao rejeitar/cancelar, devolver ao estoque
- Reservar estoque para orçamentos aprovados

#### 6.4 Auditoria Completa
- Toda movimentação deve ser registrada
- Histórico imutável (soft delete apenas)
- Rastreabilidade total

### 7. VALIDAÇÕES OBRIGATÓRIAS

#### 7.1 Movimentações
- Produto deve existir e estar ativo
- Quantidade deve ser diferente de zero
- Tipo de movimentação válido
- Motivo obrigatório para ajustes

#### 7.2 Estoque Negativo
- Permitir apenas com justificativa
- Alertar sobre inconsistências
- Registrar em log especial

#### 7.3 Valores
- Valor unitário obrigatório para entradas
- Calcular valor total automaticamente
- Validar valores positivos

## 🔧 INSTRUÇÕES TÉCNICAS

### 1. IMPLEMENTAÇÃO GRADUAL

#### Fase 1: Estrutura Base
1. Criar entidade EstoqueMovimentacao
2. Estender entidade Produto
3. Implementar repository básico

#### Fase 2: Lógica de Negócio
1. Service com cálculos de estoque
2. Validações de movimentação
3. Integração com produtos

#### Fase 3: Controllers e API
1. Endpoints de movimentação
2. Relatórios de estoque
3. Alertas e notificações

### 2. CÁLCULOS AUTOMÁTICOS

```typescript
// Exemplo de cálculo de estoque atual
const calcularEstoqueAtual = (produtoId: string) => {
  // Somar todas as movimentações do produto
  // Entrada: quantidade positiva
  // Saída: quantidade negativa
  // Retornar saldo atual
}
```

### 3. INTEGRAÇÃO COM ORÇAMENTOS

```typescript
// Ao aprovar item de orçamento
const aprovarItemOrcamento = async (itemId: string) => {
  // 1. Verificar estoque disponível
  // 2. Registrar movimentação de saída
  // 3. Atualizar quantidade atual
  // 4. Aprovar item
}
```

## 📊 RELATÓRIOS NECESSÁRIOS

### 1. Estoque Atual
- Lista todos os produtos com quantidade atual
- Destaca produtos com estoque baixo
- Mostra valor total do estoque

### 2. Movimentações por Período
- Filtros: data, produto, tipo de movimentação
- Totais de entrada e saída
- Saldo inicial e final

### 3. Produtos Críticos
- Estoque zerado
- Estoque abaixo do mínimo
- Produtos inativos com estoque

## 📝 TAREFAS ESPECÍFICAS

### 1. **Atualizar Módulo Produtos**
- Adicionar novos campos na interface Produto
- Estender repository com métodos de estoque
- Atualizar service com validações
- Adicionar endpoints de estoque no controller

### 2. **Criar Módulo Estoque**
- Implementar types para EstoqueMovimentacao
- Criar repository com métodos específicos
- Desenvolver service com lógica de negócio
- Implementar controller com validações

### 3. **Integração e Testes**
- Testar cálculos de estoque
- Validar integração com produtos
- Verificar alertas de estoque baixo
- Testar cenários de estoque negativo

## ✅ CRITÉRIOS DE ACEITAÇÃO

- [ ] Extensão do módulo Produtos implementada
- [ ] Entidade EstoqueMovimentacao criada e funcional
- [ ] CRUD completo de movimentações
- [ ] Cálculo automático de estoque atual
- [ ] Alertas de estoque baixo funcionando
- [ ] Integração com orçamentos (se disponível)
- [ ] Relatórios de estoque operacionais
- [ ] Validações de negócio implementadas
- [ ] Auditoria completa funcionando
- [ ] Testes de integração aprovados

## 🔄 ATUALIZAÇÃO DO PLANO

**APÓS COMPLETAR ESTA IMPLEMENTAÇÃO, ATUALIZE O ARQUIVO:**
`/c:/Users/erick/OneDrive/Documentos/Projetos/EvolutechCRM_backend/PLANO_DESENVOLVIMENTO.md`

**Marque como CONCLUÍDO:**
- ✅ 1.2 Módulo de Estoque e Movimentações (Prioridade: ALTA)

**Próximo passo sugerido:**
- Implementar 1.3 Sistema de Autenticação e Usuários

---

**IMPORTANTE:** Este módulo é fundamental para o controle financeiro e operacional. Garanta que todos os cálculos estejam precisos e que a auditoria seja completa antes de prosseguir.