import express from 'express';
import cors from 'cors';
import router from './routes.js'; // <-- 1. IMPORTAR O ROTEADOR

const app = express();
const PORT = 3008;

app.use(cors());
app.use(express.json());

// Usando o roteador com um prefixo opcional para a API
app.use('/api', router); // <-- 2. USAR O ROTEADOR

// Rota raiz para teste
app.get('/', (req, res) => {
  res.send('API do CRM está no ar!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});