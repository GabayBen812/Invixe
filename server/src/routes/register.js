const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
  try {
    const { phone, password, ageGroup, goal } = req.body;
    if (!phone || !password || !ageGroup || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const supabase = req.app.get('supabase');
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await supabase
      .from('User')
      .insert({ email: phone, name: phone, password: hashedPassword, agegroup: ageGroup, goal })
      .select('id')
      .maybeSingle();
    if (error) throw error;
    return res.status(201).json({ id: data?.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router; 