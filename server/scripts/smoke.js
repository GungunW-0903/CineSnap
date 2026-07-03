/**
 * End-to-end smoke test for the CineSnap API.
 *
 * Exercises the whole booking lifecycle against a RUNNING server, with no
 * external secrets required (uses the dev-confirm payment path):
 *
 *   health → movies → shows → auth gate → create booking → seat conflict
 *   → ownership gate → simulated payment → loyalty award → my bookings
 *   → cancel/refund → seats released
 *
 * Usage:
 *   1. Start the API:   npm run dev   (or npm start)
 *   2. In another tab:  npm run smoke
 *
 * Override the target with API_URL, e.g.  API_URL=http://localhost:5000/api npm run smoke
 */

const BASE = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Tiny ANSI helpers (no deps).
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const USER = { id: `smoke_${Date.now()}`, email: `smoke_${Date.now()}@cinesnap.test`, name: 'Smoke Tester' };

let passed = 0;
let failed = 0;

function ok(name, extra = '') {
  passed++;
  console.log(`  ${c.green('✓')} ${name}${extra ? c.gray(`  ${extra}`) : ''}`);
}
function bad(name, detail) {
  failed++;
  console.log(`  ${c.red('✗')} ${name}`);
  if (detail) console.log(`      ${c.red(detail)}`);
}
function assert(cond, name, detail) {
  if (cond) ok(name);
  else bad(name, detail);
  return cond;
}

async function api(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    h['x-user-id'] = USER.id;
    h['x-user-email'] = USER.email;
    h['x-user-name'] = USER.name;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  return { status: res.status, data };
}

function firstShowId(showsPayload) {
  // Endpoint returns { movieId, dates: { 'YYYY-MM-DD': [{ showId, time, ticketPrice }] } }
  if (Array.isArray(showsPayload)) return showsPayload[0]?._id || showsPayload[0]?.showId;
  const dates = showsPayload?.dates || {};
  for (const day of Object.keys(dates)) {
    const list = dates[day];
    if (Array.isArray(list) && list.length) return list[0].showId || list[0]._id;
  }
  return null;
}

async function main() {
  console.log(c.bold(`\n🎬 CineSnap API smoke test`));
  console.log(c.gray(`   Target: ${BASE}`));
  console.log(c.gray(`   User:   ${USER.id}\n`));

  // 1. Health -------------------------------------------------------------
  console.log(c.cyan('Health & catalogue'));
  let r = await api('/health', { auth: false });
  if (!assert(r.status === 200 && r.data?.status === 'ok', 'GET /health', `status ${r.status}`)) {
    console.log(c.red('\n  Server not reachable — is it running? (npm run dev)\n'));
    process.exit(1);
  }

  // 2. Movies -------------------------------------------------------------
  r = await api('/movies', { auth: false });
  const movies = Array.isArray(r.data) ? r.data : r.data?.movies;
  assert(r.status === 200 && Array.isArray(movies) && movies.length > 0, 'GET /movies returns catalogue', `count ${movies?.length}`);
  const movie = movies[0];

  // 3. Shows --------------------------------------------------------------
  r = await api(`/shows/movie/${movie._id}`, { auth: false });
  const showId = firstShowId(r.data);
  assert(r.status === 200 && !!showId, 'GET /shows/movie/:id returns showtimes', showId ? `show ${showId}` : 'no shows');

  // 4. Auth gate ----------------------------------------------------------
  console.log(c.cyan('\nAuth gates'));
  r = await api('/bookings', { method: 'POST', auth: false, body: { showId, seats: ['A1'] } });
  assert(r.status === 401, 'POST /bookings without identity → 401', `got ${r.status}`);

  r = await api(`/bookings/user/someone_else`, { method: 'GET' });
  assert(r.status === 403, 'GET another user\'s bookings → 403 (ownership)', `got ${r.status}`);

  // 5. Sync user (so loyalty points can be awarded on payment) ------------
  console.log(c.cyan('\nUser'));
  r = await api('/users/sync', { method: 'POST', auth: false, body: { clerkId: USER.id, email: USER.email, firstName: 'Smoke' } });
  assert(r.status === 200 && r.data?.user?.clerkId === USER.id, 'POST /users/sync upserts profile', r.data?.isNew ? 'new user' : 'existing');

  // 6. Create booking -----------------------------------------------------
  console.log(c.cyan('\nBooking lifecycle'));
  const seats = ['A1', 'A2'];
  r = await api('/bookings', { method: 'POST', body: { showId, seats } });
  const booking = r.data?.booking;
  assert(r.status === 201 && booking?._id, 'POST /bookings creates a booking', booking ? `$${booking.totalAmount}, ${booking.seats.join('+')}` : r.data?.error);

  // 7. Seat conflict ------------------------------------------------------
  r = await api('/bookings', { method: 'POST', body: { showId, seats: ['A2'] } });
  assert(r.status === 409, 'Re-booking a taken seat → 409 conflict', `got ${r.status}`);

  // 8. Simulated payment --------------------------------------------------
  console.log(c.cyan('\nPayment (dev-confirm) & loyalty'));
  r = await api('/payment/dev-confirm', { method: 'POST', body: { bookingId: booking?._id } });
  const paid = r.data?.booking;
  assert(r.status === 200 && paid?.paymentStatus === 'completed', 'POST /payment/dev-confirm completes payment', `status ${paid?.paymentStatus}`);

  // 9. Loyalty awarded (10 pts per dollar) --------------------------------
  r = await api(`/users/${USER.id}`, { auth: false });
  const expectedPts = Math.round((booking?.totalAmount || 0) * 10);
  assert(r.status === 200 && r.data?.loyaltyPoints === expectedPts, 'Loyalty points awarded on payment', `${r.data?.loyaltyPoints} pts (expected ${expectedPts})`);

  // 10. My bookings -------------------------------------------------------
  r = await api(`/bookings/user/${USER.id}`);
  const mine = Array.isArray(r.data) ? r.data : [];
  const found = mine.find((b) => b._id === booking?._id);
  assert(r.status === 200 && !!found && found.paymentStatus === 'completed', 'GET /bookings/user/:id lists paid booking', `${mine.length} booking(s)`);

  // 11. Cancel / refund ---------------------------------------------------
  console.log(c.cyan('\nCancellation'));
  r = await api(`/bookings/${booking?._id}/cancel`, { method: 'PATCH' });
  assert(r.status === 200 && r.data?.booking?.status === 'cancelled' && r.data?.booking?.paymentStatus === 'refunded', 'PATCH /bookings/:id/cancel refunds & cancels', `${r.data?.booking?.status}/${r.data?.booking?.paymentStatus}`);

  // 12. Seats released ----------------------------------------------------
  r = await api('/bookings', { method: 'POST', body: { showId, seats } });
  assert(r.status === 201, 'Seats freed after cancel (re-bookable)', `got ${r.status}`);
  if (r.data?.booking?._id) {
    await api(`/bookings/${r.data.booking._id}/cancel`, { method: 'PATCH' }); // cleanup
  }

  // Summary ---------------------------------------------------------------
  console.log(
    `\n${failed === 0 ? c.green(c.bold('✔ ALL PASSED')) : c.red(c.bold('✗ FAILURES'))}  ` +
      `${c.green(passed + ' passed')}${failed ? ', ' + c.red(failed + ' failed') : ''}\n`
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(c.red(`\nSmoke test crashed: ${err.message}\n`));
  process.exit(1);
});
