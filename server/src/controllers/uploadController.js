export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    filename: req.file.filename,
    url: fileUrl,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
};





