# CineSnap

CineSnap is a full-stack movie booking app built with React, Vite, Express, MongoDB, Clerk, Stripe, and Nodemailer. It includes movie browsing, showtimes, seat selection, bookings, favorites, reviews, payments, email notifications, and an admin dashboard.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: Clerk
- Payments: Stripe Checkout
- Email: Nodemailer

## Project Structure

```text
CineSnap/
  client/   React frontend
  server/   Express API
```

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create environment files from the examples:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

The app runs at `http://localhost:5173` and the API health check is available at `http://localhost:5000/api/health`.

## Deployment

Recommended resume-friendly setup:

1. Deploy `server/` to Render, Railway, or another Node hosting service.
2. Deploy `client/` to Vercel or Netlify.
3. Add the deployed backend URL to the frontend environment variable:

```text
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

4. Add the deployed frontend URL to the backend environment variable:

```text
FRONTEND_URL=https://your-frontend-domain.com
```

Backend build/start settings:

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Frontend build settings:

```text
Root directory: client
Build command: npm run build
Output directory: dist
```

## Environment Variables

See `client/.env.example` and `server/.env.example` for the required variables.

Do not commit real `.env` files or API keys.

