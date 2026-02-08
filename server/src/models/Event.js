import mongoose from 'mongoose';
import slugify from 'slugify';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String },
    link: { type: String },
    description: { type: String },
    category: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' },
    images: { type: [String], default: [] },
    imageUrl: String,
    materialsUrl: String,
    slug: { type: String, unique: true }
  },
  { timestamps: true }
);

eventSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(`${this.name}-${this.date?.toISOString()}`, { lower: true, strict: true });
  }

  this.category = new Date(this.date) >= new Date() ? 'upcoming' : 'past';
  next();
});

export const Event = mongoose.model('Event', eventSchema);





