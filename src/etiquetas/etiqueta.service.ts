import { EtiquetaRepository } from './etiqueta.repository.js';
import type { 
  Etiqueta, 
  CreateEtiquetaRequest, 
  UpdateEtiquetaRequest, 
  EtiquetaFilters,
  EtiquetaResponse,
  EtiquetaStats,
  AplicarEtiquetaRequest,
  RemoverEtiquetaRequest,
  EtiquetasConversaResponse,
  EtiquetasMensagemResponse,
  ReorganizarEtiquetasRequest,
  EtiquetaAutomaticaMatch
} from './etiqueta.types.js';

export class EtiquetaService {
  private etiquetaRepository: EtiquetaRepository;

  constructor() {
    this.etiquetaRepository = new EtiquetaRepository();
  }

  async findAll(filters: EtiquetaFilters = {}): Promise<{ data: EtiquetaResponse[]; total: number }> {
    return await this.etiquetaRepository.findAll(filters);
  }

  async findById(id: string): Promise<EtiquetaResponse | null> {
    if (!id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    return await this.etiquetaRepository.findById(id);
  }

  async findByNome(nome: string): Promise<Etiqueta | null> {
    if (!nome?.trim()) {
      throw new Error('Nome da etiqueta é obrigatório');
    }

    return await this.etiquetaRepository.findByNome(nome.trim());
  }

  async findByCategoria(categoria: string): Promise<EtiquetaResponse[]> {
    if (!categoria?.trim()) {
      throw new Error('Categoria é obrigatória');
    }

    return await this.etiquetaRepository.findByCategoria(categoria.trim());
  }

  async create(data: CreateEtiquetaRequest): Promise<Etiqueta> {
    // Validações
    if (!data.nome?.trim()) {
      throw new Error('Nome da etiqueta é obrigatório');
    }

    if (!data.cor?.trim()) {
      throw new Error('Cor da etiqueta é obrigatória');
    }

    if (!data.categoria?.trim()) {
      throw new Error('Categoria da etiqueta é obrigatória');
    }

    // Validar formato da cor (hex)
    const corRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!corRegex.test(data.cor)) {
      throw new Error('Cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)');
    }

    // Verificar se já existe etiqueta com o mesmo nome
    const etiquetaExistente = await this.etiquetaRepository.findByNome(data.nome.trim());
    if (etiquetaExistente) {
      throw new Error('Já existe uma etiqueta com este nome');
    }

    // Validar regras automáticas se fornecidas
    if (data.uso_automatico && data.regras_automaticas) {
      this.validarRegrasAutomaticas(data.regras_automaticas);
    }

    const etiquetaData: CreateEtiquetaRequest = {
      ...data,
      nome: data.nome.trim(),
      categoria: data.categoria.trim(),
      descricao: data.descricao?.trim() || null,
      uso_automatico: data.uso_automatico || false,
      regras_automaticas: data.regras_automaticas || null
    };

    return await this.etiquetaRepository.create(etiquetaData);
  }

  async update(id: string, data: UpdateEtiquetaRequest): Promise<Etiqueta> {
    if (!id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    // Verificar se a etiqueta existe
    const etiquetaExistente = await this.etiquetaRepository.findById(id);
    if (!etiquetaExistente) {
      throw new Error('Etiqueta não encontrada');
    }

    // Validações dos campos que estão sendo atualizados
    if (data.nome !== undefined) {
      if (!data.nome?.trim()) {
        throw new Error('Nome da etiqueta não pode ser vazio');
      }

      // Verificar se já existe outra etiqueta com o mesmo nome
      const outraEtiqueta = await this.etiquetaRepository.findByNome(data.nome.trim());
      if (outraEtiqueta && outraEtiqueta.id !== id) {
        throw new Error('Já existe uma etiqueta com este nome');
      }
    }

    if (data.cor !== undefined) {
      if (!data.cor?.trim()) {
        throw new Error('Cor da etiqueta não pode ser vazia');
      }

      const corRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!corRegex.test(data.cor)) {
        throw new Error('Cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)');
      }
    }

    if (data.categoria !== undefined && !data.categoria?.trim()) {
      throw new Error('Categoria da etiqueta não pode ser vazia');
    }

    // Validar regras automáticas se fornecidas
    if (data.regras_automaticas) {
      this.validarRegrasAutomaticas(data.regras_automaticas);
    }

    const updateData: UpdateEtiquetaRequest = {
      ...data,
      nome: data.nome?.trim(),
      categoria: data.categoria?.trim(),
      descricao: data.descricao?.trim() || null
    };

    return await this.etiquetaRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    // Verificar se a etiqueta existe
    const etiqueta = await this.etiquetaRepository.findById(id);
    if (!etiqueta) {
      throw new Error('Etiqueta não encontrada');
    }

    await this.etiquetaRepository.delete(id);
  }

