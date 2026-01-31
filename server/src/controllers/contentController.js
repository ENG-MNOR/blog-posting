import { Content } from '../models/Content.js';

export const getContent = async (req, res) => {
  const content = await Content.findOne({ slug: req.params.slug });
  // Return empty object if content doesn't exist (allows frontend to use defaults)
  res.json(content || {});
};

export const upsertContent = async (req, res) => {
  const update = { ...req.body };

  // Handle file upload for profilePhoto
  if (req.file) {
    update.profilePhoto = `/uploads/${req.file.filename}`;
  }

  // Parse JSON fields if they're strings (from FormData)
  if (typeof update.stats === 'string') {
    try {
      update.stats = JSON.parse(update.stats);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }

  const content = await Content.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: update },
    { upsert: true, new: true }
  );
  res.json(content);
};





