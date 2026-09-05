import { Message } from '../models/Message.js';
import { sendContactEmail, sendReplyEmail } from '../utils/email.js';

export const submitMessage = async (req, res) => {
  // req.body is already validated + whitelisted by the route middleware.
  const message = await Message.create(req.body);

  sendContactEmail(req.body).catch((error) => console.error('Contact email error', error));

  res.status(201).json(message);
};

export const listMessages = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (['unread', 'read', 'replied'].includes(String(status))) filter.status = String(status);

  const messages = await Message.find(filter).sort({ createdAt: -1 });
  res.json(messages);
};

export const markMessageRead = async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

export const markMessageUnread = async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: 'unread' }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

export const replyToMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  const body = req.body.message;
  message.replies.push({ body, sentBy: req.user?.name || 'Admin' });
  message.status = 'replied';
  await message.save();

  sendReplyEmail({ to: message.email, name: message.name, reply: body }).catch((error) =>
    console.error('Reply email error', error),
  );

  res.status(201).json(message);
};

export const deleteMessage = async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Message not found' });
  res.status(204).send();
};
