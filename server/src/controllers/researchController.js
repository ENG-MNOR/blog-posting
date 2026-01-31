import { Research } from '../models/Research.js';

export const listResearch = async (req, res) => {
  const { topic, year } = req.query;

  const query = {};
  if (topic) query.topic = topic;
  if (year) query.year = Number(year);

  const research = await Research.find(query).sort({ year: -1, createdAt: -1 });
  res.json(research);
};

export const getResearch = async (req, res) => {
  const research = await Research.findById(req.params.id);
  if (!research) {
    return res.status(404).json({ message: 'Research not found' });
  }
  res.json(research);
};

export const createResearch = async (req, res) => {
  const doc = await Research.create(req.body);
  res.status(201).json(doc);
};

export const updateResearch = async (req, res) => {
  const doc = await Research.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Research not found' });
  }
  Object.assign(doc, req.body);
  await doc.save();
  res.json(doc);
};

export const deleteResearch = async (req, res) => {
  const deleted = await Research.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Research not found' });
  }
  res.status(204).send();
};

