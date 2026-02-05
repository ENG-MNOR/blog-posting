import mongoose from 'mongoose';
import slugify from 'slugify';

const researchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
    journal: { type: String },
    topic: { type: String, index: true },
    summary: { type: String, required: true },
    pdfUrl: String,
    externalLink: String,
    keywords: [{ type: String }],
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'pending_review', 'published'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    slug: { type: String, unique: true }
  },
  { timestamps: true }
);

researchSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(`${this.title}-${this.year}`, { lower: true, strict: true });
  }
  next();
});

export const Research = mongoose.model('Research', researchSchema);





