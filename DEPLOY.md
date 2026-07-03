# Deploying CineSnap (making the live link fully work)

The frontend is hosted on **GitHub Pages**, which serves *static files only*. It
**cannot run** the Express backend or MongoDB. So to make booking, email, loyalty,
QR tickets, reviews, and favorites work on the live link, you must host the
**backend separately** and point the frontend at it.

There are 3 parts. Do them in order.

---

## 1. Database — MongoDB Atlas (free)

1. Create a free cluster at https://www.mongodb.com/atlas .
2. Database Access → add a user (username + password).
3. Network Access → allow `0.0.0.0/0` (any IP) so your host can connect.
4. Copy the connection string, e.g.
   `mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/cinesnap`
   (add `/cinesnap` before the `?` so it uses the `cinesnap` database).

---

## 2. Backend — Render (free) or Railway

Deploy the `server/` folder:

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Build command | `npm install` |
| Start command | `npm start` |

Set these **environment variables** on the host:

```
NODE_ENV=production
MONGODB_URI=<your Atlas connection string>
FRONTEND_URL=https://gungunw-0903.github.io
CLERK_SECRET_KEY=sk_test_...            # from Clerk dashboard (real secret key)

# Email — REQUIRED for real inbox delivery in production.
# (In production the app does NOT use the Ethereal test inbox.)
EMAIL_SERVICE=gmail
EMAIL_USER=youraddress@gmail.com
EMAIL_PASSWORD=<16-char Gmail App Password>   # Google Account → Security → App passwords
EMAIL_FROM=CineSnap <youraddress@gmail.com>

# Payments (optional — demo payment works without these)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

After the first deploy, **seed the database once** (Render → Shell, or run locally
pointed at Atlas):

```
npm run seed
```

Verify: open `https://<your-backend>.onrender.com/api/health` → should return
`{"status":"ok"}`, and `/api/movies` should list 7 movies.

> Note: Render's free tier sleeps after inactivity; the first request may take
> ~30s to wake. That's normal.

---

## 3. Frontend — point GitHub Pages at the backend

In the GitHub repo: **Settings → Secrets and variables → Actions → Variables**
tab → add repository **Variables** (not Secrets — Vite inlines `VITE_*` into the
public bundle):

```
VITE_API_BASE_URL          = https://<your-backend>.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY = pk_test_...        # same Clerk instance as the backend
VITE_CURRENCY              = $
```

Then re-run the deploy: **Actions → Deploy Frontend to GitHub Pages → Run
workflow** (or just push any commit to `main`).

---

## Why it wasn't working before

- GitHub Pages had **no backend to talk to** → every booking/show/email call fell
  back to bundled sample data (so "no show" / nothing books / no email).
- The CI build had **no Clerk key** → sign-in was off, and (before this fix) pages
  that read the signed-in user could white-screen.

Once steps 1–3 are done, the live link has real shows, real bookings, real QR
tickets, and confirmation emails to the signed-in user's inbox.

---

## Local development (unchanged)

```
npm run install:all
npm run seed --prefix server
npm run dev:server      # http://localhost:5000
npm run dev:client      # http://localhost:5173
```

Locally, email uses a free **Ethereal** test inbox and logs a preview link for
every message — no Gmail setup needed.
