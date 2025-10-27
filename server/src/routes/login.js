const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Missing phone or password' });
    }
    const supabase = req.app.get('supabase');
    let user;
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      const { data, error } = await supabase
        .from('User')
        .select('id, email, password, agegroup, goal')
        .eq('email', phone)
        .maybeSingle();
      if (error) throw error;
      user = data || null;
    } else {
      user = await prisma.user.findUnique({ where: { email: phone } });
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ id: user.id, phone: user.email, ageGroup: user.agegroup ?? user.ageGroup, goal: user.goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router; 