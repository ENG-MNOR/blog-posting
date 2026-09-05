import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    body: { type: String, required: true, maxlength: 6000 },
    sentAt: { type: Date, default: Date.now },
    sentBy: { type: String },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    requestType: {
      type: String,
      enum: ['speaking', 'training', 'research', 'consultation', 'other'],
      default: 'other',
    },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true },
);

export const Message = mongoose.model('Message', messageSchema);
