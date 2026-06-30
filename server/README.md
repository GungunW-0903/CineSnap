# CineSnap API

Backend for the CineSnap movie-booking app — movies, showtimes, seat booking,
Stripe payments, email notifications, favorites, reviews, and a loyalty system.

## Quick start

```bash
cd server
npm install
# 1. fill in .env  (see below)
npm run seed     # populate movies + showtimes (run once)
npm run dev      # start API on http://localhost:5000
```

Check it's alive: open http://localhost:5000/api/health

## Environment (.env)

| Var | Required | How to get it |
|-----|----------|---------------|
| `MONGODB_URI` | ✅ | [MongoDB Atlas](https://www.mongodb.com/atlas) → create free cluster → "Connect" → "Drivers" → copy the connection string. Replace `<password>` and add `/cinesnap` before the `?`. |
| `STRIPE_SECRET_KEY` | ✅ payments | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → "Secret key" (starts `sk_test_`). |
| `STRIPE_WEBHOOK_SECRET` | optional | Only for the webhook. Use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:5000/api/payment/webhook`. The success page already confirms payment without it. |
| `EMAIL_USER` / `EMAIL_PASSWORD` | optional | Gmail address + an [App Password](https://myaccount.google.com/apppasswords) (not your normal password). If unset, emails are logged instead of sent — nothing breaks. |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` in dev. |
| `CLERK_SECRET_KEY` | optional | From your Clerk dashboard, if you wire server-side Clerk verification. |

## API overview

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/movies` | list (supports `?search= &genre= &sort=`) |
| GET | `/api/movies/trending` | top movies |
| GET | `/api/movies/:id` | detail (+ reviews, view count) |
| GET | `/api/shows/movie/:movieId` | showtimes grouped by date |
| GET | `/api/shows/:id` | one show + occupied seats |
| POST | `/api/bookings` | create a pending booking (locks seats) |
| GET | `/api/bookings/user/:userId` | **My Bookings** |
| PATCH | `/api/bookings/:id/cancel` | cancel |
| POST | `/api/payment/create-checkout-session` | Stripe Checkout URL |
| POST | `/api/payment/confirm` | finalize after payment |
| GET | `/api/favorites/:userId` | watchlist |
| POST | `/api/favorites/toggle` | add/remove favorite |
| GET/POST | `/api/reviews/...` | ratings & reviews |
| POST | `/api/users/sync` | upsert user on sign-in (+ welcome/login email) |

## Booking flow

1. `POST /api/bookings` → creates a **pending** booking and locks the seats.
2. `POST /api/payment/create-checkout-session` → returns a Stripe URL; redirect the user.
3. User pays with a [test card](https://stripe.com/docs/testing) (`4242 4242 4242 4242`, any future date/CVC).
4. Stripe redirects to `/booking-success?session_id=...`; the page calls
   `POST /api/payment/confirm`, which marks the booking **completed**, books the
   seats, awards loyalty points, and emails the ticket.
5. The booking now appears in **My Bookings**.

## Engagement features included

- ⭐ Reviews & star ratings per movie
- 🔥 Trending / popularity ranking + view counts
- ❤️ Favorites / watchlist
- 🏆 Loyalty points (10 pts per $1) with Bronze→Platinum tiers
- 🎁 Referral bonus points
- ✉️ Transactional emails (welcome, login alert, booking confirmation)
