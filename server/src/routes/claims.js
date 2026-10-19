import { Router } from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { wrap } from '../middleware/wrap.js';
import { generateChallenges, gradeAnswers } from '../services/llm.js';

const router = Router();
const APPROVE_AT = Number(process.env.APPROVE_AT || 75);
const REVIEW_AT = Number(process.env.REVIEW_AT || 45);
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS || 2);

// What the claimant is allowed to see. Never the score or the reasoning.
const claimantView = (c) => ({
  id: c._id,
  item: c.item,
  status: c.status,
  questions: c.status === 'awaiting_answers' ? c.questions : [],
  attempts: c.attempts,
  maxAttempts: MAX_ATTEMPTS,
  canRetry: c.status === 'rejected' && c.attempts < MAX_ATTEMPTS,
});

async function loadForParticipant(req, res) {
  const claim = await Claim.findById(req.params.id);
  if (!claim) { res.status(404).json({ error: 'Claim not found' }); return null; }
  const uid = req.user.id;
  const ok = [String(claim.claimant), String(claim.finder)].includes(uid) || req.user.role === 'admin';
  if (!ok) { res.status(403).json({ error: 'Not allowed' }); return null; }
  return claim;
}

// Start (or resume) a claim: generates the challenge questions.
router.post('/item/:itemId', requireAuth, wrap(async (req, res) => {
  const item = await Item.findById(req.params.itemId).select('+hiddenDetails');
  if (!item || item.type !== 'found' || item.status !== 'open') {
    return res.status(404).json({ error: 'This item is not open for claims' });
  }
  if (String(item.owner) === req.user.id) return res.status(400).json({ error: 'You posted this item' });

  let claim = await Claim.findOne({ item: item._id, claimant: req.user.id });
  if (claim && ['awaiting_answers', 'approved', 'review'].includes(claim.status)) {
    return res.json(claimantView(claim));
  }
  if (claim && claim.attempts >= MAX_ATTEMPTS) {
    return res.status(403).json({ error: 'You have used all attempts for this item. If it is really yours, ask the finder through the report option or contact campus security.' });
  }

  const questions = await generateChallenges(item);
  if (claim) {
    claim.attempts += 1;
    claim.questions = questions;
    claim.answers = [];
    claim.score = undefined;
    claim.reasoning = undefined;
    claim.status = 'awaiting_answers';
    await claim.save();
  } else {
    claim = await Claim.create({ item: item._id, claimant: req.user.id, finder: item.owner, questions });
  }
  res.status(201).json(claimantView(claim));
}));

router.post('/:id/answer', requireAuth, wrap(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim || String(claim.claimant) !== req.user.id) return res.status(404).json({ error: 'Claim not found' });
  if (claim.status !== 'awaiting_answers') return res.status(400).json({ error: 'This claim was already answered' });

  const answers = (Array.isArray(req.body.answers) ? req.body.answers : []).map((a) => String(a || '').trim().slice(0, 300));
  if (answers.length !== claim.questions.length || answers.some((a) => !a)) {
    return res.status(400).json({ error: 'Answer every question. If you are unsure, say what you remember.' });
  }

  const item = await Item.findById(claim.item).select('+hiddenDetails');
  const { score, reasoning } = await gradeAnswers(item, claim.questions, answers);
  claim.answers = answers;
  claim.score = score;
  claim.reasoning = reasoning;
  claim.status = score >= APPROVE_AT ? 'approved' : score >= REVIEW_AT ? 'review' : 'rejected';
  await claim.save();
  res.json(claimantView(claim));
}));

router.get('/mine', requireAuth, wrap(async (req, res) => {
  const claims = await Claim.find({ claimant: req.user.id })
    .sort({ updatedAt: -1 })
    .populate({ path: 'item', select: 'title imageUrl status category' });
  res.json({ claims: claims.map((c) => claimantView(c)) });
}));

// Claims on items I found that need my attention or have unlocked chat.
router.get('/incoming', requireAuth, wrap(async (req, res) => {
  const claims = await Claim.find({ finder: req.user.id, status: { $in: ['review', 'approved'] } })
    .sort({ updatedAt: -1 })
    .populate({ path: 'item', select: 'title imageUrl status +hiddenDetails' })
    .populate({ path: 'claimant', select: 'name' });
  res.json({
    claims: claims.map((c) => ({
      id: c._id,
      status: c.status,
      item: c.item,
      claimant: c.claimant,
      questions: c.questions,
      answers: c.answers,
      score: c.score,
      reasoning: c.reasoning,
      updatedAt: c.updatedAt,
    })),
  });
}));

router.get('/:id', requireAuth, wrap(async (req, res) => {
  const claim = await loadForParticipant(req, res);
  if (!claim) return;
  const item = await Item.findById(claim.item).select('title imageUrl status custodyNote location');
  const other = String(claim.claimant) === req.user.id ? claim.finder : claim.claimant;
  const otherUser = await User.findById(other).select('name');
  res.json({ id: claim._id, status: claim.status, item, other: otherUser, iAmFinder: String(claim.finder) === req.user.id });
}));

// Finder settles borderline claims.
router.patch('/:id/decision', requireAuth, wrap(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (String(claim.finder) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  if (claim.status !== 'review') return res.status(400).json({ error: 'This claim is not waiting for a decision' });
  claim.status = req.body.approve ? 'approved' : 'rejected';
  await claim.save();
  res.json({ status: claim.status });
}));

router.get('/:id/messages', requireAuth, wrap(async (req, res) => {
  const claim = await loadForParticipant(req, res);
  if (!claim) return;
  if (claim.status !== 'approved') return res.status(403).json({ error: 'Chat opens once ownership is verified' });
  const messages = await Message.find({ claim: claim._id }).sort({ createdAt: 1 }).limit(500);
  res.json({ messages });
}));

export default router;
