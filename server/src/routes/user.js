const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient(req) {
  return req?.app?.get('supabase') || null;
}

async function resolveUser(req, email) {
  const supabase = getSupabaseClient(req);
  if (!supabase) throw new Error('Supabase not configured');
  if (email) {
    return getUserByEmail(email, supabase);
  }
  return getDefaultUser(supabase);
}

// Helper: get user by email
async function getUserByEmail(email, supabaseIn) {
  const supabase =
    supabaseIn ||
    (globalThis.__supabase_for_router && globalThis.__supabase_only
      ? globalThis.__supabase_for_router
      : null);
  if (supabase) {
    const { data: user, error } = await supabase
      .from('User')
      .select('id, email, coins, lightnings')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
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

// Helper: get default user (for backward compatibility)
async function getDefaultUser(supabaseIn) {
  const supabase =
    supabaseIn ||
    (globalThis.__supabase_for_router && globalThis.__supabase_only
      ? globalThis.__supabase_for_router
      : null);
  if (supabase) {
    const { data: user, error } = await supabase
      .from('User')
      .select('id, email, coins, lightnings')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
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

// GET user progress, coins, and lightnings
router.get('/progress', async (req, res) => {
  try {
    const email = req.query.email;
    let user;
    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const completedLessons = user.progress.filter(p => p.completed).map(p => Number(p.lessonId));
    
    // Convert lesson attempts from database format to frontend format
    const lessonAttempts = user.lessonAttempts ? user.lessonAttempts.map(attempt => ({
      lessonId: Number(attempt.lessonId),
      completed: attempt.completed,
      lastAttempted: new Date(attempt.lastAttempted),
      attempts: attempt.attempts
    })) : [];
    
    res.json({
      completedLessons,
      lessonAttempts,
      coins: user.coins || 0,
      lightnings: user.lightnings || 0,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update progress
router.post('/progress', async (req, res) => {
  try {
    const { email, completedLessons } = req.body;
    
    let user;
    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const supabase = req.app.get('supabase');
    if (supabase) {
      await supabase.from('Progress').delete().eq('userid', user.id);
      if (completedLessons && completedLessons.length > 0) {
        const rows = completedLessons.map((lessonId) => ({ userid: user.id, lessonid: String(lessonId), completed: true }));
        const { error } = await supabase.from('Progress').insert(rows);
        if (error) throw error;
      }
      return res.json({ success: true });
    }
    throw new Error('Supabase not configured');
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update lesson attempts
router.post('/lesson-attempts', async (req, res) => {
  try {
    const { email, lessonAttempts } = req.body;
    
    let user;
    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const supabase = req.app.get('supabase');
    if (supabase) {
      await supabase.from('LessonAttempt').delete().eq('userid', user.id);
      if (lessonAttempts && lessonAttempts.length > 0) {
        const rows = lessonAttempts.map(attempt => ({ userid: user.id, lessonid: String(attempt.lessonId), completed: !!attempt.completed, lastattempted: new Date(attempt.lastAttempted), attempts: attempt.attempts }));
        const { error } = await supabase.from('LessonAttempt').insert(rows);
        if (error) throw error;
      }
      return res.json({ success: true });
    }
    throw new Error('Supabase not configured');
  } catch (error) {
    console.error('Error updating lesson attempts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update coins and lightnings
router.post('/currency', async (req, res) => {
  try {
    const { email, coins, lightnings } = req.body;
    
    let user;
    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const supabase = req.app.get('supabase');
    if (supabase) {
      const payload = {
        ...(typeof coins === 'number' ? { coins } : {}),
        ...(typeof lightnings === 'number' ? { lightnings } : {}),
      };
      const { error } = await supabase.from('User').update(payload).eq('id', user.id);
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
    
    if (typeof coins !== 'number' || coins <= 0) {
      return res.status(400).json({ error: 'Invalid coins amount' });
    }
    
    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
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
    let user;
    globalThis.__supabase_for_router = req.app.get('supabase') || null;
    globalThis.__supabase_only = !!req.app.get('SUPABASE_ONLY');
    
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
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

module.exports = router; 