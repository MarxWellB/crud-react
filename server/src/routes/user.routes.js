import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

router.post('/', async (req, res) => {
  const { name, email, password = 'Temp123!' } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email in use' });
  const bcrypt = (await import('bcryptjs')).default;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ id: user._id, name: user.name, email: user.email });
});

router.put('/:id', async (req, res) => {
  const { name, role } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { name, role },
    { new: true }
  ).select('-passwordHash');
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await User.findByIdAndDelete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
