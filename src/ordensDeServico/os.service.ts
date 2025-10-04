import { OsRepository } from './os.repository.js';
import { type OrdemDeServico } from './os.types.js';

export class OsService {
    // O Service tem uma instância do Repository para poder pedir dados a ele.
    private repository = new OsRepository();

    /**
     * Busca todas as Ordens de Serviço.
     * Futuramente, regras de negócio podem ser adicionadas aqui.
     */
    async findAll() {
        const ordensDeServico = await this.repository.findAll();

        // EXEMPLO DE LÓGICA DE NEGÓCIO FUTURA QUE VIVERIA AQUI:
        // if (ordensDeServico.length === 0) {
        //   // Poderíamos decidir lançar um erro customizado ou retornar um valor padrão.
        //   throw new Error("Nenhuma Ordem de Serviço ativa foi encontrada.");
        // }

        return ordensDeServico;
    }

    async create(osData: OrdemDeServico) {
        // LÓGICA DE NEGÓCIO: Uma OS precisa, no mínimo, de um cliente e um dispositivo.
        if (!osData.cliente_id || !osData.dispositivo_id) {
            throw new Error('Cliente e Dispositivo são obrigatórios para criar uma OS.');
        }

        // Podemos definir valores padrão aqui se eles não forem fornecidos
        const osParaCriar = {
            ...osData,
            status_fluxo: osData.status_fluxo || 'Em Análise', // Valor padrão
            prioridade: osData.prioridade || 'Normal' // Valor padrão
        };

        return this.repository.create(osParaCriar);
    }
    async update(id: string, osData: Partial<OrdemDeServico>) {
    // REGRA DE NEGÓCIO: Não permitir alterar o cliente ou o dispositivo de uma OS já criada.
    if (osData.cliente_id || osData.dispositivo_id) {
      throw new Error('Não é permitido alterar o cliente ou o dispositivo de uma OS.');
    }
    return this.repository.update(id, osData);
  }

  async softDelete(id: string) {
    // Lógica futura: verificar se a OS já não está finalizada/cancelada antes de deletar.
    return this.repository.softDelete(id);
  }
}