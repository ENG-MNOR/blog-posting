## Dr. Nour Haji Portfolio – MERN Stack

Full-stack portfolio + admin workspace for public health expert Dr. Nour Haji Osman. Built with React (Vite + Tailwind) on the frontend and Node/Express + MongoDB on the backend.

### Features
- **Public site:** hero overview, bio, research list with filters, event calendar (upcoming vs past), and contact form that emails + stores submissions.
- **Admin dashboard:** JWT-authenticated area to manage research entries, events, homepage/about content, uploads, and inbox messages.
- **API:** RESTful endpoints for auth, CRUD operations, uploads (multer), and contact submissions with Nodemailer notifications.
- **Quality:** React Query caching, Zustand auth store, protected routes with refresh-token flow, secure Express middlewares (helmet, cors, rate limiting), and linting configs on both apps.

### Project Structure
```
Nor Portfolio/
├── client/   # Vite + React + TS frontend
├── server/   # Express API, Mongo models, controllers
└── README.md
```

### Getting Started
1. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. **Environment variables**
   - Copy `server/env.example` to `server/.env` and fill Mongo URI, JWT secrets, SMTP creds, etc.
   - Optionally add `client/.env` with `VITE_API_URL=http://localhost:5000/api`.
3. **Run locally**
   ```bash
   # Backend (http://localhost:5000)
   cd server
   npm run dev

   # Frontend (http://localhost:5173)
   cd client
   npm run dev
   ```

### Admin Onboarding
1. POST to `POST /api/auth/bootstrap` once (via cURL or REST client) with `{ name, email, password }` to create the first admin user.
2. Log in at `/admin/login`. All other dashboard routes require the JWT access token; refresh tokens live in httpOnly cookies.

### Testing & Linting
```bash
cd client && npm run lint
cd server && npm run lint
```

### Deployment Notes
- Deploy frontend on Vercel/Netlify; backend on Render/Fly/Heroku. Point `CLIENT_URL` env var to the public frontend URL (comma-separated list if multiple).
- Persist uploads either on the server’s filesystem (default `server/uploads`) or swap the multer destination for S3/GCS.
- Ensure HTTPS in production so the refresh-token cookie remains secure.





