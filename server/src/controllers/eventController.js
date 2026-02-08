import { Event } from '../models/Event.js';

const mapUploadedFiles = (files = []) => files.map((file) => `/uploads/${file.filename}`);

export const listEvents = async (req, res) => {
  const { category } = req.query;

  const query = {};
  if (category) query.category = category;

  // Determine sort order based on category context
  // - Admin (no category): Sort by creation date (newest first)
  // - Past: Sort by date descending (most recent past first)
  // - Upcoming: Sort by date ascending (soonest first)
  let sort = { createdAt: -1 };
  
  if (category === 'upcoming') {
    sort = { date: 1 };
  } else if (category === 'past') {
    sort = { date: -1 };
  }

  const events = await Event.find(query).sort(sort);
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

  const newImages = mapUploadedFiles(req.files);
  const updates = { ...req.body };

  // Handle images:
  // 1. Combine kept existing images (from req.body.existingImages) and new uploads
  let existingImages = [];
  if (req.body.existingImages) {
    // If multiple images, it's an array; if one, it's a string
    existingImages = Array.isArray(req.body.existingImages) 
      ? req.body.existingImages 
      : [req.body.existingImages];
  }
  
  // If we have either new images or an explicit list of existing images, update the list
  // Note: if req.body.existingImages is undefined, it usually means "don't change images" OR "remove all".
  // But typically in FormData, if we want to remove all, we send an empty existingImages?
  // Actually, if we send nothing, it's ambiguous.
  // However, the frontend will send `existingImages` for every image it wants to KEEP.
  // If the user deleted all images, frontend should probably send a flag or we detect that.
  
  // Let's adopt this logic:
  // If `req.files` is present OR `req.body.existingImages` is present, we reconstruct the image list.
  // If neither is present, we might assume no change to images, UNLESS `req.body.imagesChanged` flag is sent (optional).
  // But strictly speaking, if the user removes all images and adds none, existingImages might be missing from body if not handled carefully.
  // We'll trust the frontend to send `existingImages` if it wants to keep any. 
  
  // To allow clearing all images, we can check if `req.body.updateImages` is true.
  // Or we can rely on the fact that we are doing a PATCH/PUT.
  
  // Let's implement: Always update images if we have `req.files` or `req.body.existingImages`.
  // If we have new images, we definitely update.
  // If we have `existingImages`, we definitely update.
  // What if we removed all and added none? `existingImages` would be empty/undefined.
  // We can look for a flag `imagesModified` from frontend.
  
  // For now, let's merge:
  const finalImages = [...existingImages, ...newImages];
  
  // Only update if there's a change or we have explicit data
  if (newImages.length > 0 || req.body.existingImages || req.body.clearImages === 'true') {
     updates.images = finalImages;
     updates.imageUrl = finalImages[0] || ""; // First image as main
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

