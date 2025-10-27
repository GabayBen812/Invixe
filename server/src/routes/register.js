const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      const { data, error } = await supabase
        .from('User')
        .insert({ email: phone, name: phone, password: hashedPassword, agegroup: ageGroup, goal })
        .select('id')
        .maybeSingle();
      if (error) throw error;
      return res.status(201).json({ id: data?.id });
    }
    const user = await prisma.user.create({ data: { email: phone, name: phone, password: hashedPassword, ageGroup, goal } });
    return res.status(201).json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router; 