const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendWelcomeEmail, sendLoginAlert } = require('../services/emailService');

function genReferralCode(name = '') {
  const base = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CINE';
  // deterministic-ish suffix from clerkId is added by caller; here use length+rand-free
  return base;
}

/**
 * POST /api/users/sync
 * Upsert a user from Clerk on sign-in. Sends a welcome email on first creation
 * and a login alert on subsequent sign-ins. body: { clerkId, email, firstName,
 * lastName, profileImage, device, referredBy }
 */
const syncUser = asyncHandler(async (req, res) => {
  const { clerkId, email, firstName, lastName, profileImage, device, referredBy } = req.body;
  if (!clerkId || !email) {
    res.status(400);
    throw new Error('clerkId and email are required.');
  }

  let user = await User.findOne({ clerkId });
  const isNew = !user;

  if (isNew) {
    user = await User.create({
      clerkId,
      email,
      firstName,
      lastName,
      profileImage,
      referredBy,
      referralCode: `${genReferralCode(firstName)}${clerkId.slice(-4).toUpperCase()}`,
      lastLogin: new Date(),
    });

    // Referral bonus
    if (referredBy) {
      await User.findOneAndUpdate({ referralCode: referredBy }, { $inc: { loyaltyPoints: 200 } });
      user.loyaltyPoints += 100;
      await user.save();
    }

    sendWelcomeEmail({ to: email, name: firstName }); // fire-and-forget
  } else {
    // Throttle login alerts: /sync fires on every page load / session restore,
    // and alerting each one floods the shared Brevo sending domain — Gmail then
    // rate-limits (421 4.7.28) and defers ALL our mail, including booking
    // confirmations. One alert per 12h keeps the signal without the flood.
    const prevLogin = user.lastLogin;
    user.email = email;
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.profileImage = profileImage ?? user.profileImage;
    user.lastLogin = new Date();
    await user.save();

    const LOGIN_ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000;
    if (!prevLogin || Date.now() - new Date(prevLogin).getTime() > LOGIN_ALERT_COOLDOWN_MS) {
      // Login alert (fire-and-forget)
      sendLoginAlert({
        to: email,
        name: firstName || user.firstName,
        when: new Date().toLocaleString(),
        device,
      });
    }
  }

  res.json({ user, isNew });
});

/** GET /api/users/:clerkId — profile + loyalty. */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ clerkId: req.params.clerkId }).lean();
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json(user);
});

module.exports = { syncUser, getProfile };
