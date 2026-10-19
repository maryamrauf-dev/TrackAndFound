import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    finder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [String],
    answers: [String],
    score: Number,
    reasoning: String,
    attempts: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['awaiting_answers', 'approved', 'review', 'rejected'],
      default: 'awaiting_answers',
    },
  },
  { timestamps: true }
);

claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

export default mongoose.model('Claim', claimSchema);