  async reorganizar(data: ReorganizarEtiquetasRequest): Promise<void> {
    if (!data.etiquetas || data.etiquetas.length === 0) {
      throw new Error('Lista de etiquetas é obrigatória');
    }

    // Validar se todas as etiquetas existem
    for (const item of data.etiquetas) {
      if (!item.id || item.ordem === undefined) {
        throw new Error('ID e ordem são obrigatórios para cada etiqueta');
      }

      const etiqueta = await this.etiquetaRepository.findById(item.id);
      if (!etiqueta) {
        throw new Error(`Etiqueta com ID ${item.id} não encontrada`);
      }
    }

    await this.etiquetaRepository.updateOrdem(data.etiquetas);
  }

  // Métodos para aplicação de etiquetas
  async aplicarEtiquetaConversa(conversaId: string, data: AplicarEtiquetaRequest): Promise<void> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!data.etiqueta_id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    if (!data.aplicada_por) {
      throw new Error('Usuário que aplicou a etiqueta é obrigatório');
    }

    // Verificar se a etiqueta existe e está ativa
    const etiqueta = await this.etiquetaRepository.findById(data.etiqueta_id);
    if (!etiqueta) {
      throw new Error('Etiqueta não encontrada');
    }

    if (!etiqueta.ativa) {
      throw new Error('Etiqueta não está ativa');
    }

