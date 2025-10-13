import { TemplateRepository } from './template.repository.js';
import type { 
  MessageTemplate, 
  CreateTemplateRequest, 
  UpdateTemplateRequest,
  TemplateFilters,
  TemplateResponse,
  ProcessTemplateRequest,
  ProcessedTemplate,
  TemplateVariable,
  SystemVariables,
  VariableType
} from './template.types.js';

export class TemplateService {
  private templateRepository: TemplateRepository;

  constructor() {
    this.templateRepository = new TemplateRepository();
  }

  async criarTemplate(templateData: CreateTemplateRequest, userId: string): Promise<MessageTemplate> {
    try {
      // Validar dados do template
      this.validarDadosTemplate(templateData);

      // Extrair variáveis do conteúdo
      const variaveisExtraidas = this.extrairVariaveis(templateData.conteudo);
      
      // Mesclar com variáveis fornecidas
      const variaveisFinais = [...new Set([...templateData.variaveis, ...variaveisExtraidas])];

      const templateComVariaveis = {
        ...templateData,
        variaveis: variaveisFinais
      };

      return await this.templateRepository.create(templateComVariaveis, userId);
    } catch (error) {
      console.error('Erro no serviço ao criar template:', error);
      throw error;
    }
  }

  async buscarTemplatePorId(id: string): Promise<MessageTemplate | null> {
    try {
      return await this.templateRepository.findById(id);
    } catch (error) {
      console.error('Erro no serviço ao buscar template por ID:', error);
      throw error;
    }
  }

  async buscarTemplates(
    filters: TemplateFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<TemplateResponse> {
    try {
      return await this.templateRepository.findAll(filters, page, limit);
    } catch (error) {
      console.error('Erro no serviço ao buscar templates:', error);
      throw error;
    }
  }

  async atualizarTemplate(id: string, updateData: UpdateTemplateRequest): Promise<MessageTemplate> {
    try {
      // Verificar se o template existe
      const templateExistente = await this.templateRepository.findById(id);
      if (!templateExistente) {
        throw new Error('Template não encontrado');
      }

      // Se o conteúdo foi alterado, reextrair variáveis
      if (updateData.conteudo) {
        const variaveisExtraidas = this.extrairVariaveis(updateData.conteudo);
        const variaveisExistentes = updateData.variaveis || templateExistente.variaveis;
        updateData.variaveis = [...new Set([...variaveisExistentes, ...variaveisExtraidas])];
      }

      return await this.templateRepository.update(id, updateData);
    } catch (error) {
      console.error('Erro no serviço ao atualizar template:', error);
      throw error;
    }
  }

  async deletarTemplate(id: string): Promise<void> {
    try {
      const template = await this.templateRepository.findById(id);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      await this.templateRepository.delete(id);
    } catch (error) {
      console.error('Erro no serviço ao deletar template:', error);
      throw error;
    }
  }

  async buscarTemplatesPorCategoria(categoria: string): Promise<MessageTemplate[]> {
    try {
      return await this.templateRepository.findByCategory(categoria);
    } catch (error) {
      console.error('Erro no serviço ao buscar templates por categoria:', error);
      throw error;
    }
  }

  async alternarStatusTemplate(id: string): Promise<MessageTemplate> {
    try {
      return await this.templateRepository.toggleActive(id);
    } catch (error) {
      console.error('Erro no serviço ao alterar status do template:', error);
      throw error;
    }
  }

  async processarTemplate(request: ProcessTemplateRequest): Promise<ProcessedTemplate> {
    try {
      const template = await this.templateRepository.findById(request.template_id);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      if (!template.ativo) {
        throw new Error('Template está inativo');
      }

      // Criar mapa de variáveis
      const variaveisMap = new Map<string, string>();
      request.variaveis.forEach(variavel => {
        const valorFormatado = this.formatarValorVariavel(variavel.valor, variavel.tipo);
        variaveisMap.set(variavel.nome, valorFormatado);
      });

      // Processar o conteúdo
      let conteudoProcessado = template.conteudo;
      const variaveisUtilizadas: string[] = [];
      const variaveisFaltantes: string[] = [];

      // Substituir variáveis no formato {{variavel}}
      const regex = /\{\{([^}]+)\}\}/g;
      let match;

      while ((match = regex.exec(template.conteudo)) !== null) {
        const nomeVariavel = match[1].trim();
        
        if (variaveisMap.has(nomeVariavel)) {
          const valor = variaveisMap.get(nomeVariavel)!;
          conteudoProcessado = conteudoProcessado.replace(match[0], valor);
          variaveisUtilizadas.push(nomeVariavel);
        } else {
          variaveisFaltantes.push(nomeVariavel);
        }
      }

      return {
        conteudo_processado: conteudoProcessado,
        variaveis_utilizadas: [...new Set(variaveisUtilizadas)],
        variaveis_faltantes: [...new Set(variaveisFaltantes)]
      };
    } catch (error) {
      console.error('Erro no serviço ao processar template:', error);
      throw error;
    }
  }

