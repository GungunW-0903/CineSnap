/**
 * Auth / user-identification middleware.
 *
 * The frontend authenticates with Clerk. For a smooth dev/demo experience this
 * middleware identifies the requesting user from, in order of preference:
 *   1. Clerk session (when @clerk/express is configured and a token is sent)
 *   2. `x-user-id` / `x-user-email` headers (sent by our API client)
 *   3. the request body (userId / userEmail)
 *
 * `requireUser` rejects requests with no identifiable user; `attachUser` is
 * optional and never blocks.
 */

let clerkClient = null;
try {
  if (process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY.startsWith('sk_')) {
    // Only wire Clerk when a real secret key is present.
    // eslint-disable-next-line global-require
    clerkClient = require('@clerk/express');
  }
} catch {
  clerkClient = null;
}

function extractFromRequest(req) {
  const userId =
    req.headers['x-user-id'] || req.body?.userId || req.query?.userId || req.auth?.userId || null;
  const userEmail =
    req.headers['x-user-email'] || req.body?.userEmail || req.query?.userEmail || null;
  const userName = req.headers['x-user-name'] || req.body?.userName || null;
  return { userId, userEmail, userName };
}

function attachUser(req, _res, next) {
  req.user = extractFromRequest(req);
  next();
}

function requireUser(req, res, next) {
  const user = extractFromRequest(req);
  if (!user.userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  req.user = user;
  next();
}

module.exports = { attachUser, requireUser, clerkConfigured: !!clerkClient };
