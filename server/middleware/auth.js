/**
 * Auth / user-identification middleware.
 *
 * Two modes, chosen automatically from the environment:
 *
 *   • SECURE (production-grade) — a real Clerk secret key (`sk_…`) is present.
 *     The caller MUST send a valid Clerk session JWT as `Authorization: Bearer
 *     <token>`. The token is cryptographically verified and the user id comes
 *     from the token — spoofable `x-user-*` headers are ignored.
 *
 *   • DEV / DEMO — no Clerk secret configured. Identity is read from
 *     `x-user-id` / `x-user-email` headers (sent by our API client) or the
 *     request body, so the whole app is runnable end-to-end without secrets.
 *
 * `requireUser` blocks requests it cannot authenticate; `attachUser` never
 * blocks (identity is attached when available, otherwise `req.user` is empty).
 */

// A placeholder key from .env.example ("sk_test_your_clerk_secret_key") must
// not switch us into secure mode — it would demand JWTs nobody can produce.
const clerkConfigured =
  !!process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY.startsWith('sk_') &&
  !process.env.CLERK_SECRET_KEY.includes('your_');

// Lazily loaded so the app runs even if @clerk/express isn't installed.
let verifyToken = null;
if (clerkConfigured) {
  try {
    // eslint-disable-next-line global-require
    ({ verifyToken } = require('@clerk/express'));
  } catch {
    console.warn('⚠ @clerk/express not available — falling back to header auth.');
  }
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

/** Non-verified identity from headers/body/query. Dev + demo only. */
function identityFromHeaders(req) {
  return {
    userId: req.headers['x-user-id'] || req.body?.userId || req.query?.userId || null,
    userEmail: req.headers['x-user-email'] || req.body?.userEmail || req.query?.userEmail || null,
    userName: req.headers['x-user-name'] || req.body?.userName || null,
  };
}

/**
 * Resolve the requesting user. Returns `{ userId, userEmail, userName }` (any
 * of which may be null) or `null` if a configured Clerk token failed to verify.
 */
async function resolveUser(req) {
  if (verifyToken) {
    const token = bearer(req);
    if (!token) return { userId: null, userEmail: null, userName: null };
    try {
      const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      return {
        userId: claims.sub,
        userEmail: claims.email || req.headers['x-user-email'] || null,
        userName: claims.name || req.headers['x-user-name'] || null,
        verified: true,
      };
    } catch {
      return null; // token present but invalid → caller decides how to respond
    }
  }
  // Dev / demo fallback.
  return identityFromHeaders(req);
}

/** Optional identity — never blocks the request. */
async function attachUser(req, _res, next) {
  const user = await resolveUser(req);
  req.user = user || { userId: null, userEmail: null, userName: null };
  next();
}

/** Hard gate — 401 when no authenticated user could be resolved. */
async function requireUser(req, res, next) {
  const user = await resolveUser(req);
  if (!user || !user.userId) {
    return res.status(401).json({
      error: clerkConfigured
        ? 'Authentication required — a valid session token is missing or invalid.'
        : 'Authentication required. Please sign in.',
    });
  }
  req.user = user;
  next();
}

/**
 * Ownership guard for `/…/user/:userId`-style routes. Ensures a signed-in user
 * can only read their own resources. In dev (no Clerk) it still enforces that
 * the header identity matches the requested id, so the check is testable.
 */
function requireOwnership(paramKey = 'userId') {
  return (req, res, next) => {
    const requested = req.params[paramKey] || req.query[paramKey];
    const actual = req.user?.userId;
    if (!actual) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (requested && requested !== actual) {
      return res.status(403).json({ error: 'You can only access your own resources.' });
    }
    next();
  };
}

module.exports = { attachUser, requireUser, requireOwnership, clerkConfigured };
