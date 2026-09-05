import { Event } from '../models/Event.js';

const mapUploadedFiles = (files = []) => files.map((file) => `/uploads/${file.filename}`);

const WRITABLE = ['name', 'role', 'date', 'location', 'description', 'link', 'materialsUrl'];

const pickWritable = (body) => {
  const out = {};
  for (const key of WRITABLE) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
};

export const listEvents = async (req, res) => {
  const category = req.query.category ? String(req.query.category) : undefined;

  const query = {};
  if (category === 'upcoming' || category === 'past') query.category = category;

  let sort = { createdAt: -1 };
  if (category === 'upcoming') sort = { date: 1 };
  else if (category === 'past') sort = { date: -1 };

  const events = await Event.find(query).sort(sort);
  res.json(events);
};

export const getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

export const createEvent = async (req, res) => {
  const images = mapUploadedFiles(req.files);
  const payload = pickWritable(req.body);
  payload.images = images;
  if (images.length) payload.imageUrl = images[0];

  const doc = await Event.create(payload);
  res.status(201).json(doc);
};

export const updateEvent = async (req, res) => {
  const doc = await Event.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Event not found' });

  Object.assign(doc, pickWritable(req.body));

  // Image reconciliation: the client sends `existingImages` for each image it
  // wants to keep, plus any new uploads. `clearImages=true` means "remove all".
  const newImages = mapUploadedFiles(req.files);
  const kept = req.body.existingImages
    ? Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages]
    : [];

  const touchedImages =
    newImages.length > 0 || req.body.existingImages !== undefined || req.body.clearImages === 'true';

  if (touchedImages) {
    const finalImages = [...kept, ...newImages];
    doc.images = finalImages;
    doc.imageUrl = finalImages[0] || '';
  }

  await doc.save();
  res.json(doc);
};

export const deleteEvent = async (req, res) => {
  const deleted = await Event.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Event not found' });
  res.status(204).send();
};
