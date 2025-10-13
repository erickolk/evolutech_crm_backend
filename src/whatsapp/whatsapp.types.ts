// Tipos para integração com WhatsApp Business API

export interface WhatsAppWebhookEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;
  context?: WhatsAppContext;
  text?: WhatsAppText;
  image?: WhatsAppMedia;
  audio?: WhatsAppMedia;
  video?: WhatsAppMedia;
  document?: WhatsAppMedia;
  location?: WhatsAppLocation;
  contacts?: WhatsAppContactMessage[];
  interactive?: WhatsAppInteractive;
}

export interface WhatsAppContext {
  from: string;
  id: string;
}

export interface WhatsAppText {
  body: string;
}

export interface WhatsAppMedia {
  caption?: string;
  filename?: string;
  sha256?: string;
  id: string;
  mime_type: string;
}

export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppContactMessage {
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: string;
  }>;
  birthday?: string;
  emails?: Array<{
    email?: string;
    type?: string;
  }>;
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
  phones?: Array<{
    phone?: string;
    wa_id?: string;
    type?: string;
  }>;
  urls?: Array<{
    url?: string;
    type?: string;
  }>;
}

export interface WhatsAppInteractive {
  type: string;
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: WhatsAppMessageStatus;
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export type WhatsAppMessageType = 
  | 'text' 
  | 'image' 
  | 'audio' 
  | 'video' 
  | 'document' 
  | 'location' 
  | 'contacts' 
  | 'interactive'
  | 'button'
  | 'order'
  | 'system';

export type WhatsAppMessageStatus = 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

// Tipos para envio de mensagens
export interface SendWhatsAppMessageRequest {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: WhatsAppMessageType;
  text?: {
    preview_url?: boolean;
    body: string;
  };
  image?: {
    id?: string;
    link?: string;
    caption?: string;
  };
  audio?: {
    id?: string;
    link?: string;
  };
  video?: {
    id?: string;
    link?: string;
    caption?: string;
  };
  document?: {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
  };
  location?: {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
  };
  contacts?: WhatsAppContactMessage[];
  interactive?: {
    type: string;
    header?: {
      type: string;
      text?: string;
      video?: WhatsAppMedia;
      image?: WhatsAppMedia;
      document?: WhatsAppMedia;
    };
    body?: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: string;
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title?: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
      button?: string;
      sections?: Array<{
        title?: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters?: Array<{
        type: string;
        text?: string;
        image?: WhatsAppMedia;
        document?: WhatsAppMedia;
        video?: WhatsAppMedia;
      }>;
    }>;
  };
}

export interface SendWhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

// Configurações do WhatsApp
export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken: string;
  businessAccountId: string;
  appId: string;
  appSecret: string;
  apiVersion: string;
  baseUrl: string;
}

// Tipos para processamento interno
export interface ProcessedWhatsAppMessage {
  whatsappMessageId: string;
  from: string;
  to: string;
  type: WhatsAppMessageType;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  timestamp: Date;
  contactName?: string;
  contextMessageId?: string;
  interactiveData?: any;
  locationData?: WhatsAppLocation;
  contactsData?: WhatsAppContactMessage[];
}

export interface WhatsAppWebhookRequest {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}