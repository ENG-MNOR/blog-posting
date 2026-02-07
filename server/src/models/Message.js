import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    requestType: { type: String, enum: ['speaking', 'training', 'research', 'consultation', 'other'], default: 'other' },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' }
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);





