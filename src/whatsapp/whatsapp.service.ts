import axios, { type AxiosResponse } from 'axios';
import type {
  WhatsAppWebhookRequest,
  WhatsAppMessage,
  ProcessedWhatsAppMessage,
  SendWhatsAppMessageRequest,
  SendWhatsAppMessageResponse,
  WhatsAppConfig,
  WhatsAppError,
  WhatsAppMessageType
} from './whatsapp.types.js';
import { ConversaService } from '../conversas/conversa.service.js';
import { MensagemService } from '../mensagens/mensagem.service.js';
import { AgenteService } from '../agentes/agente.service.js';
import type { CreateConversaRequest } from '../conversas/conversa.types.js';
import type { CreateMensagemRequest } from '../mensagens/mensagem.types.js';

export class WhatsAppService {
  private config: WhatsAppConfig;
  private conversaService: ConversaService;
  private mensagemService: MensagemService;
  private agenteService: AgenteService;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      appId: process.env.WHATSAPP_APP_ID || '',
      appSecret: process.env.WHATSAPP_APP_SECRET || '',
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
      baseUrl: process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com'
    };

    this.conversaService = new ConversaService();
    this.mensagemService = new MensagemService();
    this.agenteService = new AgenteService();
  }

  // Verificação do webhook
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  // Processar webhook recebido
  async processWebhook(webhookData: WhatsAppWebhookRequest): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const { messages, statuses, contacts } = change.value;

            // Processar mensagens recebidas
            if (messages) {
              for (const message of messages) {
                await this.processIncomingMessage(message, contacts);
              }
            }

            // Processar status de mensagens enviadas
            if (statuses) {
              for (const status of statuses) {
                await this.processMessageStatus(status);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhook do WhatsApp:', error);
      throw error;
    }
  }

  // Processar mensagem recebida
  private async processIncomingMessage(
    message: WhatsAppMessage, 
    contacts?: Array<{ profile: { name: string }; wa_id: string }>
  ): Promise<void> {
    try {
      const processedMessage = this.parseWhatsAppMessage(message, contacts);
      
      // Buscar ou criar conversa
      let conversa = await this.conversaService.findByWhatsAppNumber(processedMessage.from);
      
      if (!conversa) {
        // Criar nova conversa
        const createConversaRequest: CreateConversaRequest = {
          clienteId: null, // Será preenchido posteriormente se cliente for identificado
          canal: 'whatsapp',
          assunto: 'Nova conversa WhatsApp',
          prioridade: 'media',
          status: 'aberta',
          whatsappNumero: processedMessage.from,
          whatsappNome: processedMessage.contactName || processedMessage.from
        };

        conversa = await this.conversaService.create(createConversaRequest);

        // Tentar atribuição automática de agente
        try {
          await this.agenteService.atribuicaoAutomatica(conversa.id);
        } catch (error) {
          console.warn('Não foi possível atribuir agente automaticamente:', error);
        }
      }

      // Criar mensagem
      const createMensagemRequest: CreateMensagemRequest = {
        conversaId: conversa.id,
        conteudo: processedMessage.content,
        tipo: this.mapWhatsAppMessageType(processedMessage.type),
        remetente: 'cliente',
        whatsappMessageId: processedMessage.whatsappMessageId,
        anexoUrl: processedMessage.mediaUrl,
        anexoTipo: processedMessage.mediaType,
        anexoNome: processedMessage.fileName,
        metadados: {
          whatsapp: {
            from: processedMessage.from,
            to: processedMessage.to,
            timestamp: processedMessage.timestamp,
            contextMessageId: processedMessage.contextMessageId,
            interactiveData: processedMessage.interactiveData,
            locationData: processedMessage.locationData,
            contactsData: processedMessage.contactsData
          }
        }
      };

      await this.mensagemService.create(createMensagemRequest);

      // Atualizar última atividade da conversa
      await this.conversaService.updateUltimaAtividade(conversa.id);

    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
      throw error;
    }
  }

  // Processar status de mensagem
  private async processMessageStatus(status: any): Promise<void> {
    try {
      // Buscar mensagem pelo WhatsApp message ID
      const mensagem = await this.mensagemService.findByWhatsAppMessageId(status.id);
      
      if (mensagem) {
        // Atualizar status da mensagem
        await this.mensagemService.updateStatus(mensagem.id, status.status);
      }
    } catch (error) {
      console.error('Erro ao processar status de mensagem:', error);
    }
  }

  // Enviar mensagem via WhatsApp
  async sendMessage(
    to: string, 
    content: string, 
    type: WhatsAppMessageType = 'text',
    additionalData?: any
  ): Promise<SendWhatsAppMessageResponse> {
    try {
      const messageRequest: SendWhatsAppMessageRequest = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: type
      };

      // Configurar conteúdo baseado no tipo
      switch (type) {
        case 'text':
          messageRequest.text = {
            preview_url: true,
            body: content
          };
          break;
        
        case 'image':
          messageRequest.image = {
            link: additionalData?.mediaUrl,
            caption: content
          };
          break;
        
        case 'audio':
          messageRequest.audio = {
            link: additionalData?.mediaUrl
          };
          break;
        
        case 'video':
          messageRequest.video = {
            link: additionalData?.mediaUrl,
            caption: content
          };
          break;
        
        case 'document':
          messageRequest.document = {
            link: additionalData?.mediaUrl,
            caption: content,
            filename: additionalData?.fileName
          };
          break;
        
        case 'location':
          messageRequest.location = additionalData?.location;
          break;
        
        case 'interactive':
          messageRequest.interactive = additionalData?.interactive;
          break;
        
        case 'contacts':
          messageRequest.contacts = additionalData?.contacts;
          break;
      }

      const response: AxiosResponse<SendWhatsAppMessageResponse> = await axios.post(
        `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`,
        messageRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      if (axios.isAxiosError(error) && error.response) {
        const whatsappError = error.response.data as WhatsAppError;
        throw new Error(`WhatsApp API Error: ${whatsappError.error.message}`);
      }
      throw error;
    }
  }

  // Enviar mensagem de template
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components?: any[]
  ): Promise<SendWhatsAppMessageResponse> {
    try {
      const messageRequest: SendWhatsAppMessageRequest = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      };

      const response: AxiosResponse<SendWhatsAppMessageResponse> = await axios.post(
        `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`,
        messageRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      throw error;
    }
  }

  // Baixar mídia do WhatsApp
  async downloadMedia(mediaId: string): Promise<Buffer> {
    try {
      // Primeiro, obter URL da mídia
      const mediaInfoResponse = await axios.get(
        `${this.config.baseUrl}/${this.config.apiVersion}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      const mediaUrl = mediaInfoResponse.data.url;

      // Baixar a mídia
      const mediaResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        },
        responseType: 'arraybuffer'
      });

      return Buffer.from(mediaResponse.data);
    } catch (error) {
      console.error('Erro ao baixar mídia do WhatsApp:', error);
      throw error;
    }
  }

  // Parsear mensagem do WhatsApp
  private parseWhatsAppMessage(
    message: WhatsAppMessage, 
    contacts?: Array<{ profile: { name: string }; wa_id: string }>
  ): ProcessedWhatsAppMessage {
    const contact = contacts?.find(c => c.wa_id === message.from);
    
    let content = '';
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    let fileName: string | undefined;

    switch (message.type) {
      case 'text':
        content = message.text?.body || '';
        break;
      
      case 'image':
        content = message.image?.caption || 'Imagem enviada';
        mediaUrl = message.image?.id;
        mediaType = message.image?.mime_type;
        break;
      
      case 'audio':
        content = 'Áudio enviado';
        mediaUrl = message.audio?.id;
        mediaType = message.audio?.mime_type;
        break;
      
      case 'video':
        content = message.video?.caption || 'Vídeo enviado';
        mediaUrl = message.video?.id;
        mediaType = message.video?.mime_type;
        break;
      
      case 'document':
        content = message.document?.caption || 'Documento enviado';
        mediaUrl = message.document?.id;
        mediaType = message.document?.mime_type;
        fileName = message.document?.filename;
        break;
      
      case 'location':
        content = `Localização: ${message.location?.name || 'Localização compartilhada'}`;
        break;
      
      case 'contacts':
        content = `Contato compartilhado: ${message.contacts?.[0]?.name?.formatted_name || 'Contato'}`;
        break;
      
      case 'interactive':
        if (message.interactive?.button_reply) {
          content = `Botão selecionado: ${message.interactive.button_reply.title}`;
        } else if (message.interactive?.list_reply) {
          content = `Lista selecionada: ${message.interactive.list_reply.title}`;
        } else {
          content = 'Interação recebida';
        }
        break;
      
      default:
        content = 'Mensagem não suportada';
    }

    return {
      whatsappMessageId: message.id,
      from: message.from,
      to: this.config.phoneNumberId,
      type: message.type,
      content,
      mediaUrl,
      mediaType,
      fileName,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      contactName: contact?.profile?.name,
      contextMessageId: message.context?.id,
      interactiveData: message.interactive,
      locationData: message.location,
      contactsData: message.contacts
    };
  }

  // Mapear tipo de mensagem WhatsApp para tipo interno
  private mapWhatsAppMessageType(whatsappType: WhatsAppMessageType): string {
    const typeMap: Record<WhatsAppMessageType, string> = {
      'text': 'texto',
      'image': 'imagem',
      'audio': 'audio',
      'video': 'video',
      'document': 'documento',
      'location': 'localizacao',
      'contacts': 'contato',
      'interactive': 'interativo',
      'button': 'botao',
      'order': 'pedido',
      'system': 'sistema'
    };

    return typeMap[whatsappType] || 'texto';
  }

  // Validar configuração
  validateConfig(): boolean {
    const requiredFields = [
      'accessToken',
      'phoneNumberId',
      'webhookVerifyToken'
    ];

    return requiredFields.every(field => 
      this.config[field as keyof WhatsAppConfig] && 
      this.config[field as keyof WhatsAppConfig] !== ''
    );
  }

  // Obter informações do perfil do negócio
  async getBusinessProfile(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao obter perfil do negócio:', error);
      throw error;
    }
  }
}