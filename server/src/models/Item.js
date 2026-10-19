import mongoose from 'mongoose';

export const CATEGORIES = [
  'keys', 'wallet', 'id-card', 'bag', 'phone',
  'electronics', 'books', 'clothing', 'other',
];

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    // Private proof details. Never returned unless explicitly selected.
    hiddenDetails: { type: String, select: false, maxlength: 600 },
    imageUrl: String,
    aiTags: {
      color: String,
      brand: String,
      features: [String],
      summary: String,
    },
    embedding: { type: [Number], select: false },
    location: {
      label: { type: String, trim: true, maxlength: 100 },
      lat: { type: Number, default: 34.33 },
      lng: { type: Number, default: 73.2 },
    },
    eventDate: { type: Date, required: true },
    custodyNote: { type: String, trim: true, maxlength: 140 },
    contactPhone: { type: String, trim: true, maxlength: 30 },
    whatsapp: { type: String, trim: true, maxlength: 30 },
    status: { type: String, enum: ['open', 'returned', 'removed'], default: 'open' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

itemSchema.index({ type: 1, status: 1, eventDate: -1 });

export default mongoose.model('Item', itemSchema);
