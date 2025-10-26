# EvolutechCRM Backend

## Overview
This is a comprehensive CRM (Customer Relationship Management) backend API built with Node.js, TypeScript, and Express.js. The system manages customers, devices, service orders, inventory, payments, and includes WhatsApp integration for customer communication.

**Current State**: Fully functional backend API running on port 5000

## Recent Changes
- **2024-10-26**: Swagger API Documentation
  - Installed and configured Swagger UI (swagger-ui-express, swagger-jsdoc)
  - Created comprehensive documentation for 150+ endpoints across 17 modules
  - Swagger UI available at `/api-docs` with interactive testing capabilities
  - Created user guides: DOCUMENTACAO_SWAGGER.md and STATUS_SWAGGER.md
  - Added schemas for all main entities in swagger.config.ts
- **2024-10-24**: Initial Replit environment setup
  - Configured environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET)
  - Updated server to bind to 0.0.0.0:5000 for Replit environment
  - Set up workflow to run the development server
  - Added .env.example file for environment variable documentation

## Project Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Package Manager**: npm

### Directory Structure
```
src/
├── agentes/          # Customer service agents management
├── auth/             # Authentication and authorization
├── clientes/         # Customer management
├── comunicacao/      # Communication system
├── config/           # Application configuration (Swagger, etc.)
├── conversas/        # Conversations/chat management
├── dispositivos/     # Device management
├── estoque/          # Inventory/stock management
├── etiquetas/        # Tags/labels system
├── fornecedores/     # Suppliers management
├── lib/              # Shared libraries (Supabase client)
├── mensagens/        # Messages management
├── middleware/       # Express middlewares
├── orcamentos/       # Quotes/estimates management
├── ordensDeServico/  # Service orders management
├── pagamentos/       # Payments management
├── produtos/         # Products management
├── roles/            # User roles and permissions
├── swagger/          # Swagger/OpenAPI documentation files
├── templates/        # Message templates
├── usuarios/         # Users management
├── whatsapp/         # WhatsApp Business API integration
├── index.ts          # Application entry point
└── routes.ts         # API routes definition

docs/
├── DOCUMENTACAO_SWAGGER.md           # Complete Swagger usage guide
├── STATUS_SWAGGER.md                 # Swagger implementation status
├── GUIA_RAPIDO_INTEGRACAO.md        # Quick integration guide
├── INTEGRACAO_FRONTEND_BACKEND_ATUALIZADO.md
└── EXEMPLOS_REQUISICOES_RESPOSTAS_ATUALIZADO.md
```

### Key Features
1. **Customer Management**: Complete CRUD for customers with personal and business information
2. **Device Tracking**: Register and track customer devices (smartphones, tablets, etc.)
3. **Service Orders**: Full workflow from reception to delivery with status tracking
4. **Inventory Management**: Product catalog, stock control, and movement tracking
5. **Quotes & Pricing**: Multi-version quotes with item-level approval
6. **Payment Processing**: Support for multiple payment methods and installments
7. **Customer Service**: Conversation tracking, agent assignment, and message management
8. **WhatsApp Integration**: Send/receive messages, interactive buttons, media, and templates
9. **Templates System**: Reusable message templates with variable substitution
10. **Authentication**: JWT-based auth with role-based permissions

### API Endpoints
Base URL: `http://0.0.0.0:5000/api`

Main route groups:
- `/auth/*` - Authentication (login, logout, token refresh, password reset)
- `/clientes/*` - Customers management
- `/dispositivos/*` - Devices management
- `/ordensDeServico/*` - Service orders
- `/fornecedores/*` - Suppliers
- `/produtos/*` - Products and inventory
- `/orcamentos/*` - Quotes and quote items
- `/estoque/*` - Stock movements and control
- `/pagamentos/*` - Payments and installments
- `/conversas/*` - Conversations
- `/mensagens/*` - Messages
- `/agentes/*` - Customer service agents
- `/etiquetas/*` - Tags/labels
- `/whatsapp/*` - WhatsApp Business API
- `/templates/*` - Message templates
- `/comunicacao/*` - Communication system with AI integration

### API Documentation
- **Swagger UI**: Interactive API documentation at `/api-docs`
  - Test endpoints directly in the browser
  - View request/response schemas
  - JWT authentication support
  - Export OpenAPI specification
- **Documentation Files**:
  - `docs/DOCUMENTACAO_SWAGGER.md` - Complete usage guide
  - `docs/STATUS_SWAGGER.md` - Implementation status and coverage
  - `docs/GUIA_RAPIDO_INTEGRACAO.md` - Quick integration guide

## Environment Configuration

### Required Environment Variables
```
SUPABASE_URL           # Supabase project URL
SUPABASE_ANON_KEY      # Supabase anonymous key
JWT_SECRET             # Secret for JWT token signing
```

### Optional Environment Variables
```
JWT_EXPIRES_IN         # JWT token expiration (default: 24h)
REFRESH_TOKEN_EXPIRES_IN # Refresh token expiration (default: 7d)
MAX_LOGIN_ATTEMPTS     # Max failed login attempts (default: 5)
LOCKOUT_DURATION       # Account lockout duration in minutes (default: 30)
PASSWORD_RESET_EXPIRES # Password reset token expiration (default: 60)
BCRYPT_SALT_ROUNDS     # Bcrypt hashing rounds (default: 10)

# WhatsApp Business API (optional)
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_APP_ID
WHATSAPP_APP_SECRET
WHATSAPP_API_VERSION
WHATSAPP_BASE_URL

# Server
PORT                   # Server port (default: 5000)
NODE_ENV              # Environment (development/production)
```

## Development

### Running the Server
The server runs automatically via the configured workflow:
```bash
npm run dev
```

This uses `tsx watch` to run TypeScript files with hot-reload during development.

### Database
The application uses Supabase as the PostgreSQL database backend. Database operations are handled through the Supabase client initialized in `src/lib/supabaseClient.ts`.

SQL schema files are available in the `sql/` directory for reference.

## Deployment
The application is configured to run on Replit and can be deployed using Replit's deployment features. The server binds to `0.0.0.0:5000` to be accessible in the cloud environment.

## Notes
- All API routes are prefixed with `/api`
- The server uses CORS middleware to allow cross-origin requests
- Authentication middleware is available but commented out in routes (can be enabled per route as needed)
- TypeScript compilation uses NodeNext module resolution for ESM compatibility
