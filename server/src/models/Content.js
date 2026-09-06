import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema(
  {
    yearsExperience: Number,
    rolesHandled: Number,
    researchCount: Number, // legacy — now derived from published research
    countriesImpacted: Number
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    heroHeadline: String,
    heroSubtext: String,
    heroCtas: [
      {
        label: String,
        href: String
      }
    ],
    intro: String,
    bio: String,
    profilePhoto: String,
    roles: [{ type: String }],
    expertise: [{ type: String }],
    stats: statsSchema
  },
  { timestamps: true }
);

export const Content = mongoose.model('Content', contentSchema);





