import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Claim from './models/Claim.js';
import Message from './models/Message.js';
import User from './models/User.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
  });

  io.use(async (socket, next) => {
    try {
      const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('name banned');
      if (!user || user.banned) return next(new Error('unauthorized'));
      socket.data.user = { id: String(user._id), name: user.name };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', async (claimId, ack) => {
      try {
        const claim = await Claim.findById(claimId);
        const uid = socket.data.user.id;
        const ok = claim && claim.status === 'approved' && [String(claim.claimant), String(claim.finder)].includes(uid);
        if (!ok) return ack?.({ error: 'Chat is not available for this claim' });
        socket.join(`claim:${claimId}`);
        socket.data.claimId = claimId;
        ack?.({ ok: true });
      } catch {
        ack?.({ error: 'Could not join chat' });
      }
    });

    socket.on('message', async (text, ack) => {
      const claimId = socket.data.claimId;
      const clean = String(text || '').trim().slice(0, 1000);
      if (!claimId || !clean) return ack?.({ error: 'Nothing to send' });
      const msg = await Message.create({ claim: claimId, sender: socket.data.user.id, text: clean });
      io.to(`claim:${claimId}`).emit('message', {
        _id: msg._id, claim: claimId, sender: socket.data.user.id, text: msg.text, createdAt: msg.createdAt,
      });
      ack?.({ ok: true });
    });
  });

  return io;
}
