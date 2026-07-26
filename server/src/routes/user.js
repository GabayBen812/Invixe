const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { parseUserName, buildDisplayName } = require('../utils/userName');

function getSupabaseClient(req) {
  return req?.app?.get('supabase') || null;
}

async function resolveUser(req, email) {
  const supabase = getSupabaseClient(req);
  if (!supabase) throw new Error('Supabase not configured');
  if (!email) {
    const err = new Error('email is required');
    err.status = 400;
    throw err;
  }
  return getUserByEmail(email, supabase);
}

async function recordTrade(supabase, {
  userid,
  type,
  symbol,
  shares,
  price,
  total,
}) {
  try {
    const { error } = await supabase.from('TradeHistory').insert({
      userid,
      type,
      symbol,
      shares,
      price,
      total,
    });
    if (error) {
      // Table may not exist yet in some environments — don't fail the trade.
      console.error('Error recording trade history:', error.message || error);
    }
  } catch (error) {
    console.error('Error recording trade history:', error);
  }
}

function resolveSupabase(supabaseIn) {
  return (
    supabaseIn ||
    (globalThis.__supabase_for_router && globalThis.__supabase_only
      ? globalThis.__supabase_for_router
      : null)
  );
}

async function getUserRowByEmail(email, supabaseIn) {
  const supabase = resolveSupabase(supabaseIn);
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user, error } = await supabase
    .from('User')
    .select('id, email, coins, name')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return user || null;
}

// Helper: get user by email (includes progress + attempts for GET)
async function getUserByEmail(email, supabaseIn) {
  const supabase = resolveSupabase(supabaseIn);
  if (supabase) {
    const user = await getUserRowByEmail(email, supabase);
    if (!user) return null;
    const { data: progress } = await supabase
      .from('Progress')
      .select('lessonid, completed')
      .eq('userid', user.id);
    const { data: lessonAttempts } = await supabase
      .from('LessonAttempt')
      .select('lessonid, completed, lastattempted, attempts')
      .eq('userid', user.id);
    return { ...user, progress: (progress||[]).map(p=>({ lessonId: p.lessonid, completed: p.completed })), lessonAttempts: (lessonAttempts||[]).map(a=>({ lessonId: a.lessonid, completed: a.completed, lastAttempted: a.lastattempted, attempts: a.attempts })) };
  }
  throw new Error('Supabase not configured');
}

