-- Script para verificar todas as tabelas existentes no Supabase
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Listar todas as tabelas públicas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar especificamente tabelas relacionadas a usuários
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (table_name ILIKE '%user%' OR table_name ILIKE '%usuario%')
ORDER BY table_name, ordinal_position;

-- 3. Verificar se existe alguma tabela com colunas de usuário
SELECT DISTINCT
    table_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name ILIKE '%user%' OR column_name ILIKE '%usuario%')
ORDER BY table_name;

-- 4. Verificar foreign keys existentes
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;