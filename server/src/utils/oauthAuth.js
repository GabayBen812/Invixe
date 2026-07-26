const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const { parseUserName, buildDisplayName } = require('../utils/userName');

const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
].filter(Boolean);

const APPLE_BUNDLE_ID =
  process.env.APPLE_BUNDLE_ID || 'com.gabayben812.invixeapp';

function getSupabase(req) {
  const supabase = req.app.get('supabase');
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

async function getUserRowByEmail(email, supabase) {
  const { data: user, error } = await supabase
    .from('User')
    .select('id, email, name, agegroup, goal')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return user || null;
}

function formatAuthResponse(user) {
  const { firstName, lastName } = parseUserName(user);
  return {
    id: user.id,
    phone: user.email,
    firstName,
    lastName,
    ageGroup: user.agegroup ?? user.ageGroup,
    goal: user.goal,
  };
}

async function upsertOAuthUser(supabase, {
  email,
  firstName,
  lastName,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    const err = new Error('Invalid email from provider');
    err.status = 400;
    throw err;
  }

  const existing = await getUserRowByEmail(normalizedEmail, supabase);
  if (existing) {
    const displayName = buildDisplayName(firstName, lastName);
    if (displayName && (!existing.name || existing.name === normalizedEmail)) {
      await supabase
        .from('User')
        .update({ name: displayName })
        .eq('id', existing.id);
      existing.name = displayName;
    }
    return existing;
  }

  const randomPassword = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  const displayName =
    buildDisplayName(firstName, lastName) ||
    normalizedEmail.split('@')[0] ||
    normalizedEmail;

  const { data, error } = await supabase
    .from('User')
    .insert({
      email: normalizedEmail,
      name: displayName,
      password: hashedPassword,
      agegroup: 'לא צוין',
      goal: 'לא צוין',
    })
    .select('id, email, name, agegroup, goal')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function verifyGoogleIdToken(idToken) {
  if (!GOOGLE_CLIENT_IDS.length) {
    const err = new Error('Google auth is not configured on the server');
    err.status = 503;
    throw err;
  }

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    const err = new Error('Google account is missing an email');
    err.status = 400;
    throw err;
  }
  if (payload.email_verified === false) {
    const err = new Error('Google email is not verified');
    err.status = 401;
    throw err;
  }

  return {
    email: payload.email,
    firstName: payload.given_name || null,
    lastName: payload.family_name || null,
  };
}

async function verifyAppleIdentityToken(identityToken) {
  const payload = await appleSignin.verifyIdToken(identityToken, {
    audience: APPLE_BUNDLE_ID,
    ignoreExpiration: false,
  });

  const email = payload.email;
  if (!email) {
    const err = new Error('Apple account is missing an email');
    err.status = 400;
    throw err;
  }

  return {
    email,
    firstName: null,
    lastName: null,
  };
}

module.exports = {
  getSupabase,
  formatAuthResponse,
  upsertOAuthUser,
  verifyGoogleIdToken,
  verifyAppleIdentityToken,
};
