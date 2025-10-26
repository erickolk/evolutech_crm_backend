import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM EvoluTech API',
      version: '1.0.0',
      description: `
# CRM EvoluTech - API Documentation

API completa para gerenciamento de CRM com funcionalidades de:
- Gestão de Clientes e Dispositivos
- Ordens de Serviço e Orçamentos
- Controle de Estoque e Produtos
- Gestão de Pagamentos
- Sistema de Atendimento (Conversas, Mensagens, Agentes)
- Integração com WhatsApp
- Templates e Comunicação

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login através do endpoint \`/api/auth/login\`
2. Utilize o token retornado no header \`Authorization: Bearer {token}\`

## URL Base

\`\`\`
https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api
\`\`\`

## Formato de Resposta

Todas as respostas seguem o padrão:

**Sucesso:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
\`\`\`

**Erro:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro"
  }
}
\`\`\`
      `,
      contact: {
        name: 'EvoluTech',
        email: 'contato@evolutech.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://7e6cd7de-5657-4362-996a-4d9ba7a26996-00-3n5knz0o3bc8c.spock.replit.dev/api',
        description: 'Servidor de Produção (Replit)',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de Desenvolvimento Local',
      },
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de autenticação e gerenciamento de sessão',
      },
      {
        name: 'Clientes',
        description: 'Gerenciamento de clientes (pessoa física e jurídica)',
      },
      {
        name: 'Dispositivos',
        description: 'Gerenciamento de dispositivos dos clientes',
      },
      {
        name: 'Ordens de Serviço',
        description: 'Gestão de ordens de serviço',
      },
      {
        name: 'Fornecedores',
        description: 'Cadastro e gestão de fornecedores',
      },
      {
        name: 'Produtos',
        description: 'Catálogo e controle de produtos',
      },
      {
        name: 'Orçamentos',
        description: 'Criação e gestão de orçamentos',
      },
      {
        name: 'Itens de Orçamento',
        description: 'Gerenciamento de itens dentro dos orçamentos',
      },
      {
        name: 'Estoque',
        description: 'Controle e movimentação de estoque',
      },
      {
        name: 'Pagamentos',
        description: 'Gestão de pagamentos e parcelas',
      },
      {
        name: 'Conversas',
        description: 'Sistema de atendimento - Conversas com clientes',
      },
      {
        name: 'Mensagens',
        description: 'Mensagens dentro das conversas',
      },
      {
        name: 'Agentes',
        description: 'Gestão de agentes de atendimento',
      },
      {
        name: 'Etiquetas',
        description: 'Sistema de etiquetas para organização',
      },
      {
        name: 'WhatsApp',
        description: 'Integração com WhatsApp Business API',
      },
      {
        name: 'Templates',
        description: 'Templates de mensagens e comunicação',
      },
      {
        name: 'Comunicação',
        description: 'Sistema de comunicação integrado',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
                message: {
                  type: 'string',
                  example: 'Descrição do erro',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            },
            nome: {
              type: 'string',
              example: 'João Silva Santos',
            },
            cpf: {
              type: 'string',
              example: '123.456.789-00',
            },
            cnpj: {
              type: 'string',
              nullable: true,
              example: '12.345.678/0001-90',
            },
            whatsapp_id: {
              type: 'string',
              example: '5511999999999',
            },
            cep: {
              type: 'string',
              example: '01234-567',
            },
            endereco: {
              type: 'string',
              example: 'Rua das Flores, 123',
            },
            numero_residencia: {
              type: 'string',
              example: '123',
            },
            bairro: {
              type: 'string',
              example: 'Centro',
            },
            cidade: {
              type: 'string',
              example: 'São Paulo',
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              example: '1985-03-15',
            },
            tipo_cliente: {
              type: 'string',
              enum: ['Pessoa Física', 'Pessoa Jurídica'],
              example: 'Pessoa Física',
            },
            razao_social: {
              type: 'string',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Dispositivo: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            cliente_id: {
              type: 'string',
              format: 'uuid',
            },
            tipo: {
              type: 'string',
              example: 'Smartphone',
            },
            marca: {
              type: 'string',
              example: 'Samsung',
            },
            modelo: {
              type: 'string',
              example: 'Galaxy S21',
            },
            numero_serie: {
              type: 'string',
              example: 'SN123456789',
            },
            imei: {
              type: 'string',
              example: '123456789012345',
            },
            cor: {
              type: 'string',
              example: 'Preto',
            },
            estado_conservacao: {
              type: 'string',
              example: 'Bom',
            },
            acessorios: {
              type: 'string',
              example: 'Carregador, Fone de ouvido',
            },
            observacoes: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        OrdemServico: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            numero_os: {
              type: 'string',
              example: 'OS-2024-001',
            },
            cliente_id: {
              type: 'string',
              format: 'uuid',
            },
            dispositivo_id: {
              type: 'string',
              format: 'uuid',
            },
            descricao_problema: {
              type: 'string',
            },
            descricao_servico: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['Aberta', 'Em Andamento', 'Aguardando Peça', 'Concluída', 'Cancelada'],
            },
            prioridade: {
              type: 'string',
              enum: ['Baixa', 'Média', 'Alta', 'Urgente'],
            },
            data_entrada: {
              type: 'string',
              format: 'date-time',
            },
            data_prevista: {
              type: 'string',
              format: 'date-time',
            },
            data_conclusao: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            valor_servico: {
              type: 'number',
              format: 'float',
            },
            valor_pecas: {
              type: 'number',
              format: 'float',
            },
            valor_total: {
              type: 'number',
              format: 'float',
            },
            tecnico_responsavel: {
              type: 'string',
            },
            observacoes: {
              type: 'string',
            },
          },
        },
        Produto: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nome: {
              type: 'string',
              example: 'Bateria Samsung Galaxy S21',
            },
            descricao: {
              type: 'string',
            },
            categoria: {
              type: 'string',
              example: 'Baterias',
            },
            codigo_barras: {
              type: 'string',
            },
            preco_custo: {
              type: 'number',
              format: 'float',
            },
            preco_venda: {
              type: 'number',
              format: 'float',
            },
            margem_lucro: {
              type: 'number',
              format: 'float',
            },
            fornecedor_id: {
              type: 'string',
              format: 'uuid',
            },
            controla_estoque: {
              type: 'boolean',
            },
            estoque_minimo: {
              type: 'integer',
            },
            estoque_atual: {
              type: 'integer',
            },
            ativo: {
              type: 'boolean',
            },
          },
        },
        Pagamento: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            os_id: {
              type: 'string',
              format: 'uuid',
            },
            valor_total: {
              type: 'number',
              format: 'float',
            },
            metodo_pagamento: {
              type: 'string',
              enum: ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX', 'Transferência', 'Boleto'],
            },
            status: {
              type: 'string',
              enum: ['Pendente', 'Pago', 'Parcialmente Pago', 'Cancelado'],
            },
            numero_parcelas: {
              type: 'integer',
            },
            data_pagamento: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Conversa: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            cliente_id: {
              type: 'string',
              format: 'uuid',
            },
            agente_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['aberta', 'em_atendimento', 'resolvida', 'fechada'],
            },
            prioridade: {
              type: 'string',
              enum: ['baixa', 'media', 'alta', 'urgente'],
            },
            canal: {
              type: 'string',
              enum: ['whatsapp', 'email', 'telefone', 'presencial'],
            },
            assunto: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Fornecedor: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nome: {
              type: 'string',
            },
            cnpj: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            telefone: {
              type: 'string',
            },
            endereco: {
              type: 'string',
            },
            cidade: {
              type: 'string',
            },
            estado: {
              type: 'string',
            },
            ativo: {
              type: 'boolean',
            },
          },
        },
        Orcamento: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            ordem_servico_id: {
              type: 'string',
              format: 'uuid',
            },
            versao: {
              type: 'integer',
            },
            status: {
              type: 'string',
              enum: ['rascunho', 'enviado', 'aprovado', 'rejeitado'],
            },
            valor_total: {
              type: 'number',
              format: 'float',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Mensagem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            conversa_id: {
              type: 'string',
              format: 'uuid',
            },
            conteudo: {
              type: 'string',
            },
            tipo: {
              type: 'string',
              enum: ['texto', 'imagem', 'audio', 'video', 'documento'],
            },
            remetente: {
              type: 'string',
              enum: ['cliente', 'agente', 'sistema'],
            },
            lida: {
              type: 'boolean',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Agente: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nome: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            status: {
              type: 'string',
              enum: ['online', 'offline', 'ocupado', 'ausente'],
            },
            departamento: {
              type: 'string',
            },
            especialidade: {
              type: 'string',
            },
          },
        },
        Etiqueta: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nome: {
              type: 'string',
            },
            cor: {
              type: 'string',
            },
            categoria: {
              type: 'string',
            },
            descricao: {
              type: 'string',
            },
          },
        },
        Template: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            nome: {
              type: 'string',
            },
            conteudo: {
              type: 'string',
            },
            categoria: {
              type: 'string',
            },
            variaveis: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            ativo: {
              type: 'boolean',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
            hasNext: {
              type: 'boolean',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              example: false,
            },
          },
        },
      },
    },
    paths: {},
  },
  apis: ['./src/swagger/*.swagger.ts', './src/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
