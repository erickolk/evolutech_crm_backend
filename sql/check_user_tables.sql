-- Check existing tables related to users
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%user%' OR table_name ILIKE '%usuario%'
ORDER BY table_name;
