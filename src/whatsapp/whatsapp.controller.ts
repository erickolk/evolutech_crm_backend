import { type Request, type Response } from 'express';
import { WhatsAppService } from './whatsapp.service.js';
import type { 
  WhatsAppWebhookRequest,
  SendWhatsAppMessageRequest,
  WhatsAppMessageType
} from './whatsapp.types.js';

export class WhatsAppController {
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  // Verificação do webhook (GET)
  verifyWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      const verificationResult = this.whatsappService.verifyWebhook(mode, token, challenge);

      if (verificationResult) {
        res.status(200).send(verificationResult);
      } else {
        res.status(403).json({
          success: false,
          message: 'Token de verificação inválido'
        });
      }
    } catch (error) {
      console.error('Erro na verificação do webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Receber webhook (POST)
  receiveWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const webhookData: WhatsAppWebhookRequest = req.body;

      // Validar estrutura básica do webhook
      if (!webhookData.object || webhookData.object !== 'whatsapp_business_account') {
        res.status(400).json({
          success: false,
          message: 'Webhook inválido'
        });
        return;
      }

      // Processar webhook de forma assíncrona
      this.whatsappService.processWebhook(webhookData).catch(error => {
        console.error('Erro ao processar webhook:', error);
      });

      // Responder imediatamente para o WhatsApp
      res.status(200).json({
        success: true,
        message: 'Webhook recebido'
      });
    } catch (error) {
      console.error('Erro ao receber webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar mensagem de texto
  sendTextMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        res.status(400).json({
          success: false,
          message: 'Número de destino e mensagem são obrigatórios'
        });
        return;
      }

      const result = await this.whatsappService.sendMessage(to, message, 'text');

      res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar mensagem com mídia
  sendMediaMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, type, mediaUrl, caption, fileName } = req.body;

      if (!to || !type || !mediaUrl) {
        res.status(400).json({
          success: false,
          message: 'Número de destino, tipo e URL da mídia são obrigatórios'
        });
        return;
      }

      const validTypes: WhatsAppMessageType[] = ['image', 'audio', 'video', 'document'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de mídia inválido'
        });
        return;
      }

      const additionalData = {
        mediaUrl,
        fileName: type === 'document' ? fileName : undefined
      };

      const result = await this.whatsappService.sendMessage(
        to, 
        caption || '', 
        type, 
        additionalData
      );

      res.status(200).json({
        success: true,
        message: 'Mensagem de mídia enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem de mídia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem de mídia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar localização
  sendLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, latitude, longitude, name, address } = req.body;

      if (!to || !latitude || !longitude) {
        res.status(400).json({
          success: false,
          message: 'Número de destino, latitude e longitude são obrigatórios'
        });
        return;
      }

      const additionalData = {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          name,
          address
        }
      };

      const result = await this.whatsappService.sendMessage(
        to, 
        '', 
        'location', 
        additionalData
      );

      res.status(200).json({
        success: true,
        message: 'Localização enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar localização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar localização',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar mensagem interativa (botões)
  sendInteractiveButtons = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, bodyText, buttons, headerText, footerText } = req.body;

      if (!to || !bodyText || !buttons || !Array.isArray(buttons)) {
        res.status(400).json({
          success: false,
          message: 'Número de destino, texto do corpo e botões são obrigatórios'
        });
        return;
      }

      if (buttons.length > 3) {
        res.status(400).json({
          success: false,
          message: 'Máximo de 3 botões permitidos'
        });
        return;
      }

      const interactive = {
        type: 'button',
        header: headerText ? {
          type: 'text',
          text: headerText
        } : undefined,
        body: {
          text: bodyText
        },
        footer: footerText ? {
          text: footerText
        } : undefined,
        action: {
          buttons: buttons.map((button: any, index: number) => ({
            type: 'reply',
            reply: {
              id: button.id || `btn_${index}`,
              title: button.title
            }
          }))
        }
      };

      const result = await this.whatsappService.sendMessage(
        to, 
        '', 
        'interactive', 
        { interactive }
      );

      res.status(200).json({
        success: true,
        message: 'Mensagem interativa enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem interativa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem interativa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar lista interativa
  sendInteractiveList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, bodyText, buttonText, sections, headerText, footerText } = req.body;

      if (!to || !bodyText || !buttonText || !sections || !Array.isArray(sections)) {
        res.status(400).json({
          success: false,
          message: 'Número de destino, texto do corpo, texto do botão e seções são obrigatórios'
        });
        return;
      }

      const interactive = {
        type: 'list',
        header: headerText ? {
          type: 'text',
          text: headerText
        } : undefined,
        body: {
          text: bodyText
        },
        footer: footerText ? {
          text: footerText
        } : undefined,
        action: {
          button: buttonText,
          sections: sections.map((section: any) => ({
            title: section.title,
            rows: section.rows.map((row: any) => ({
              id: row.id,
              title: row.title,
              description: row.description
            }))
          }))
        }
      };

      const result = await this.whatsappService.sendMessage(
        to, 
        '', 
        'interactive', 
        { interactive }
      );

      res.status(200).json({
        success: true,
        message: 'Lista interativa enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar lista interativa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar lista interativa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Enviar template
  sendTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, templateName, languageCode, components } = req.body;

      if (!to || !templateName) {
        res.status(400).json({
          success: false,
          message: 'Número de destino e nome do template são obrigatórios'
        });
        return;
      }

      const result = await this.whatsappService.sendTemplate(
        to, 
        templateName, 
        languageCode || 'pt_BR', 
        components
      );

      res.status(200).json({
        success: true,
        message: 'Template enviado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao enviar template:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar template',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Baixar mídia
  downloadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mediaId } = req.params;

      if (!mediaId) {
        res.status(400).json({
          success: false,
          message: 'ID da mídia é obrigatório'
        });
        return;
      }

      const mediaBuffer = await this.whatsappService.downloadMedia(mediaId);

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="media_${mediaId}"`
      });

      res.send(mediaBuffer);
    } catch (error) {
      console.error('Erro ao baixar mídia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao baixar mídia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Obter perfil do negócio
  getBusinessProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this.whatsappService.getBusinessProfile();

      res.status(200).json({
        success: true,
        message: 'Perfil do negócio obtido com sucesso',
        data: profile
      });
    } catch (error) {
      console.error('Erro ao obter perfil do negócio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter perfil do negócio',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // Verificar configuração
  checkConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const isValid = this.whatsappService.validateConfig();

      res.status(200).json({
        success: true,
        message: 'Configuração verificada',
        data: {
          isValid,
          message: isValid ? 'Configuração válida' : 'Configuração incompleta'
        }
      });
    } catch (error) {
      console.error('Erro ao verificar configuração:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
}