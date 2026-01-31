import { Message } from '../models/Message.js';
import { sendContactEmail } from '../utils/email.js';

export const submitMessage = async (req, res) => {
  const { name, email, requestType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }

  const payload = await Message.create({
    name,
    email,
    requestType,
    message
  });

  sendContactEmail({ name, email, requestType, message }).catch((error) =>
    console.error('Email error', error)
  );

  res.status(201).json(payload);
};

export const listMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
};

export const markMessageRead = async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true }
  );
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }
  res.json(message);
};

