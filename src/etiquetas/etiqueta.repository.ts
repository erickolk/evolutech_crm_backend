import { supabase } from '../lib/supabaseClient.js';
import type { 
  Etiqueta, 
  CreateEtiquetaRequest, 
  UpdateEtiquetaRequest, 
  EtiquetaFilters,
  EtiquetaResponse,
  EtiquetaStats,
  ConversaEtiqueta,
  MensagemEtiqueta,
  AplicarEtiquetaRequest,
  EtiquetasConversaResponse,
  EtiquetasMensagemResponse
} from './etiqueta.types.js';

export class EtiquetaRepository {
  private readonly tableName = 'etiquetas';
  private readonly conversaEtiquetaTable = 'conversa_etiquetas';
  private readonly mensagemEtiquetaTable = 'mensagem_etiquetas';

  async findAll(filters: EtiquetaFilters = {}): Promise<{ data: EtiquetaResponse[]; total: number }> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_ativas:conversa_etiquetas!etiqueta_id(count),
        mensagens_marcadas:mensagem_etiquetas!etiqueta_id(count)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }

    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters.ativa !== undefined) {
      query = query.eq('ativa', filters.ativa);
    }

    if (filters.uso_automatico !== undefined) {
      query = query.eq('uso_automatico', filters.uso_automatico);
    }

    if (filters.cor) {
      query = query.eq('cor', filters.cor);
    }

    // Ordenação
    const orderBy = filters.orderBy || 'ordem';
    const orderDirection = filters.orderDirection || 'asc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar etiquetas: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0
    };
  }

  async findById(id: string): Promise<EtiquetaResponse | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_ativas:conversa_etiquetas!etiqueta_id(count),
        mensagens_marcadas:mensagem_etiquetas!etiqueta_id(count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar etiqueta: ${error.message}`);
    }

    return data;
  }

  async findByNome(nome: string): Promise<Etiqueta | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('nome', nome)
      .eq('ativa', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar etiqueta por nome: ${error.message}`);
    }

    return data;
  }

  async findByCategoria(categoria: string): Promise<EtiquetaResponse[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        conversas_ativas:conversa_etiquetas!etiqueta_id(count),
        mensagens_marcadas:mensagem_etiquetas!etiqueta_id(count)
      `)
      .eq('categoria', categoria)
      .eq('ativa', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar etiquetas por categoria: ${error.message}`);
    }

    return data || [];
  }

  async findAutomaticas(): Promise<Etiqueta[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('uso_automatico', true)
      .eq('ativa', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar etiquetas automáticas: ${error.message}`);
    }

    return data || [];
  }

  async create(data: CreateEtiquetaRequest): Promise<Etiqueta> {
    // Buscar próxima ordem se não fornecida
    let ordem = data.ordem;
    if (!ordem) {
      const { data: maxOrdem } = await supabase
        .from(this.tableName)
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1)
        .single();
      
      ordem = (maxOrdem?.ordem || 0) + 1;
    }

    const etiquetaData = {
      ...data,
      ordem,
      ativa: true,
      estatisticas: {
        total_usos: 0,
        usos_mes_atual: 0
      }
    };

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(etiquetaData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar etiqueta: ${error.message}`);
    }

    return result;
  }

  async update(id: string, data: UpdateEtiquetaRequest): Promise<Etiqueta> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar etiqueta: ${error.message}`);
    }

    return result;
  }

  async updateOrdem(etiquetas: { id: string; ordem: number }[]): Promise<void> {
    const updates = etiquetas.map(etiqueta => 
      supabase
        .from(this.tableName)
        .update({ 
          ordem: etiqueta.ordem,
          updated_at: new Date().toISOString()
        })
        .eq('id', etiqueta.id)
    );

    const results = await Promise.all(updates);
    
    for (const result of results) {
      if (result.error) {
        throw new Error(`Erro ao atualizar ordem das etiquetas: ${result.error.message}`);
      }
    }
  }

  async incrementarUso(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        estatisticas: supabase.raw(`
          COALESCE(estatisticas, '{}'::jsonb) || 
          jsonb_build_object(
            'total_usos', COALESCE((estatisticas->>'total_usos')::int, 0) + 1,
            'usos_mes_atual', COALESCE((estatisticas->>'usos_mes_atual')::int, 0) + 1,
            'ultima_utilizacao', '${new Date().toISOString()}'
          )
        `),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao incrementar uso da etiqueta: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    // Soft delete - marcar como inativa
    const { error } = await supabase
      .from(this.tableName)
      .update({
        ativa: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir etiqueta: ${error.message}`);
    }
  }

  // Métodos para relacionamentos com conversas
  async aplicarEtiquetaConversa(conversaId: string, etiquetaData: AplicarEtiquetaRequest): Promise<ConversaEtiqueta> {
    const { data: result, error } = await supabase
      .from(this.conversaEtiquetaTable)
      .insert({
        conversa_id: conversaId,
        etiqueta_id: etiquetaData.etiqueta_id,
        aplicada_por: etiquetaData.aplicada_por,
        aplicada_automaticamente: etiquetaData.aplicada_automaticamente || false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao aplicar etiqueta à conversa: ${error.message}`);
    }

    // Incrementar uso da etiqueta
    await this.incrementarUso(etiquetaData.etiqueta_id);

    return result;
  }

  async removerEtiquetaConversa(conversaId: string, etiquetaId: string): Promise<void> {
    const { error } = await supabase
      .from(this.conversaEtiquetaTable)
      .delete()
      .eq('conversa_id', conversaId)
      .eq('etiqueta_id', etiquetaId);

    if (error) {
      throw new Error(`Erro ao remover etiqueta da conversa: ${error.message}`);
    }
  }

  async buscarEtiquetasConversa(conversaId: string): Promise<EtiquetasConversaResponse> {
    const { data, error } = await supabase
      .from(this.conversaEtiquetaTable)
      .select(`
        *,
        etiqueta:etiquetas(id, nome, cor, icone, categoria)
      `)
      .eq('conversa_id', conversaId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar etiquetas da conversa: ${error.message}`);
    }

    return {
      conversa_id: conversaId,
      etiquetas: (data || []).map(item => ({
        id: item.etiqueta.id,
        nome: item.etiqueta.nome,
        cor: item.etiqueta.cor,
        icone: item.etiqueta.icone,
        categoria: item.etiqueta.categoria,
        aplicada_por: item.aplicada_por,
        aplicada_automaticamente: item.aplicada_automaticamente,
        created_at: item.created_at
      }))
    };
  }

  // Métodos para relacionamentos com mensagens
  async aplicarEtiquetaMensagem(mensagemId: string, etiquetaData: AplicarEtiquetaRequest): Promise<MensagemEtiqueta> {
    const { data: result, error } = await supabase
      .from(this.mensagemEtiquetaTable)
      .insert({
        mensagem_id: mensagemId,
        etiqueta_id: etiquetaData.etiqueta_id,
        aplicada_por: etiquetaData.aplicada_por,
        aplicada_automaticamente: etiquetaData.aplicada_automaticamente || false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao aplicar etiqueta à mensagem: ${error.message}`);
    }

    // Incrementar uso da etiqueta
    await this.incrementarUso(etiquetaData.etiqueta_id);

    return result;
  }

  async removerEtiquetaMensagem(mensagemId: string, etiquetaId: string): Promise<void> {
    const { error } = await supabase
      .from(this.mensagemEtiquetaTable)
      .delete()
      .eq('mensagem_id', mensagemId)
      .eq('etiqueta_id', etiquetaId);

    if (error) {
      throw new Error(`Erro ao remover etiqueta da mensagem: ${error.message}`);
    }
  }

  async buscarEtiquetasMensagem(mensagemId: string): Promise<EtiquetasMensagemResponse> {
    const { data, error } = await supabase
      .from(this.mensagemEtiquetaTable)
      .select(`
        *,
        etiqueta:etiquetas(id, nome, cor, icone, categoria)
      `)
      .eq('mensagem_id', mensagemId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar etiquetas da mensagem: ${error.message}`);
    }

    return {
      mensagem_id: mensagemId,
      etiquetas: (data || []).map(item => ({
        id: item.etiqueta.id,
        nome: item.etiqueta.nome,
        cor: item.etiqueta.cor,
        icone: item.etiqueta.icone,
        categoria: item.etiqueta.categoria,
        aplicada_por: item.aplicada_por,
        aplicada_automaticamente: item.aplicada_automaticamente,
        created_at: item.created_at
      }))
    };
  }

  async getStats(): Promise<EtiquetaStats> {
    // Buscar estatísticas gerais
    const { data: etiquetas, error: etiquetasError } = await supabase
      .from(this.tableName)
      .select('categoria, ativa, uso_automatico, estatisticas');

    if (etiquetasError) {
      throw new Error(`Erro ao buscar estatísticas: ${etiquetasError.message}`);
    }

    const stats: EtiquetaStats = {
      total_etiquetas: etiquetas?.length || 0,
      etiquetas_ativas: 0,
      etiquetas_automaticas: 0,
      categorias: [],
      mais_utilizadas: []
    };

    // Contar por categoria e status
    const categoriaCount: { [key: string]: number } = {};
    const maisUtilizadas: { etiqueta_id: string; etiqueta_nome: string; total_usos: number }[] = [];

    etiquetas?.forEach(etiqueta => {
      if (etiqueta.ativa) {
        stats.etiquetas_ativas++;
      }
      
      if (etiqueta.uso_automatico) {
        stats.etiquetas_automaticas++;
      }

      if (etiqueta.categoria) {
        categoriaCount[etiqueta.categoria] = (categoriaCount[etiqueta.categoria] || 0) + 1;
      }

      if (etiqueta.estatisticas?.total_usos) {
        maisUtilizadas.push({
          etiqueta_id: etiqueta.id,
          etiqueta_nome: etiqueta.nome,
          total_usos: etiqueta.estatisticas.total_usos
        });
      }
    });

    // Converter categorias para array
    stats.categorias = Object.entries(categoriaCount).map(([categoria, quantidade]) => ({
      categoria,
      quantidade
    }));

    // Ordenar mais utilizadas
    stats.mais_utilizadas = maisUtilizadas
      .sort((a, b) => b.total_usos - a.total_usos)
      .slice(0, 10);

    return stats;
  }
}