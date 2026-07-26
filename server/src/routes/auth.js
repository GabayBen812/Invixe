const express = require('express');
const router = express.Router();
const {
  getSupabase,
  formatAuthResponse,
  upsertOAuthUser,
  verifyGoogleIdToken,
  verifyAppleIdentityToken,
} = require('../utils/oauthAuth');

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const profile = await verifyGoogleIdToken(idToken);
    const supabase = getSupabase(req);
    const user = await upsertOAuthUser(supabase, profile);
    return res.json(formatAuthResponse(user));
  } catch (error) {
    console.error('Google auth failed:', error);
    const status = error.status || 401;
    return res.status(status).json({
      error: error.message || 'Google authentication failed',
    });
  }
});

router.post('/apple', async (req, res) => {
  try {
    const { identityToken, firstName, lastName } = req.body;
    if (!identityToken) {
      return res.status(400).json({ error: 'identityToken is required' });
    }

    const profile = await verifyAppleIdentityToken(identityToken);
    const supabase = getSupabase(req);
    const user = await upsertOAuthUser(supabase, {
      ...profile,
      firstName: firstName || profile.firstName,
      lastName: lastName || profile.lastName,
    });
    return res.json(formatAuthResponse(user));
  } catch (error) {
    console.error('Apple auth failed:', error);
    const status = error.status || 401;
    return res.status(status).json({
      error: error.message || 'Apple authentication failed',
    });
  }
});

module.exports = router;
