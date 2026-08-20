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
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
].filter(Boolean);

const APPLE_BUNDLE_ID =
  process.env.APPLE_BUNDLE_ID || 'com.gabayben812.invixeapp';

const UNSET_PROFILE = 'לא צוין';

function getSupabase(req) {
  const supabase = req.app.get('supabase');
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

async function getUserRowByEmail(email, supabase) {
  const { data: user, error } = await supabase
    .from('User')
    .select('id, email, name, agegroup, goal, apple_sub, google_sub')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return user || null;
}

async function getUserRowByAppleSub(appleSub, supabase) {
  if (!appleSub) return null;
  const { data: user, error } = await supabase
    .from('User')
    .select('id, email, name, agegroup, goal, apple_sub, google_sub')
    .eq('apple_sub', appleSub)
    .maybeSingle();
  if (error) {
    if (String(error.message || '').includes('apple_sub')) return null;
    throw error;
  }
  return user || null;
}

async function getUserRowByGoogleSub(googleSub, supabase) {
  if (!googleSub) return null;
  const { data: user, error } = await supabase
    .from('User')
    .select('id, email, name, agegroup, goal, apple_sub, google_sub')
    .eq('google_sub', googleSub)
    .maybeSingle();
  if (error) {
    if (String(error.message || '').includes('google_sub')) return null;
    throw error;
  }
  return user || null;
}

function needsOnboarding(user) {
  const ageGroup = user?.agegroup ?? user?.ageGroup;
  const goal = user?.goal;
  return (
    !ageGroup ||
    ageGroup === UNSET_PROFILE ||
    !goal ||
    goal === UNSET_PROFILE
  );
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
    isNewUser: Boolean(user.__isNewUser),
    needsOnboarding: needsOnboarding(user),
  };
}

async function maybeUpdateDisplayName(supabase, user, firstName, lastName) {
  const displayName = buildDisplayName(firstName, lastName);
  if (!displayName || (user.name && user.name !== user.email)) return user;

  const { error } = await supabase
    .from('User')
    .update({ name: displayName })
    .eq('id', user.id);
  if (error) throw error;
  return { ...user, name: displayName };
}

async function upsertOAuthUser(supabase, {
  email,
  firstName,
  lastName,
  appleSub,
  googleSub,
}) {
  if (googleSub) {
    const byGoogle = await getUserRowByGoogleSub(googleSub, supabase);
    if (byGoogle) {
      return maybeUpdateDisplayName(supabase, byGoogle, firstName, lastName);
    }
  }

  if (appleSub) {
    const byApple = await getUserRowByAppleSub(appleSub, supabase);
    if (byApple) {
      return maybeUpdateDisplayName(supabase, byApple, firstName, lastName);
    }
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    const err = new Error(
      appleSub
        ? 'Apple account not linked — sign in with email once or contact support'
        : 'Invalid email from provider',
    );
    err.status = 400;
    throw err;
  }

  const existing = await getUserRowByEmail(normalizedEmail, supabase);
  if (existing) {
    const patch = {};
    if (appleSub && !existing.apple_sub) patch.apple_sub = appleSub;
    if (googleSub && !existing.google_sub) patch.google_sub = googleSub;
    if (Object.keys(patch).length) {
      await supabase.from('User').update(patch).eq('id', existing.id);
      Object.assign(existing, patch);
    }
    return maybeUpdateDisplayName(supabase, existing, firstName, lastName);
  }

  const randomPassword = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  const displayName =
    buildDisplayName(firstName, lastName) ||
    normalizedEmail.split('@')[0] ||
    normalizedEmail;

  const insertRow = {
    email: normalizedEmail,
    name: displayName,
    password: hashedPassword,
    agegroup: UNSET_PROFILE,
    goal: UNSET_PROFILE,
  };
  if (appleSub) insertRow.apple_sub = appleSub;
  if (googleSub) insertRow.google_sub = googleSub;

  const { data, error } = await supabase
    .from('User')
    .insert(insertRow)
    .select('id, email, name, agegroup, goal, apple_sub, google_sub')
    .maybeSingle();

  if (error) {
    if (appleSub || googleSub) {
      delete insertRow.apple_sub;
      delete insertRow.google_sub;
      const retry = await supabase
        .from('User')
        .insert(insertRow)
        .select('id, email, name, agegroup, goal')
        .maybeSingle();
      if (retry.error) throw retry.error;
      return { ...retry.data, __isNewUser: true };
    }
    throw error;
  }

  return { ...data, __isNewUser: true };
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
    googleSub: payload.sub || null,
    appleSub: null,
  };
}

async function verifyAppleIdentityToken(identityToken) {
  const payload = await appleSignin.verifyIdToken(identityToken, {
    audience: APPLE_BUNDLE_ID,
    ignoreExpiration: false,
  });

  return {
    email: payload.email || null,
    firstName: null,
    lastName: null,
    appleSub: payload.sub || null,
    googleSub: null,
  };
}

async function completeOAuthOnboarding(supabase, email, ageGroup, goal) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    const err = new Error('Invalid email');
    err.status = 400;
    throw err;
  }
  if (!ageGroup || !goal) {
    const err = new Error('Missing ageGroup or goal');
    err.status = 400;
    throw err;
  }

  const user = await getUserRowByEmail(normalizedEmail, supabase);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('User')
    .update({ agegroup: ageGroup, goal })
    .eq('id', user.id)
    .select('id, email, name, agegroup, goal, apple_sub, google_sub')
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  getSupabase,
  formatAuthResponse,
  upsertOAuthUser,
  verifyGoogleIdToken,
  verifyAppleIdentityToken,
  completeOAuthOnboarding,
  needsOnboarding,
};
