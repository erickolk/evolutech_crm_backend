-- Script para criar dados de teste para validar pagamentos
-- Execute este script no Supabase SQL Editor

-- Inserir cliente de teste
INSERT INTO "Clientes" (
    id, nome, cpf, whatsapp_id, cep, endereco, numero_residencia, 
    bairro, cidade, data_nascimento, tipo_cliente, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Cliente Teste Pagamento',
    '12345678901',
    '5511999999999',
    '01234-567',
    'Rua Teste, 123',
    '123',
    'Centro',
    'São Paulo',
    '1990-01-01',
    'Pessoa Física',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir dispositivo de teste
INSERT INTO "Dispositivos" (
    id, cliente_id, tipo, marca_modelo, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'NOTEBOOK',
    'Dell Inspiron 15',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir OS de teste
INSERT INTO "OrdensDeServico" (
    id, cliente_id, dispositivo_id, status_fluxo, tipo_os, prioridade, 
    relato_cliente, valor_orcamento, prazo_entrega, acessorios_inclusos, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'recebido',
    'normal',
    'normal',
    'Ordem de serviço criada para testar funcionalidade de pagamentos',
    1000.00,
    '2024-02-20',
    'Carregador original, mouse sem fio',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 'Dados inseridos com sucesso!' as resultado;

-- Mostrar os dados criados
SELECT 
    c.nome as cliente,
    d.tipo as dispositivo,
    os.relato_cliente as ordem_servico,
    os.id as os_id
FROM "Clientes" c
JOIN "Dispositivos" d ON c.id = d.cliente_id
JOIN "OrdensDeServico" os ON c.id = os.cliente_id
WHERE c.id = '550e8400-e29b-41d4-a716-446655440000';