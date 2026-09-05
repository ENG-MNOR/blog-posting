import { Content } from '../models/Content.js';

const ALLOWED = [
  'heroHeadline',
  'heroSubtext',
  'heroCtas',
  'intro',
  'bio',
  'roles',
  'expertise',
  'stats',
];

export const getContent = async (req, res) => {
  const content = await Content.findOne({ slug: req.params.slug });
  if (!content) {
    return res.status(404).json({ message: `No content for "${req.params.slug}"` });
  }
  res.json(content);
};

export const upsertContent = async (req, res) => {
  const body = { ...req.body };

  // FormData delivers nested fields as JSON strings.
  for (const key of ['stats', 'roles', 'expertise', 'heroCtas']) {
    if (typeof body[key] === 'string') {
      try {
        body[key] = JSON.parse(body[key]);
      } catch {
        /* leave as-is; schema validation will reject if wrong */
      }
    }
  }

  const update = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if (req.file) update.profilePhoto = `/uploads/${req.file.filename}`;

  const content = await Content.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: update },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.json(content);
};
