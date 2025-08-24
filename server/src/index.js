// server/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
const allowed = [
  "http://localhost:5173",                 // dev local
  "https://TU-APP-VERCEL.vercel.app"       // prod 
];

const app = express();

app.use(cors({
  origin: allowed,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

dotenv.config();


app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Arranque del servidor después de conectar a Mongo
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });
