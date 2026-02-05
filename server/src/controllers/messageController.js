import { Message } from '../models/Message.js';
import { sendContactEmail, sendReplyEmail } from '../utils/email.js';

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

  // Notify admin (existing logic)
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

export const replyToMessage = async (req, res) => {
  const { message } = req.body; // Reply content
  const originalMessage = await Message.findById(req.params.id);

  if (!originalMessage) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (!message) {
    return res.status(400).json({ message: 'Reply message is required' });
  }

  // Add reply
  originalMessage.replies.push({
    body: message,
    sentBy: req.user._id
  });
  originalMessage.status = 'replied';
  await originalMessage.save();

  // Send email to user
  try {
    await sendReplyEmail({
      name: originalMessage.name,
      email: originalMessage.email,
      originalMessage: originalMessage.message,
      replyMessage: message
    });
  } catch (error) {
    console.error('Failed to send reply email:', error);
    // Don't fail the request if email fails, just log it
  }
  
  res.json(originalMessage);
};

