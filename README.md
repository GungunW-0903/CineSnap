<div align="center">
  <img src="./client/src/assets/logo.svg" alt="CineSnap logo" width="180" />

  <h1>CineSnap</h1>

  <p>
    A full-stack movie booking platform with cinematic browsing, seat selection,
    secure checkout, reviews, favorites, and an admin dashboard.
  </p>

  <p>
    <a href="https://github.com/GungunW-0903/CineSnap"><strong>GitHub Repository</strong></a>
    ·
    <a href="#deployment"><strong>Deploy Guide</strong></a>
    ·
    <a href="#local-setup"><strong>Run Locally</strong></a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=ffffff" />
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=ffffff" />
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=ffffff" />
  </p>
</div>

---

## Overview

CineSnap is a MERN-style movie ticket booking application designed as a polished portfolio project. The frontend delivers a cinematic browsing experience with animated sections, movie discovery, seat layout selection, bookings, and favorites. The backend provides REST APIs for movies, shows, bookings, reviews, payments, users, and email notifications.

The project is split into a Vite React client and an Express API so each part can be deployed independently.

## Highlights

- Browse movies with rich detail pages and trailer-friendly UI
- Select show dates and seats through a booking-focused flow
- Save favorite movies and view personal bookings
- Add reviews and ratings for movies
- Admin dashboard for shows, bookings, and movie management workflows
- Stripe Checkout integration for payments
- Clerk-ready authentication setup
- Email notification support with Nodemailer
- MongoDB seed script for starter movie/show data
- Production-ready frontend build through Vite

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | Clerk |
| Payments | Stripe Checkout |
| Email | Nodemailer |
| Tooling | ESLint, npm scripts, Vercel config |

## Project Structure

```text
CineSnap/
  client/                  React + Vite frontend
    src/
      components/          Reusable UI and page sections
      pages/               User and admin pages
      assets/              Images, logos, and static assets
      lib/                 API and formatting helpers
  server/                  Express backend
    controllers/           Route business logic
    models/                Mongoose schemas
    routes/                REST API routes
    middleware/            Auth and error handling
    config/                DB, email, and Stripe config
```

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/GungunW-0903/CineSnap.git
cd CineSnap
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create local env files from the examples:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Frontend:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend:

```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:5173
```

### 4. Seed the Database

```bash
npm run seed --prefix server
```

### 5. Start the App

Run the backend:

```bash
npm run dev:server
```

Run the frontend in another terminal:

```bash
npm run dev:client
```

Open:

```text
Frontend: http://localhost:5173
API Health: http://localhost:5000/api/health
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run install:all` | Install frontend and backend dependencies |
| `npm run dev:client` | Start the Vite frontend |
| `npm run dev:server` | Start the Express backend with Nodemon |
| `npm run build` | Build the frontend for production |
| `npm run lint` | Run frontend lint checks |
| `npm start` | Start the backend in production mode |

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/movies` | Fetch movie catalog |
| `GET` | `/api/movies/:id` | Fetch a movie detail page |
| `GET` | `/api/shows/movie/:movieId` | Fetch showtimes for a movie |
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings/user/:userId` | Fetch user bookings |
| `POST` | `/api/payment/create-checkout-session` | Create Stripe Checkout session |
| `POST` | `/api/favorites/toggle` | Add or remove a favorite |
| `GET/POST` | `/api/reviews/...` | Read and create reviews |

## Deployment

Recommended setup for a resume-ready live project:

### Backend: Render or Railway

```text
Root directory: server
Build command: npm install
Start command: npm start
```

Add backend environment variables from `server/.env.example`.

### Frontend: Vercel or Netlify

```text
Root directory: client
Build command: npm run build
Output directory: dist
```

Add this frontend environment variable:

```text
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Update the backend with your deployed frontend URL:

```text
FRONTEND_URL=https://your-frontend-domain.com
```

## Resume Summary

Built a full-stack movie booking platform using React, Vite, Express, MongoDB, Clerk, and Stripe. Implemented movie discovery, seat booking, favorites, reviews, payments, email notifications, and an admin dashboard with a deployable client-server architecture.

## Security Notes

- Real `.env` files are ignored by Git.
- Use `.env.example` files as templates only.
- Do not commit API keys, database credentials, Stripe secrets, or Clerk secrets.

## Author

**Gungun Wadhwa**  
GitHub: [GungunW-0903](https://github.com/GungunW-0903)

