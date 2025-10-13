import { supabase } from '../lib/supabaseClient.js';
import type { 
  MessageTemplate, 
  CreateTemplateRequest, 
  UpdateTemplateRequest,
  TemplateFilters,
  TemplateResponse
} from './template.types.js';

export class TemplateRepository {
  private readonly tableName = 'MessageTemplates';

  async create(templateData: CreateTemplateRequest, userId: string): Promise<MessageTemplate> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...templateData,
          created_by: userId,
          ativo: templateData.ativo ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar template:', error);
        throw new Error(`Erro ao criar template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao criar template:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<MessageTemplate | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erro ao buscar template por ID:', error);
        throw new Error(`Erro ao buscar template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao buscar template por ID:', error);
      throw error;
    }
  }

  async findAll(
    filters: TemplateFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<TemplateResponse> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      if (filters.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,conteudo.ilike.%${filters.search}%`);
      }

      // Aplicar paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .range(from, to)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar templates:', error);
        throw new Error(`Erro ao buscar templates: ${error.message}`);
      }

      return {
        templates: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Erro no repositório ao buscar templates:', error);
      throw error;
    }
  }

  async update(id: string, updateData: UpdateTemplateRequest): Promise<MessageTemplate> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar template:', error);
        throw new Error(`Erro ao atualizar template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao atualizar template:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar template:', error);
        throw new Error(`Erro ao deletar template: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no repositório ao deletar template:', error);
      throw error;
    }
  }

  async findByCategory(categoria: string): Promise<MessageTemplate[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar templates por categoria:', error);
        throw new Error(`Erro ao buscar templates por categoria: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no repositório ao buscar templates por categoria:', error);
      throw error;
    }
  }

  async toggleActive(id: string): Promise<MessageTemplate> {
    try {
      // Primeiro buscar o template atual
      const template = await this.findById(id);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Inverter o status ativo
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ativo: !template.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status do template:', error);
        throw new Error(`Erro ao alterar status do template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no repositório ao alterar status do template:', error);
      throw error;
    }
  }
}