import fs from 'node:fs';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const ensureUploadsDir = () => {
  if (!fs.existsSync(env.uploadsDir)) {
    fs.mkdirSync(env.uploadsDir, { recursive: true });
  }
};

const start = async () => {
  ensureUploadsDir();
  await connectDB(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
  });
};

start();


// import fs from 'node:fs';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// import express from 'express';
// import { app } from './app.js';
// import { connectDB } from './config/db.js';
// import { env } from './config/env.js';

// /* ----------------------------------
//    Fix __dirname for ESM
// ---------------------------------- */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ----------------------------------
//    Ensure uploads directory
// ---------------------------------- */
// const ensureUploadsDir = () => {
//   if (!fs.existsSync(env.uploadsDir)) {
//     fs.mkdirSync(env.uploadsDir, { recursive: true });
//   }
// };

// /* ----------------------------------
//    Serve React build (AFTER build)
// ---------------------------------- */
// const clientBuildPath = path.join(__dirname, '../build');

// app.use(express.static(clientBuildPath));

// // React router fallback
// app.get('/', (req, res) => {
//   res.sendFile(path.join(clientBuildPath, 'index.html'));
// });

// /* ----------------------------------
//    Start server
// ---------------------------------- */
// const start = async () => {
//   ensureUploadsDir();
//   await connectDB(env.mongoUri);

//   app.listen(env.port, () => {
//     console.log(`API + Client running on port ${env.port}`);
//   });
// };

// start();
