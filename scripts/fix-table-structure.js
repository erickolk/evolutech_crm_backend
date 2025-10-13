import fetch from 'node-fetch';

// Configuração do Supabase
const supabaseUrl = 'https://dceaogrgifgvhzvpbznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o';

async function executeSQL(sql) {
  try {
    console.log(`🔧 Executando SQL: ${sql.substring(0, 100)}...`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql_query: sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ SQL executado com sucesso:', result);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    return false;
  }
}

async function fixTableStructure() {
  console.log('🚀 Iniciando correção da estrutura da tabela Pagamentos...');
  
  // Lista de comandos SQL para executar
  const sqlCommands = [
    // Adicionar coluna tipo_pagamento
    `ALTER TABLE "Pagamentos" ADD COLUMN IF NOT EXISTS "tipo_pagamento" VARCHAR(50);`,
    
    // Adicionar coluna numero_parcelas
    `ALTER TABLE "Pagamentos" ADD COLUMN IF NOT EXISTS "numero_parcelas" INTEGER DEFAULT 1;`,
    
    // Adicionar coluna valor_pago
    `ALTER TABLE "Pagamentos" ADD COLUMN IF NOT EXISTS "valor_pago" DECIMAL(10,2) DEFAULT 0.00;`,
    
    // Adicionar coluna valor_pendente
    `ALTER TABLE "Pagamentos" ADD COLUMN IF NOT EXISTS "valor_pendente" DECIMAL(10,2) DEFAULT 0.00;`,
    
    // Tentar adicionar PARCIAL ao enum (pode falhar se já existir)
    `DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'PARCIAL' 
            AND enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'status_pagamento'
            )
        ) THEN
            ALTER TYPE status_pagamento ADD VALUE 'PARCIAL';
        END IF;
    END $$;`
  ];
  
  let successCount = 0;
  
  for (const sql of sqlCommands) {
    const success = await executeSQL(sql);
    if (success) {
      successCount++;
    }
    // Pequena pausa entre comandos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Resultado: ${successCount}/${sqlCommands.length} comandos executados com sucesso.`);
  
  if (successCount === sqlCommands.length) {
    console.log('🎉 Estrutura da tabela corrigida com sucesso!');
    return true;
  } else {
    console.log('⚠️ Alguns comandos falharam, mas isso pode ser normal se as colunas já existirem.');
    return false;
  }
}

// Executar a correção
fixTableStructure()
  .then(success => {
    console.log('🏁 Processo concluído.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
  });