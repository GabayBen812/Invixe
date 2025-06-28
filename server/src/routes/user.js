const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: get user by email (for now, use req.query.email or req.body.email)
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email }, include: { progress: true } });
}

// Helper: get default user (for now, get the first user in the database)
async function getDefaultUser() {
  return prisma.user.findFirst({ include: { progress: true } });
}

// GET user progress, coins, and lightnings
router.get('/progress', async (req, res) => {
  try {
    const email = req.query.email;
    let user;
    
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const completedLessons = user.progress.filter(p => p.completed).map(p => Number(p.lessonId));
    res.json({
      completedLessons,
      coins: user.coins || 0,
      lightnings: user.lightnings || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update user progress
router.post('/progress', async (req, res) => {
  try {
    const { email, completedLessons } = req.body;
    if (!Array.isArray(completedLessons)) {
      return res.status(400).json({ error: 'Missing completedLessons array' });
    }
    
    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Mark all lessons in completedLessons as completed
    for (const lessonId of completedLessons) {
      await prisma.progress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId: String(lessonId) } },
        update: { completed: true },
        create: { userId: user.id, lessonId: String(lessonId), completed: true },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST update coins and lightnings
router.post('/currency', async (req, res) => {
  try {
    const { email, coins, lightnings } = req.body;
    
    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: typeof coins === 'number' ? coins : user.coins,
        lightnings: typeof lightnings === 'number' ? lightnings : user.lightnings,
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add coins after lesson completion
router.post('/add-coins', async (req, res) => {
  try {
    const { coins } = req.body;
    
    if (typeof coins !== 'number' || coins <= 0) {
      return res.status(400).json({ error: 'Invalid coins amount' });
    }
    
    let user = await getDefaultUser();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const newCoins = (user.coins || 0) + coins;
    
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: newCoins },
    });
    
    res.json({ 
      success: true, 
      newCoins,
      coinsAdded: coins 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 