  async processarTemplateComVariaveisDoSistema(
    templateId: string,
    systemVariables: Partial<SystemVariables>,
    customVariables: TemplateVariable[] = []
  ): Promise<ProcessedTemplate> {
    try {
      // Converter variáveis do sistema para o formato padrão
      const systemVars: TemplateVariable[] = Object.entries(systemVariables)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => ({
          nome: key,
          valor: String(value),
          tipo: this.inferirTipoVariavel(key, String(value))
        }));

      // Combinar variáveis do sistema com personalizadas
      const todasVariaveis = [...systemVars, ...customVariables];

      return await this.processarTemplate({
        template_id: templateId,
        variaveis: todasVariaveis
      });
    } catch (error) {
      console.error('Erro no serviço ao processar template com variáveis do sistema:', error);
      throw error;
    }
  }

  private validarDadosTemplate(templateData: CreateTemplateRequest): void {
    if (!templateData.nome || templateData.nome.trim().length === 0) {
      throw new Error('Nome do template é obrigatório');
    }

    if (!templateData.conteudo || templateData.conteudo.trim().length === 0) {
      throw new Error('Conteúdo do template é obrigatório');
    }

    if (templateData.nome.length > 100) {
      throw new Error('Nome do template deve ter no máximo 100 caracteres');
    }

    if (templateData.conteudo.length > 4000) {
      throw new Error('Conteúdo do template deve ter no máximo 4000 caracteres');
    }
  }

  private extrairVariaveis(conteudo: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variaveis: string[] = [];
    let match;

    while ((match = regex.exec(conteudo)) !== null) {
      const nomeVariavel = match[1].trim();
      if (!variaveis.includes(nomeVariavel)) {
        variaveis.push(nomeVariavel);
      }
    }

    return variaveis;
  }

  private formatarValorVariavel(valor: string, tipo: VariableType): string {
    switch (tipo) {
      case VariableType.MOEDA:
        const numero = parseFloat(valor);
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numero);

      case VariableType.DATA:
        const data = new Date(valor);
        return data.toLocaleDateString('pt-BR');

      case VariableType.TELEFONE:
        // Formatar telefone brasileiro
        const telefone = valor.replace(/\D/g, '');
        if (telefone.length === 11) {
          return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
        } else if (telefone.length === 10) {
          return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
        }
        return valor;

      case VariableType.NUMERO:
        const num = parseFloat(valor);
        return new Intl.NumberFormat('pt-BR').format(num);

      default:
        return valor;
    }
  }

  private inferirTipoVariavel(nome: string, valor: string): VariableType {
    const nomeLower = nome.toLowerCase();

    if (nomeLower.includes('valor') || nomeLower.includes('preco') || nomeLower.includes('total')) {
      return VariableType.MOEDA;
    }

    if (nomeLower.includes('data') || nomeLower.includes('prazo')) {
      return VariableType.DATA;
    }

    if (nomeLower.includes('telefone') || nomeLower.includes('celular')) {
      return VariableType.TELEFONE;
    }

    if (nomeLower.includes('email')) {
      return VariableType.EMAIL;
    }

    if (!isNaN(Number(valor))) {
      return VariableType.NUMERO;
    }

    return VariableType.TEXTO;
  }
}