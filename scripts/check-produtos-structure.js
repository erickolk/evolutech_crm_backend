import { supabase } from '../src/lib/supabaseClient.ts';

async function checkProdutosStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela Produtos...\n');

    // Buscar um produto para ver os campos disponíveis
    const { data: produtos, error: produtosError } = await supabase
      .from('Produtos')
      .select('*')
      .limit(1);

    if (produtosError) {
      console.error('❌ Erro ao buscar produtos:', produtosError);
      return;
    }

    if (produtos && produtos.length > 0) {
      console.log('📋 Campos disponíveis na tabela Produtos:');
      const campos = Object.keys(produtos[0]);
      campos.forEach((campo, index) => {
        console.log(`${index + 1}. ${campo}`);
      });

      console.log('\n🔍 Verificando se campo "categoria" existe:');
      const temCategoria = campos.includes('categoria');
      console.log(`Campo "categoria": ${temCategoria ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);

      if (!temCategoria) {
        console.log('\n💡 O campo "categoria" precisa ser adicionado à tabela Produtos');
      }

      console.log('\n📄 Exemplo de produto atual:');
      console.log(JSON.stringify(produtos[0], null, 2));
    } else {
      console.log('⚠️ Nenhum produto encontrado na tabela');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
}

checkProdutosStructure();