import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://dceaogrgifgvhzvpbznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlFile(filePath) {
  try {
    console.log(`Executando SQL do arquivo: ${filePath}`);
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    console.log('Conteúdo SQL:', sqlContent);
    
    // Executar o SQL usando rpc (função personalizada)
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      return false;
    }
    
    console.log('SQL executado com sucesso:', data);
    return true;
    
  } catch (err) {
    console.error('Erro:', err.message);
    return false;
  }
}

// Obter o caminho do arquivo SQL dos argumentos da linha de comando
const sqlFileName = process.argv[2];
if (!sqlFileName) {
  console.error('Por favor, forneça o nome do arquivo SQL como argumento.');
  console.error('Uso: node execute-sql.js <caminho_do_arquivo.sql>');
  process.exit(1);
}

const sqlFilePath = path.join(__dirname, '..', sqlFileName);
executeSqlFile(sqlFilePath)
  .then(success => {
    if (success) {
      console.log('✅ Script SQL executado com sucesso!');
      process.exit(0);
    } else {
      console.log('❌ Falha na execução do script SQL.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  });