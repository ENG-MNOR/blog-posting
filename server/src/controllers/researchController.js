import { Research } from '../models/Research.js';

const isAdmin = (req) => req.user && req.user.role === 'admin';

export const listResearch = async (req, res) => {
  // Coerce to primitives — guards against `?topic[$ne]=` operator injection.
  const topic = req.query.topic ? String(req.query.topic) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const q = req.query.q ? String(req.query.q) : undefined;

  const query = {};
  if (topic) query.topic = topic;
  if (Number.isFinite(year)) query.year = year;
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { summary: { $regex: q, $options: 'i' } },
      { journal: { $regex: q, $options: 'i' } },
    ];
  }

  if (!isAdmin(req)) {
    query.status = 'published';
  } else if (status && ['draft', 'pending_review', 'published'].includes(status)) {
    query.status = status;
  }

  const research = await Research.find(query).sort({ year: -1, createdAt: -1 });
  res.json(research);
};

export const getResearch = async (req, res) => {
  const research = await Research.findById(req.params.id);
  if (!research || (research.status !== 'published' && !isAdmin(req))) {
    return res.status(404).json({ message: 'Research not found' });
  }
  res.json(research);
};

export const createResearch = async (req, res) => {
  const payload = { ...req.body };
  // Only admins may publish directly.
  if (!isAdmin(req) && payload.status === 'published') payload.status = 'pending_review';
  const doc = await Research.create(payload);
  res.status(201).json(doc);
};

export const updateResearch = async (req, res) => {
  const doc = await Research.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Research not found' });

  const updates = { ...req.body };
  if (!isAdmin(req) && updates.status === 'published') updates.status = 'pending_review';
  Object.assign(doc, updates);
  await doc.save();
  res.json(doc);
};

export const deleteResearch = async (req, res) => {
  const deleted = await Research.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Research not found' });
  res.status(204).send();
};
