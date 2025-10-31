# Correção da Criação de Ordem de Serviço (OS)

## Problema Identificado

O endpoint `POST /api/ordensDeServico` estava falhando com erro `PGRST204` devido a incompatibilidade entre os campos esperados pelo código e a estrutura real da tabela `OrdensDeServico` no banco de dados.

## Estrutura Real da Tabela OrdensDeServico

Baseado na análise do banco de dados, a tabela possui os seguintes campos:

```json
{
  "id": "string (UUID)",
  "created_at": "string (timestamp)",
  "cliente_id": "string (UUID) - OBRIGATÓRIO",
  "dispositivo_id": "string (UUID) - OBRIGATÓRIO", 
  "status_fluxo": "string",
  "relato_cliente": "string",
  "diagnostico_tecnico": "string",
  "valor_orcamento": "number",
  "prazo_entrega": "string",
  "garantia_servico": "number",
  "data_ultima_manutencao": "string",
  "esta_na_garantia_cliente": "boolean",
  "diagnostico_anterior_cliente": "string",
  "tecnico_responsavel_id": "string (UUID)",
  "prioridade": "string",
  "numero_aos": "string",
  "acessorios_inclusos": "string",
  "deleted_at": "string",
  "tipo_os": "string"
}
```

## Payload Correto para Criação de OS

### Campos Obrigatórios
- `cliente_id`: UUID do cliente
- `dispositivo_id`: UUID do dispositivo

### Campos Opcionais Aceitos
- `relato_cliente`: Descrição do problema relatado pelo cliente
- `prioridade`: Prioridade da OS (ex: "Normal", "Alta", "Urgente")
- `tipo_os`: Tipo da OS (ex: "Reparo", "Manutenção", "Garantia")
- `acessorios_inclusos`: Lista de acessórios que acompanham o dispositivo
- `data_prevista_entrega`: Data prevista para entrega (será mapeada para `prazo_entrega`)

### Exemplo de Payload Válido

```json
{
  "cliente_id": "6a77bcb8-1faf-4b1a-ad21-c981aaa7eb55",
  "dispositivo_id": "1e768de0-8d7e-4c03-b7a3-c48c0eeb32ef",
  "relato_cliente": "Equipamento não está ligando",
  "prioridade": "Normal",
  "tipo_os": "Reparo",
  "acessorios_inclusos": "Carregador, cabo USB"
}
```

## Mapeamento de Campos (Backend)

O service agora mapeia automaticamente os campos do frontend para a estrutura da tabela:

- `descricao_problema` → `relato_cliente`
- `data_prevista_entrega` → `prazo_entrega`
- `data_prevista` → `prazo_entrega`
- `acessorios` → `acessorios_inclusos`
- `tipo` → `tipo_os`
- `diagnostico` → `diagnostico_tecnico`
- `tecnico_responsavel` → `tecnico_responsavel_id`

## Status Padrão

Toda OS criada recebe automaticamente:
- `status_fluxo`: "Recebido"

## Resposta de Sucesso

```json
{
  "id": "8784130d-5ebd-462b-a0e5-3362b746abca",
  "created_at": "2025-10-31T16:07:07.071983+00:00",
  "cliente_id": "6a77bcb8-1faf-4b1a-ad21-c981aaa7eb55",
  "dispositivo_id": "1e768de0-8d7e-4c03-b7a3-c48c0eeb32ef",
  "status_fluxo": "Recebido",
  "relato_cliente": "Equipamento não está ligando",
  "prioridade": "Normal",
  "tipo_os": "Reparo",
  // ... outros campos
}
```

## Códigos de Resposta

- `201 Created`: OS criada com sucesso
- `400 Bad Request`: Dados inválidos ou campos obrigatórios ausentes
- `401 Unauthorized`: Token de autenticação inválido ou ausente

## Testes Realizados

✅ Criação com campos obrigatórios apenas  
✅ Criação com campos opcionais  
✅ Mapeamento automático de campos do frontend  
✅ Validação de campos obrigatórios  
✅ Resposta com estrutura correta da tabela  

## Correções Aplicadas

1. **Interface OrdemDeServico**: Atualizada para refletir a estrutura real da tabela
2. **Service**: Corrigido mapeamento de campos para usar apenas campos existentes na tabela
3. **CreateOrdemDeServicoRequest**: Flexibilizada para aceitar diferentes formatos do frontend
4. **Validações**: Mantidas apenas para campos obrigatórios reais

## Recomendações para o Frontend

1. Use os campos da estrutura real da tabela sempre que possível
2. Os campos `cliente_id` e `dispositivo_id` são obrigatórios
3. O backend faz mapeamento automático de campos antigos, mas é recomendado migrar para os novos nomes
4. Sempre verifique o status de resposta antes de processar o resultado