// Punto de entrada del backend (Express configurado).
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

// ✅ Permitir serializar BigInt en JSON como string
// (haz esto ANTES de usar express)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// monta todas las rutas bajo /api
app.use('/api', routes);

app.get('/', (req, res) => res.send('API OK'));

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
