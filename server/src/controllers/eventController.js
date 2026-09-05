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

/**
 * Rebuild the ordered image list from an optional `imageOrder` token array
 * (["existing:/uploads/a.jpg", "new:0", ...]) plus freshly uploaded files.
 * Falls back to "kept first, then new".
 */
const resolveImages = (body, uploaded) => {
  const kept = body.existingImages
    ? Array.isArray(body.existingImages)
      ? body.existingImages
      : [body.existingImages]
    : [];

  let order;
  try {
    order = typeof body.imageOrder === 'string' ? JSON.parse(body.imageOrder) : body.imageOrder;
  } catch {
    order = undefined;
  }

  if (Array.isArray(order) && order.length) {
    const out = [];
    for (const token of order) {
      if (typeof token !== 'string') continue;
      if (token.startsWith('new:')) {
        const idx = Number(token.slice(4));
        if (uploaded[idx]) out.push(uploaded[idx]);
      } else if (token.startsWith('existing:')) {
        const url = token.slice(9);
        if (kept.includes(url)) out.push(url);
      }
    }
    if (out.length) return out.slice(0, 3);
  }

  return [...kept, ...uploaded].slice(0, 3);
};

export const createEvent = async (req, res) => {
  const uploaded = mapUploadedFiles(req.files);
  const images = resolveImages(req.body, uploaded);
  const payload = pickWritable(req.body);
  payload.images = images;
  payload.imageUrl = images[0] || '';

  const doc = await Event.create(payload);
  res.status(201).json(doc);
};

export const updateEvent = async (req, res) => {
  const doc = await Event.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Event not found' });

  Object.assign(doc, pickWritable(req.body));

  // The client sends `existingImages` for every image it keeps, the new files,
  // and an `imageOrder` token list for the final sequence. `clearImages=true`
  // means "remove all".
  const uploaded = mapUploadedFiles(req.files);
  const touchedImages =
    uploaded.length > 0 ||
    req.body.existingImages !== undefined ||
    req.body.imageOrder !== undefined ||
    req.body.clearImages === 'true';

  if (touchedImages) {
    const finalImages = req.body.clearImages === 'true' ? [] : resolveImages(req.body, uploaded);
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