// GET user progress and cash (persisted as coins)
router.get('/progress', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');

    const user = await getUserByEmail(email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const completedLessons = user.progress.filter(p => p.completed).map(p => Number(p.lessonId));
    
    // Convert lesson attempts from database format to frontend format
    const lessonAttempts = user.lessonAttempts ? user.lessonAttempts.map(attempt => ({
      lessonId: Number(attempt.lessonId),
      completed: attempt.completed,
      lastAttempted: new Date(attempt.lastAttempted),
      attempts: attempt.attempts
    })) : [];
    
    const { firstName, lastName } = parseUserName(user);

    res.json({
      completedLessons,
      lessonAttempts,
      coins: user.coins || 0,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update display name
router.post('/profile', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const trimmedFirst = String(firstName || '').trim();
    const trimmedLast = String(lastName || '').trim();
    if (!trimmedFirst) {
      return res.status(400).json({ error: 'firstName is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    const supabase = req.app.get('supabase');
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getUserRowByEmail(email, supabase);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const displayName = buildDisplayName(trimmedFirst, trimmedLast);
    const { error } = await supabase
      .from('User')
      .update({ name: displayName })
      .eq('id', user.id);
    if (error) throw error;

    return res.json({
      firstName: trimmedFirst,
      lastName: trimmedLast || null,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST permanently delete user account and related data
router.post('/delete-account', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    const supabase = req.app.get('supabase');
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getUserRowByEmail(email, supabase);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const relatedTables = ['TradeHistory', 'Portfolio', 'LessonAttempt', 'Progress'];
    for (const table of relatedTables) {
      const { error } = await supabase.from(table).delete().eq('userid', user.id);
      if (error) {
        console.warn(`Failed deleting ${table} for user ${user.id}:`, error.message || error);
      }
    }

    const { error: userError } = await supabase.from('User').delete().eq('id', user.id);
    if (userError) throw userError;

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update progress (merge — never wipe existing rows)
router.post('/progress', async (req, res) => {
  try {
    const { email, completedLessons } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    const supabase = req.app.get('supabase');
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getUserRowByEmail(email, supabase);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const incoming = [...new Set((completedLessons || []).map((id) => String(id)))];
    if (incoming.length === 0) {
      return res.json({ success: true });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('Progress')
      .select('id, lessonid, completed')
      .eq('userid', user.id);
    if (fetchError) throw fetchError;

    const existingByLesson = new Map(
      (existing || []).map((row) => [String(row.lessonid), row]),
    );
    const toInsert = [];
    const toMarkCompleteIds = [];

    for (const lessonId of incoming) {
      const row = existingByLesson.get(lessonId);
      if (row) {
        if (!row.completed) toMarkCompleteIds.push(row.id);
      } else {
        toInsert.push({
          userid: user.id,
          lessonid: lessonId,
          completed: true,
        });
      }
    }

    if (toMarkCompleteIds.length > 0) {
      const { error } = await supabase
        .from('Progress')
        .update({ completed: true })
        .in('id', toMarkCompleteIds);
      if (error) throw error;
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('Progress').insert(toInsert);
      if (error) throw error;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update lesson attempts (merge per lesson — never wipe all rows)
router.post('/lesson-attempts', async (req, res) => {
  try {
    const { email, lessonAttempts } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    const supabase = req.app.get('supabase');
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getUserRowByEmail(email, supabase);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const incoming = lessonAttempts || [];
    if (incoming.length === 0) {
      return res.json({ success: true });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('LessonAttempt')
      .select('id, lessonid')
      .eq('userid', user.id);
    if (fetchError) throw fetchError;

    const existingByLesson = new Map(
      (existing || []).map((row) => [String(row.lessonid), row]),
    );
    const toInsert = [];
    const updateJobs = [];

    for (const attempt of incoming) {
      const lessonId = String(attempt.lessonId);
      const row = existingByLesson.get(lessonId);
      const payload = {
        completed: !!attempt.completed,
        lastattempted: new Date(attempt.lastAttempted),
        attempts: attempt.attempts,
      };

      if (row) {
        updateJobs.push(
          supabase.from('LessonAttempt').update(payload).eq('id', row.id),
        );
      } else {
        toInsert.push({
          userid: user.id,
          lessonid: lessonId,
          ...payload,
        });
      }
    }

    if (updateJobs.length > 0) {
      const results = await Promise.all(updateJobs);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('LessonAttempt').insert(toInsert);
      if (error) throw error;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating lesson attempts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update cash (persisted as coins)
router.post('/currency', async (req, res) => {
  try {
    const { email, coins } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    const user = await getUserByEmail(email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const supabase = req.app.get('supabase');
    if (supabase) {
      if (typeof coins !== 'number') {
        return res.status(400).json({ error: 'coins is required' });
      }
      const { error } = await supabase.from('User').update({ coins }).eq('id', user.id);
      if (error) throw error;
      return res.json({ success: true });
    }
    throw new Error('Supabase not configured');
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add coins after lesson completion
router.post('/add-coins', async (req, res) => {
  try {
    const { email, coins } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    if (typeof coins !== 'number' || coins <= 0) {
      return res.status(400).json({ error: 'Invalid coins amount' });
    }
    
    const user = await getUserByEmail(email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const newCoins = (user.coins || 0) + coins;
    const supabase = req.app.get('supabase');
    if (supabase) {
      const { error } = await supabase.from('User').update({ coins: newCoins }).eq('id', user.id);
      if (error) throw error;
      return res.json({ success: true, newCoins, coinsAdded: coins });
    }
    throw new Error('Supabase not configured');
  } catch (error) {
    console.error('Error adding coins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET portfolio
router.get('/portfolio', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');

    const user = await getUserByEmail(email);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const supabase = req.app.get('supabase');
    if (supabase) {
      let portfolio = null;
      let error = null;
      // Prefer updated_at, fall back to updatedat, then no order to avoid 42703 crashing the server
      ({ data: portfolio, error } = await supabase
        .from('Portfolio')
        .select('*')
        .eq('userid', user.id)
        .order('updated_at', { ascending: false }));
      if (error && error.code === '42703') {
        ({ data: portfolio, error } = await supabase
          .from('Portfolio')
          .select('*')
          .eq('userid', user.id)
          .order('updatedat', { ascending: false }));
      }
      if (error && error.code === '42703') {
        ({ data: portfolio, error } = await supabase
          .from('Portfolio')
          .select('*')
          .eq('userid', user.id));
      }
      if (error) throw error;
      return res.json({ portfolio });
    }
    throw new Error('Supabase not configured');
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST buy stock
router.post('/portfolio/buy', async (req, res) => {
  try {
    const { email, symbol, shares, price } = req.body;
    const sharesNum = Math.floor(parseFloat(shares));
    const priceNum = parseFloat(price);

    if (!symbol || isNaN(sharesNum) || isNaN(priceNum)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    if (sharesNum <= 0 || priceNum <= 0) {
      return res.status(400).json({ error: 'Invalid shares or price' });
    }

    const user = await resolveUser(req, email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userCoins = Math.floor(Number(user.coins) || 0);
    const totalCost = Math.round(sharesNum * priceNum);
    if (userCoins < totalCost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    const supabase = getSupabaseClient(req);
    const symbolUpper = String(symbol).toUpperCase();

    const { data: existingHolding, error: fetchError } = await supabase
      .from('Portfolio')
      .select('*')
      .eq('userid', user.id)
      .eq('symbol', symbolUpper)
      .maybeSingle();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existingHolding) {
      const existingShares = Number(existingHolding.shares) || 0;
      const existingAvg =
        Number(existingHolding.avgprice ?? existingHolding.avgPrice) || 0;
      const newShares = existingShares + sharesNum;
      const newAvgPrice =
        (existingShares * existingAvg + sharesNum * priceNum) / newShares;

      const { error } = await supabase
        .from('Portfolio')
        .update({ shares: newShares, avgprice: newAvgPrice })
        .eq('id', existingHolding.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('Portfolio').insert({
        userid: user.id,
        symbol: symbolUpper,
        shares: sharesNum,
        avgprice: priceNum,
      });
      if (error) throw error;
    }

    const newCoins = userCoins - totalCost;
    const { error: coinsError } = await supabase
      .from('User')
      .update({ coins: newCoins })
      .eq('id', user.id);
    if (coinsError) throw coinsError;

    await recordTrade(supabase, {
      userid: user.id,
      type: 'buy',
      symbol: symbolUpper,
      shares: sharesNum,
      price: priceNum,
      total: totalCost,
    });

    res.json({
      success: true,
      newCoins,
      coinsSpent: totalCost,
    });
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST sell stock
router.post('/portfolio/sell', async (req, res) => {
  try {
    const { email, symbol, shares, price } = req.body;
    const sharesNum = Math.floor(parseFloat(shares));
    const priceNum = parseFloat(price);

    if (!symbol || isNaN(sharesNum) || isNaN(priceNum)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    if (sharesNum <= 0 || priceNum <= 0) {
      return res.status(400).json({ error: 'Invalid shares or price' });
    }

    const user = await resolveUser(req, email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const supabase = getSupabaseClient(req);
    const symbolUpper = String(symbol).toUpperCase();

    const { data: holding, error: fetchError } = await supabase
      .from('Portfolio')
      .select('*')
      .eq('userid', user.id)
      .eq('symbol', symbolUpper)
      .maybeSingle();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const heldShares = Number(holding?.shares) || 0;
    if (!holding || heldShares < sharesNum) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }

    const totalValue = Math.round(sharesNum * priceNum);
    const newShares = heldShares - sharesNum;
    const userCoins = Math.floor(Number(user.coins) || 0);

    if (newShares === 0) {
      const { error } = await supabase.from('Portfolio').delete().eq('id', holding.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('Portfolio')
        .update({ shares: newShares })
        .eq('id', holding.id);
      if (error) throw error;
    }

    const newCoins = userCoins + totalValue;
    const { error: coinsError } = await supabase
      .from('User')
      .update({ coins: newCoins })
      .eq('id', user.id);
    if (coinsError) throw coinsError;

    await recordTrade(supabase, {
      userid: user.id,
      type: 'sell',
      symbol: symbolUpper,
      shares: sharesNum,
      price: priceNum,
      total: totalValue,
    });

    res.json({
      success: true,
      newCoins,
      coinsEarned: totalValue,
    });
  } catch (error) {
    console.error('Error selling stock:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// GET trade history
router.get('/portfolio/history', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const supabase = req.app.get('supabase');
    if (!supabase) throw new Error('Supabase not configured');

    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit || '50'), 10) || 50, 1),
      200,
    );

    const { data, error } = await supabase
      .from('TradeHistory')
      .select('id, type, symbol, shares, price, total, created_at')
      .eq('userid', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Missing table / schema / RLS — treat as no trades yet.
      console.warn(
        'Trade history unavailable, returning empty list:',
        error.message || error,
      );
      return res.json({ trades: [] });
    }

    const trades = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      symbol: row.symbol,
      shares: Number(row.shares) || 0,
      price: Number(row.price) || 0,
      total: Number(row.total) || 0,
      createdAt: row.created_at,
    }));

    return res.json({ trades });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 