    await this.etiquetaRepository.aplicarEtiquetaConversa(conversaId, data);
  }

  async removerEtiquetaConversa(conversaId: string, data: RemoverEtiquetaRequest): Promise<void> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    if (!data.etiqueta_id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    await this.etiquetaRepository.removerEtiquetaConversa(conversaId, data.etiqueta_id);
  }

  async buscarEtiquetasConversa(conversaId: string): Promise<EtiquetasConversaResponse> {
    if (!conversaId) {
      throw new Error('ID da conversa é obrigatório');
    }

    return await this.etiquetaRepository.buscarEtiquetasConversa(conversaId);
  }

  async aplicarEtiquetaMensagem(mensagemId: string, data: AplicarEtiquetaRequest): Promise<void> {
    if (!mensagemId) {
      throw new Error('ID da mensagem é obrigatório');
    }

    if (!data.etiqueta_id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    if (!data.aplicada_por) {
      throw new Error('Usuário que aplicou a etiqueta é obrigatório');
    }

    // Verificar se a etiqueta existe e está ativa
    const etiqueta = await this.etiquetaRepository.findById(data.etiqueta_id);
    if (!etiqueta) {
      throw new Error('Etiqueta não encontrada');
    }

    if (!etiqueta.ativa) {
      throw new Error('Etiqueta não está ativa');
    }

    await this.etiquetaRepository.aplicarEtiquetaMensagem(mensagemId, data);
  }

  async removerEtiquetaMensagem(mensagemId: string, data: RemoverEtiquetaRequest): Promise<void> {
    if (!mensagemId) {
      throw new Error('ID da mensagem é obrigatório');
    }

    if (!data.etiqueta_id) {
      throw new Error('ID da etiqueta é obrigatório');
    }

    await this.etiquetaRepository.removerEtiquetaMensagem(mensagemId, data.etiqueta_id);
  }

  async buscarEtiquetasMensagem(mensagemId: string): Promise<EtiquetasMensagemResponse> {
    if (!mensagemId) {
      throw new Error('ID da mensagem é obrigatório');
    }

    return await this.etiquetaRepository.buscarEtiquetasMensagem(mensagemId);
  }

  // Métodos para etiquetas automáticas
  async buscarEtiquetasAutomaticas(): Promise<Etiqueta[]> {
    return await this.etiquetaRepository.findAutomaticas();
  }

  async aplicarEtiquetasAutomaticas(conteudo: string, tipo: 'conversa' | 'mensagem'): Promise<EtiquetaAutomaticaMatch[]> {
    const etiquetasAutomaticas = await this.buscarEtiquetasAutomaticas();
    const matches: EtiquetaAutomaticaMatch[] = [];

    for (const etiqueta of etiquetasAutomaticas) {
      if (!etiqueta.regras_automaticas) continue;

      const match = this.avaliarRegrasAutomaticas(conteudo, etiqueta.regras_automaticas, tipo);
      if (match.aplicar) {
        matches.push({
          etiqueta_id: etiqueta.id,
          etiqueta_nome: etiqueta.nome,
          confianca: match.confianca,
          regra_aplicada: match.regra_aplicada
        });
      }
    }

    // Ordenar por confiança (maior primeiro)
    return matches.sort((a, b) => b.confianca - a.confianca);
  }

  async getStats(): Promise<EtiquetaStats> {
    return await this.etiquetaRepository.getStats();
  }

  // Métodos auxiliares privados
  private validarRegrasAutomaticas(regras: any): void {
    if (!regras || typeof regras !== 'object') {
      throw new Error('Regras automáticas devem ser um objeto válido');
    }

    // Validar estrutura básica das regras
    if (regras.palavras_chave && !Array.isArray(regras.palavras_chave)) {
      throw new Error('Palavras-chave devem ser um array');
    }

    if (regras.expressoes_regulares && !Array.isArray(regras.expressoes_regulares)) {
      throw new Error('Expressões regulares devem ser um array');
    }

    // Validar expressões regulares
    if (regras.expressoes_regulares) {
      for (const regex of regras.expressoes_regulares) {
        try {
          new RegExp(regex);
        } catch (error) {
          throw new Error(`Expressão regular inválida: ${regex}`);
        }
      }
    }
  }

  private avaliarRegrasAutomaticas(
    conteudo: string, 
    regras: any, 
    tipo: 'conversa' | 'mensagem'
  ): { aplicar: boolean; confianca: number; regra_aplicada?: string } {
    let confianca = 0;
    let regraAplicada = '';
    const conteudoLower = conteudo.toLowerCase();

    // Verificar palavras-chave
    if (regras.palavras_chave && Array.isArray(regras.palavras_chave)) {
      for (const palavra of regras.palavras_chave) {
        if (conteudoLower.includes(palavra.toLowerCase())) {
          confianca += 0.3;
          regraAplicada = `Palavra-chave: ${palavra}`;
          break;
        }
      }
    }

    // Verificar expressões regulares
    if (regras.expressoes_regulares && Array.isArray(regras.expressoes_regulares)) {
      for (const regexStr of regras.expressoes_regulares) {
        try {
          const regex = new RegExp(regexStr, 'i');
          if (regex.test(conteudo)) {
            confianca += 0.5;
            regraAplicada = `Regex: ${regexStr}`;
            break;
          }
        } catch (error) {
          // Ignorar regex inválida
        }
      }
    }

    // Verificar condições específicas por tipo
    if (regras.condicoes && regras.condicoes[tipo]) {
      const condicoes = regras.condicoes[tipo];
      
      if (condicoes.tamanho_minimo && conteudo.length >= condicoes.tamanho_minimo) {
        confianca += 0.1;
      }

      if (condicoes.tamanho_maximo && conteudo.length <= condicoes.tamanho_maximo) {
        confianca += 0.1;
      }
    }

    // Limitar confiança a 1.0
    confianca = Math.min(confianca, 1.0);

    // Aplicar se confiança for maior que o limiar (padrão: 0.3)
    const limiar = regras.limiar_confianca || 0.3;
    
    return {
      aplicar: confianca >= limiar,
      confianca,
      regra_aplicada: regraAplicada
    };
  }
}