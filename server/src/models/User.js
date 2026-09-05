import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
    titles: [{ type: String }],
    avatarUrl: String
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);





