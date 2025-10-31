import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    const status = response.status === expectedStatus ? '✅' : '❌';
    console.log(`${status} ${method} ${endpoint} - Status: ${response.status}`);
    
    if (response.status !== expectedStatus) {
      console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
      console.log(`   Response:`, result);
    }

    return { success: response.status === expectedStatus, data: result };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runIntegrationTests() {
  console.log('🚀 Iniciando testes de integração...\n');

  // Testes de Autenticação
  console.log('🔐 Testando Autenticação:');
  await testEndpoint('GET', '/auth/me');
  await testEndpoint('POST', '/auth/logout');
  await testEndpoint('POST', '/auth/login', { email: '', password: '' }, 400);

  console.log('\n📦 Testando Produtos:');
  await testEndpoint('GET', '/produtos');
  await testEndpoint('POST', '/produtos', {
    descricao: 'Produto Teste',
    preco_custo: 50,
    preco_venda: 100
  }, 201);

  console.log('\n👥 Testando Clientes:');
  await testEndpoint('GET', '/clientes');
  await testEndpoint('POST', '/clientes', {
    nome: 'Cliente Teste',
    email: 'teste@teste.com'
  }, 201);

  console.log('\n🏢 Testando Fornecedores:');
  await testEndpoint('GET', '/fornecedores');
  await testEndpoint('POST', '/fornecedores', {
    nome: 'Fornecedor Teste',
    email: 'fornecedor@teste.com'
  }, 201);

  console.log('\n📋 Testando Orçamentos:');
  await testEndpoint('GET', '/orcamentos');

  console.log('\n💰 Testando Pagamentos:');
  await testEndpoint('GET', '/pagamentos');

  console.log('\n📦 Testando Estoque:');
  await testEndpoint('GET', '/estoque');
  await testEndpoint('GET', '/estoque/movimentacoes');
  await testEndpoint('GET', '/estoque?estoque_baixo=true');

  console.log('\n🏷️ Testando Etiquetas:');
  await testEndpoint('GET', '/etiquetas');

  console.log('\n👤 Testando Usuários:');
  await testEndpoint('GET', '/usuarios');

  console.log('\n✅ Testes de integração concluídos!');
}

runIntegrationTests().catch(console.error);