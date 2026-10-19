import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import Item from './models/Item.js';

await mongoose.connect(process.env.MONGO_URI);

const lat = Number(process.env.CAMPUS_LAT || 34.33);
const lng = Number(process.env.CAMPUS_LNG || 73.2);
const day = 86400000;

let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
if (!admin) {
  admin = await User.create({
    name: 'Campus Admin',
    email: process.env.ADMIN_EMAIL || 'admin@foundnearme.test',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin12345', 10),
    role: 'admin',
  });
}

let demo = await User.findOne({ email: 'demo@foundnearme.test' });
if (!demo) {
  demo = await User.create({
    name: 'Demo Student',
    email: 'demo@foundnearme.test',
    passwordHash: await bcrypt.hash('demo12345', 10),
  });
}

console.log('Seeded accounts. Admin:', admin.email, '| Demo user: demo@foundnearme.test / demo12345');
await mongoose.disconnect();
