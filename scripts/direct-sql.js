import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dceaogrgifgvhzvpbznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWFvZ3JnaWZndmh6dnBiem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzMxNjgsImV4cCI6MjA3NDc0OTE2OH0.YaixvQ5PvoZU1btskbC3YDTm-JSD_a6mvmXLnSiY_6o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  try {
    console.log('🔧 Iniciando correção da estrutura da tabela Pagamentos...');
    
    // Primeiro, vamos verificar a estrutura atual da tabela
    console.log('📋 Verificando estrutura atual da tabela Pagamentos...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'Pagamentos');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
    } else {
      console.log('📊 Colunas atuais da tabela Pagamentos:');
      columns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
    // Tentar inserir um registro de teste para ver quais colunas estão faltando
    console.log('🧪 Testando inserção para identificar colunas faltantes...');
    
    const testData = {
      os_id: '710523f6-66f8-4805-a60f-8ad2edd3958c',
      valor_total: 1500.00,
      valor_pago: 0.00,
      valor_pendente: 1500.00,
      forma_pagamento: 'PIX',
      tipo_pagamento: 'SERVICO',
      numero_parcelas: 1,
      status: 'PENDENTE',
      data_vencimento: '2024-02-15',
      observacoes: 'Teste de estrutura'
    };
    
    const { data, error } = await supabase
      .from('Pagamentos')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('❌ Erro na inserção (esperado):', error.message);
      console.log('📝 Isso nos ajuda a identificar quais colunas estão faltando.');
    } else {
      console.log('✅ Inserção bem-sucedida! A estrutura da tabela está correta.');
      console.log('📄 Dados inseridos:', data);
      
      // Remover o registro de teste
      if (data && data[0]) {
        await supabase
          .from('Pagamentos')
          .delete()
          .eq('id', data[0].id);
        console.log('🗑️ Registro de teste removido.');
      }
    }
    
  } catch (err) {
    console.error('💥 Erro fatal:', err.message);
  }
}

// Executar o teste
addMissingColumns()
  .then(() => {
    console.log('🏁 Verificação concluída.');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
  });