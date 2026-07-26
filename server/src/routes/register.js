const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { buildDisplayName } = require('../utils/userName');

router.post('/', async (req, res) => {
  try {
    const { phone, password, ageGroup, goal, firstName, lastName } = req.body;
    if (!phone || !password || !ageGroup || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = buildDisplayName(firstName, lastName) || phone;
    const supabase = req.app.get('supabase');
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await supabase
      .from('User')
      .insert({ email: phone, name: displayName, password: hashedPassword, agegroup: ageGroup, goal })
      .select('id, name')
      .maybeSingle();
    if (error) throw error;
    const resolvedFirstName = String(firstName || '').trim() || null;
    const resolvedLastName = String(lastName || '').trim() || null;
    return res.status(201).json({
      id: data?.id,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router; 