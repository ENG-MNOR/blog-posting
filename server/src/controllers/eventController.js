import { Event } from '../models/Event.js';

const mapUploadedFiles = (files = []) => files.map((file) => `/uploads/${file.filename}`);

export const listEvents = async (req, res) => {
  const { category } = req.query;

  const query = {};
  if (category) query.category = category;

  const events = await Event.find(query).sort({ date: 1 });
  res.json(events);
};

export const getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
};

export const createEvent = async (req, res) => {
  const images = mapUploadedFiles(req.files);
  const payload = { ...req.body, images };
  if (images.length && !payload.imageUrl) {
    payload.imageUrl = images[0];
  }
  const doc = await Event.create(payload);
  res.status(201).json(doc);
};

export const updateEvent = async (req, res) => {
  const doc = await Event.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const images = mapUploadedFiles(req.files);
  const updates = { ...req.body };

  // Only replace images when new uploads are provided; otherwise keep existing ones
  if (images.length) {
    updates.images = images;
    updates.imageUrl = images[0];
  }

  Object.assign(doc, updates);
  await doc.save();
  res.json(doc);
};

export const deleteEvent = async (req, res) => {
  const deleted = await Event.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.status(204).send();
};

