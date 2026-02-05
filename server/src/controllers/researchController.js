import { Research } from '../models/Research.js';

export const listResearch = async (req, res) => {
  const { topic, year } = req.query;

  const query = { status: 'published' };
  if (topic) query.topic = topic;
  if (year) query.year = Number(year);

  const research = await Research.find(query)
    .populate('author', 'name')
    .sort({ year: -1, createdAt: -1 });
  res.json(research);
};

export const listDashboardResearch = async (req, res) => {
  const { topic, year, status } = req.query;
  const query = {};

  if (req.user.role !== 'admin') {
    query.author = req.user._id;
  }

  if (topic) query.topic = topic;
  if (year) query.year = Number(year);
  if (status) query.status = status;

  const research = await Research.find(query)
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
  res.json(research);
};

export const getResearch = async (req, res) => {
  const research = await Research.findById(req.params.id).populate('author', 'name');
  if (!research) {
    return res.status(404).json({ message: 'Research not found' });
  }
  res.json(research);
};

export const createResearch = async (req, res) => {
  const data = { ...req.body };
  data.author = req.user._id;

  if (req.user.role !== 'admin') {
    data.status = 'pending_review';
  }

  const doc = await Research.create(data);
  res.status(201).json(doc);
};

export const updateResearch = async (req, res) => {
  const doc = await Research.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Research not found' });
  }

  if (req.user.role !== 'admin' && doc.author?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You do not have permission to edit this research' });
  }

  if (req.user.role !== 'admin' && req.body.status === 'published') {
    return res.status(403).json({ message: 'Only admins can publish research' });
  }

  Object.assign(doc, req.body);
  
  // Re-generate slug if title changed
  if (req.body.title) {
     // Slug logic is in pre-save hook, so just saving should work if title modified
  }

  await doc.save();
  res.json(doc);
};

export const deleteResearch = async (req, res) => {
  const doc = await Research.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Research not found' });
  }

  if (req.user.role !== 'admin' && doc.author?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  await doc.deleteOne();
  res.status(204).send();
};

