import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Item, { CATEGORIES } from '../models/Item.js';
import Report from '../models/Report.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { wrap } from '../middleware/wrap.js';
import { findMatches } from '../services/matching.js';
import { findSensitive } from '../services/privacy.js';

const router = Router();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populateOwner = { path: 'owner', select: 'name phone' };

// Reads the token if present, without forcing sign-in.
function viewer(req) {
  try {
    const h = req.headers.authorization || '';
    return h.startsWith('Bearer ') ? jwt.verify(h.slice(7), process.env.JWT_SECRET) : null;
  } catch {
    return null;
  }
}

router.get('/', wrap(async (req, res) => {
  const { q, type, category, from, to } = req.query;
  const filter = { status: 'open' };
  if (type === 'lost' || type === 'found') filter.type = type;
  if (CATEGORIES.includes(category)) filter.category = category;
  if (from || to) {
    filter.eventDate = {};
    if (from) filter.eventDate.$gte = new Date(from);
    if (to) filter.eventDate.$lte = new Date(new Date(to).getTime() + 86400000 - 1);
  }
  if (q?.trim()) {
    const re = new RegExp(escapeRe(q.trim()), 'i');
    filter.$or = [{ title: re }, { description: re }, { 'location.label': re }];
  }
  const items = await Item.find(filter).sort({ eventDate: -1, createdAt: -1 }).limit(200).populate(populateOwner);
  res.json({ items });
}));

router.get('/mine', requireAuth, wrap(async (req, res) => {
  const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json({ items });
}));

router.post('/', requireAuth, upload.single('image'), wrap(async (req, res) => {
  const {
    type,
    title,
    category,
    description,
    custodyNote,
    eventDate,
    locationLabel,
    contactPhone,
    whatsapp,
  } = req.body;

  const defaultLat = Number(process.env.CAMPUS_LAT || 34.33);
  const defaultLng = Number(process.env.CAMPUS_LNG || 73.2);
  const parsedLat = Number(req.body.lat);
  const parsedLng = Number(req.body.lng);
  const lat = Number.isFinite(parsedLat) ? parsedLat : defaultLat;
  const lng = Number.isFinite(parsedLng) ? parsedLng : defaultLng;

  if (!['lost', 'found'].includes(type)) return res.status(400).json({ error: 'Choose whether you lost or found the item' });
  if (!title?.trim() || !description?.trim() || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Add a title, a category and a description' });
  }
  const phone = String(whatsapp || contactPhone || '').trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return res.status(400).json({ error: 'Add a WhatsApp number so people can contact you about this item' });
  }
  if (!eventDate || Number.isNaN(new Date(eventDate).getTime())) return res.status(400).json({ error: 'Add the date' });

  const sensitive = findSensitive(title, description, locationLabel, custodyNote);
  if (sensitive) {
    return res.status(400).json({
      error: `Your listing text seems to include ${sensitive}. Remove it before posting.`,
    });
  }

  const item = new Item({
    type,
    title,
    category,
    description,
    custodyNote: type === 'found' ? custodyNote : undefined,
    contactPhone: contactPhone || whatsapp || undefined,
    whatsapp: whatsapp || contactPhone || undefined,
    eventDate,
    location: { label: locationLabel, lat, lng },
    owner: req.user.id,
  });

  if (req.file) {
    item.imageUrl = `/uploads/${req.file.filename}`;
  }

  await item.save();
  res.status(201).json({ id: item._id });
}));

router.get('/:id', wrap(async (req, res) => {
  const item = await Item.findById(req.params.id).populate(populateOwner);
  if (!item || item.status === 'removed') return res.status(404).json({ error: 'This listing is not available' });
  const v = viewer(req);
  const mine = v && String(item.owner._id) === v.id;
  const out = item.toObject();
  res.json({ item: out, isOwner: Boolean(mine) });
}));

router.get('/:id/matches', requireAuth, wrap(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (String(item.owner) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the poster can see matches' });
  }
  res.json({ matches: await findMatches(item.toObject()) });
}));

router.patch('/:id/returned', requireAuth, wrap(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (String(item.owner) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  item.status = 'returned';
  await item.save();
  res.json({ ok: true });
}));

router.post('/:id/report', requireAuth, wrap(async (req, res) => {
  const reason = String(req.body.reason || '').trim().slice(0, 300);
  if (!reason) return res.status(400).json({ error: 'Tell us what is wrong with this listing' });
  await Report.create({ item: req.params.id, reporter: req.user.id, reason });
  res.status(201).json({ ok: true });
}));

export default router;
