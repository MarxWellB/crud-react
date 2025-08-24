import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Registro (opcional para pruebas)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ id: user._id, email: user.email });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { sub: u._id, email: u.email, role: u.role },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '1d' }
  );

  res.json({ token });
});

export default router;
