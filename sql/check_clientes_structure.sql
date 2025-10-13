-- Check the structure of the Clientes table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Clientes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check with lowercase
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all tables that contain 'client' in the name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name ILIKE '%client%';