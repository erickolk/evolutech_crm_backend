import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import router from './routes.js';
import { swaggerSpec } from './config/swagger.config.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CRM EvoluTech API Documentation',
}));

// API Routes
app.use('/api', router);

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CRM EvoluTech API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          a {
            display: inline-block;
            margin: 10px 10px 10px 0;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
          a:hover { background: #0056b3; }
          .info { color: #666; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 CRM EvoluTech API</h1>
          <p class="info">API completa para gerenciamento de CRM</p>
          <div>
            <a href="/api-docs" target="_blank">📚 Documentação Swagger</a>
            <a href="/api-docs/swagger.json" target="_blank">📄 Especificação OpenAPI</a>
          </div>
          <div class="info">
            <p><strong>URL Base da API:</strong> /api</p>
            <p><strong>Versão:</strong> 1.0.0</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Swagger JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://0.0.0.0:${PORT}/api-docs`);
});