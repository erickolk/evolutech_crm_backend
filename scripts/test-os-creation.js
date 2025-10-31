// Script para testar criação de Ordem de Serviço
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testOSCreation() {
  console.log('🧪 Testando criação de Ordem de Serviço...\n');

  // Payload similar ao que o frontend está enviando
  const payload = {
    cliente_id: "a1dec84a-aba2-44a9-a986-c81718dec97b",
    dispositivo_id: "49d3531f-1c7c-4e18-b2b8-7f41959f9ced",
    descricao_problema: "Teste de criação via script",
    prioridade: "normal",
    tipo: "normal",
    observacoes: null,
    tecnico_responsavel: null,
    data_prevista: null,
    acessorios: null,
    numero_serie: null,
    diagnostico: null,
    laudo_tecnico: null,
    garantia_servico: 90
  };

  console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/ordensDeServico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`\n📊 Status da resposta: ${response.status}`);
    
    const responseText = await response.text();
    console.log('📄 Resposta completa:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ OS criada com sucesso!');
      console.log('🆔 ID da OS:', data.id);
      console.log('📋 Dados da OS:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Erro na criação da OS');
      try {
        const errorData = JSON.parse(responseText);
        console.log('💬 Mensagem de erro:', errorData.message);
      } catch (e) {
        console.log('💬 Resposta de erro (texto):', responseText);
      }
    }

  } catch (error) {
    console.error('\n🚨 Erro na requisição:', error.message);
  }

  // Teste com payload correto (usando campos da interface)
  console.log('\n\n🧪 Testando com payload correto...\n');
  
  const payloadCorreto = {
    cliente_id: "a1dec84a-aba2-44a9-a986-c81718dec97b",
    dispositivo_id: "49d3531f-1c7c-4e18-b2b8-7f41959f9ced",
    tipo_os: "normal",
    prioridade: "normal",
    relato_cliente: "Teste com campos corretos"
  };

  console.log('📤 Payload correto:', JSON.stringify(payloadCorreto, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/ordensDeServico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadCorreto)
    });

    console.log(`\n📊 Status da resposta: ${response.status}`);
    
    const responseText = await response.text();
    console.log('📄 Resposta completa:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ OS criada com sucesso!');
      console.log('🆔 ID da OS:', data.id);
      console.log('📋 Dados da OS:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Erro na criação da OS');
      try {
        const errorData = JSON.parse(responseText);
        console.log('💬 Mensagem de erro:', errorData.message);
      } catch (e) {
        console.log('💬 Resposta de erro (texto):', responseText);
      }
    }

  } catch (error) {
    console.error('\n🚨 Erro na requisição:', error.message);
  }
}

testOSCreation();