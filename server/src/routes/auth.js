import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { wrap } from '../middleware/wrap.js';

const router = Router();
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Add your name, an email and a password of at least 6 characters' });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ error: 'That email is already registered. Try signing in.' });
  }
  const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: pub(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Email or password is incorrect' });
  }
  if (user.banned) return res.status(403).json({ error: 'This account has been suspended' });
  res.json({ token: signToken(user), user: pub(user) });
}));

router.get('/me', requireAuth, wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user: pub(user) });
}));

export default router;
