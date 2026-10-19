import { Router } from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Report from '../models/Report.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { wrap } from '../middleware/wrap.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/overview', wrap(async (req, res) => {
  const [users, lost, found, returned, reports, recent] = await Promise.all([
    User.countDocuments(),
    Item.countDocuments({ type: 'lost', status: 'open' }),
    Item.countDocuments({ type: 'found', status: 'open' }),
    Item.countDocuments({ status: 'returned' }),
    Report.find({ status: 'open' }).sort({ createdAt: -1 }).populate('item', 'title status type').populate('reporter', 'name'),
    Item.find().sort({ createdAt: -1 }).limit(25).populate('owner', 'name banned'),
  ]);
  res.json({
    stats: { users, lost, found, returned },
    reports,
    recent,
  });
}));

router.patch('/items/:id', wrap(async (req, res) => {
  const status = req.body.status;
  if (!['open', 'removed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  await Item.findByIdAndUpdate(req.params.id, { status });
  res.json({ ok: true });
}));

router.patch('/reports/:id', wrap(async (req, res) => {
  await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
  res.json({ ok: true });
}));

router.patch('/users/:id/ban', wrap(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') return res.status(400).json({ error: 'Cannot change this user' });
  user.banned = Boolean(req.body.banned);
  await user.save();
  res.json({ ok: true });
}));

export default router;
