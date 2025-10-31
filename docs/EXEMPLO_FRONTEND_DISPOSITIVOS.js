// 📱 EXEMPLO PRÁTICO: Integração Frontend-Backend para Dispositivos
// Arquivo: DispositivoManager.js

class DispositivoManager {
  constructor(baseUrl = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken'); // Ajuste conforme sua auth
  }

  // 🔍 Buscar dispositivos de um cliente específico
  async buscarDispositivosDoCliente(clienteId) {
    try {
      const response = await fetch(`${this.baseUrl}/clientes/${clienteId}/dispositivos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const dispositivos = await response.json();
      console.log('✅ Dispositivos encontrados:', dispositivos);
      return dispositivos;

    } catch (error) {
      console.error('❌ Erro ao buscar dispositivos:', error);
      throw error;
    }
  }

  // ➕ Criar novo dispositivo para um cliente
  async criarDispositivo(clienteId, dadosDispositivo) {
    try {
      const response = await fetch(`${this.baseUrl}/clientes/${clienteId}/dispositivos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(dadosDispositivo)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const novoDispositivo = await response.json();
      console.log('✅ Dispositivo criado:', novoDispositivo);
      return novoDispositivo;

    } catch (error) {
      console.error('❌ Erro ao criar dispositivo:', error);
      throw error;
    }
  }

  // 📝 Atualizar dispositivo existente
  async atualizarDispositivo(dispositivoId, dadosAtualizacao) {
    try {
      const response = await fetch(`${this.baseUrl}/dispositivos/${dispositivoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(dadosAtualizacao)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const dispositivoAtualizado = await response.json();
      console.log('✅ Dispositivo atualizado:', dispositivoAtualizado);
      return dispositivoAtualizado;

    } catch (error) {
      console.error('❌ Erro ao atualizar dispositivo:', error);
      throw error;
    }
  }
}

// 🎨 EXEMPLO DE USO EM COMPONENTE REACT/VUE/ANGULAR

class TelaNovaOS {
  constructor() {
    this.dispositivoManager = new DispositivoManager();
    this.clienteSelecionado = null;
    this.dispositivoSelecionado = null;
    this.dispositivos = [];
  }

  // 👤 Quando cliente é selecionado
  async onClienteSelecionado(cliente) {
    this.clienteSelecionado = cliente;
    this.dispositivoSelecionado = null;
    
    console.log(`🔍 Buscando dispositivos do cliente: ${cliente.nome}`);
    
    try {
      // Buscar dispositivos do cliente
      this.dispositivos = await this.dispositivoManager.buscarDispositivosDoCliente(cliente.id);
      
      // Atualizar interface
      this.renderizarDispositivos();
      
    } catch (error) {
      this.mostrarErro('Erro ao carregar dispositivos do cliente');
    }
  }

  // 📱 Renderizar lista de dispositivos
  renderizarDispositivos() {
    const container = document.getElementById('dispositivos-container');
    
    if (this.dispositivos.length === 0) {
      container.innerHTML = `
        <div class="no-dispositivos">
          <p>Este cliente ainda não possui dispositivos cadastrados.</p>
          <button onclick="telaOS.mostrarFormularioCriacao()">
            ➕ Criar Primeiro Dispositivo
          </button>
        </div>
      `;
      return;
    }

    const dispositivosHTML = this.dispositivos.map(dispositivo => `
      <div class="dispositivo-card ${this.dispositivoSelecionado?.id === dispositivo.id ? 'selected' : ''}" 
           onclick="telaOS.selecionarDispositivo('${dispositivo.id}')">
        <div class="dispositivo-info">
          <h4>${dispositivo.tipo || 'Dispositivo'}</h4>
          <p>${dispositivo.marca_modelo || 'Marca/Modelo não informado'}</p>
          ${dispositivo.fotos_entrada?.length ? 
            `<span class="has-photos">📷 ${dispositivo.fotos_entrada.length} foto(s)</span>` : 
            ''
          }
        </div>
        <div class="dispositivo-actions">
          <button onclick="event.stopPropagation(); telaOS.editarDispositivo('${dispositivo.id}')">
            ✏️ Editar
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="dispositivos-list">
        <h3>Dispositivos do Cliente</h3>
        ${dispositivosHTML}
        <button class="btn-criar-novo" onclick="telaOS.mostrarFormularioCriacao()">
          ➕ Criar Novo Dispositivo
        </button>
      </div>
    `;
  }

  // ✅ Selecionar dispositivo
  selecionarDispositivo(dispositivoId) {
    this.dispositivoSelecionado = this.dispositivos.find(d => d.id === dispositivoId);
    console.log('📱 Dispositivo selecionado:', this.dispositivoSelecionado);
    
    // Atualizar visual
    this.renderizarDispositivos();
    
    // Habilitar próximo passo da OS
    this.habilitarProximoPasso();
  }

  // 📝 Mostrar formulário de criação
  mostrarFormularioCriacao() {
    const modal = document.getElementById('modal-criar-dispositivo');
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Criar Novo Dispositivo</h3>
        <form id="form-criar-dispositivo">
          <div class="form-group">
            <label>Tipo do Dispositivo *</label>
            <select name="tipo" required>
              <option value="">Selecione...</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Notebook">Notebook</option>
              <option value="Tablet">Tablet</option>
              <option value="Desktop">Desktop</option>
              <option value="Smartwatch">Smartwatch</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Marca e Modelo</label>
            <input type="text" name="marca_modelo" placeholder="Ex: Samsung Galaxy S21">
          </div>
          
          <div class="form-group">
            <label>Senha/PIN do Equipamento</label>
            <input type="text" name="senha_equipamento" placeholder="Senha de desbloqueio">
          </div>
          
          <div class="form-actions">
            <button type="button" onclick="telaOS.fecharModal()">Cancelar</button>
            <button type="submit">Criar Dispositivo</button>
          </div>
        </form>
      </div>
    `;
    
    modal.style.display = 'block';
    
    // Adicionar listener do formulário
    document.getElementById('form-criar-dispositivo').addEventListener('submit', (e) => {
      e.preventDefault();
      this.criarNovoDispositivo(new FormData(e.target));
    });
  }

  // ➕ Criar novo dispositivo
  async criarNovoDispositivo(formData) {
    try {
      const dadosDispositivo = {
        tipo: formData.get('tipo'),
        marca_modelo: formData.get('marca_modelo') || null,
        senha_equipamento: formData.get('senha_equipamento') || null
      };

      console.log('📝 Criando dispositivo:', dadosDispositivo);

      const novoDispositivo = await this.dispositivoManager.criarDispositivo(
        this.clienteSelecionado.id, 
        dadosDispositivo
      );

      // Adicionar à lista local
      this.dispositivos.push(novoDispositivo);
      
      // Selecionar automaticamente
      this.selecionarDispositivo(novoDispositivo.id);
      
      // Fechar modal
      this.fecharModal();
      
      this.mostrarSucesso('Dispositivo criado com sucesso!');

    } catch (error) {
      this.mostrarErro('Erro ao criar dispositivo: ' + error.message);
    }
  }

  // 🔧 Métodos auxiliares
  fecharModal() {
    document.getElementById('modal-criar-dispositivo').style.display = 'none';
  }

  habilitarProximoPasso() {
    const btnProximo = document.getElementById('btn-proximo-passo');
    if (btnProximo) {
      btnProximo.disabled = false;
      btnProximo.textContent = 'Continuar com OS';
    }
  }

  mostrarSucesso(mensagem) {
    // Implementar notificação de sucesso
    console.log('✅', mensagem);
  }

  mostrarErro(mensagem) {
    // Implementar notificação de erro
    console.error('❌', mensagem);
  }
}

// 🚀 INICIALIZAÇÃO
const telaOS = new TelaNovaOS();

// 📋 EXEMPLO DE DADOS QUE O BACKEND RETORNA:

/*
// GET /api/clientes/{id}/dispositivos
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2024-01-15T10:30:00Z",
    "cliente_id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Smartphone",
    "marca_modelo": "Samsung Galaxy S21",
    "fotos_entrada": [
      "https://storage.url/foto1.jpg"
    ],
    "senha_equipamento": "1234",
    "deleted_at": null
  }
]

// POST /api/clientes/{id}/dispositivos
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "created_at": "2024-01-20T16:45:00Z",
  "cliente_id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "Notebook",
  "marca_modelo": "Dell Inspiron 15",
  "fotos_entrada": null,
  "senha_equipamento": null,
  "deleted_at": null
}
*/