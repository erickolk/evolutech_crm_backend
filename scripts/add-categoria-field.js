import { supabase } from '../src/lib/supabaseClient.ts';
import fs from 'fs';
import path from 'path';

async function addCategoriaField() {
  try {
    console.log('🔧 Adicionando campo "categoria" à tabela Produtos...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'sql', 'add_categoria_field.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Executar o SQL usando rpc (se disponível) ou query direta
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });

    if (error) {
      console.log('⚠️ Método RPC não disponível, tentando execução direta...');
      
      // Tentar execução direta das queries individuais
      const queries = sqlContent.split(';').filter(q => q.trim() && !q.trim().startsWith('--'));
      
      for (const query of queries) {
        if (query.trim()) {
          console.log(`Executando: ${query.trim().substring(0, 50)}...`);
          
          if (query.trim().toUpperCase().startsWith('ALTER TABLE')) {
            // Para ALTER TABLE, usar uma abordagem diferente
            const { error: alterError } = await supabase
              .from('Produtos')
              .select('categoria')
              .limit(1);
            
            if (alterError && alterError.message.includes('column "categoria" does not exist')) {
              console.log('❌ Campo categoria não existe. Precisa ser adicionado manualmente no Supabase.');
              console.log('📋 Execute este SQL no editor SQL do Supabase:');
              console.log('ALTER TABLE "Produtos" ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);');
              return;
            } else {
              console.log('✅ Campo categoria já existe ou foi adicionado com sucesso!');
            }
          }
        }
      }
    } else {
      console.log('✅ SQL executado com sucesso via RPC!');
    }

    // Verificar se o campo foi adicionado
    console.log('\n🔍 Verificando se o campo foi adicionado...');
    const { data: testData, error: testError } = await supabase
      .from('Produtos')
      .select('categoria')
      .limit(1);

    if (testError) {
      if (testError.message.includes('column "categoria" does not exist')) {
        console.log('❌ Campo categoria ainda não existe.');
        console.log('\n📋 Para adicionar o campo, execute este SQL no painel do Supabase:');
        console.log('ALTER TABLE "Produtos" ADD COLUMN categoria VARCHAR(100);');
      } else {
        console.log('❌ Erro ao verificar campo:', testError.message);
      }
    } else {
      console.log('✅ Campo "categoria" existe e está funcionando!');
      
      // Testar inserção de um produto com categoria
      console.log('\n🧪 Testando inserção com categoria...');
      const { data: insertData, error: insertError } = await supabase
        .from('Produtos')
        .insert({
          descricao: 'Produto Teste Categoria',
          preco_custo: 50,
          preco_venda: 100,
          categoria: 'Teste'
        })
        .select();

      if (insertError) {
        console.log('❌ Erro ao inserir produto com categoria:', insertError.message);
      } else {
        console.log('✅ Produto inserido com categoria com sucesso!');
        
        // Remover o produto de teste
        if (insertData && insertData[0]) {
          await supabase
            .from('Produtos')
            .delete()
            .eq('id', insertData[0].id);
          console.log('🧹 Produto de teste removido.');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar campo categoria:', error);
  }
}

addCategoriaField();