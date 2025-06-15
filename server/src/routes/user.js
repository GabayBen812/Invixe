const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: get user by email (for now, use req.query.email or req.body.email)
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email }, include: { progress: true } });
}

// GET user progress, coins, and lightnings
router.get('/progress', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const completedLessons = user.progress.filter(p => p.completed).map(p => Number(p.lessonId));
  res.json({
    completedLessons,
    coins: user.coins || 0,
    lightnings: user.lightnings || 0,
  });
});

// POST update user progress
router.post('/progress', async (req, res) => {
  const { email, completedLessons } = req.body;
  if (!email || !Array.isArray(completedLessons)) {
    return res.status(400).json({ error: 'Missing email or completedLessons' });
  }
  const user = await getUserByEmail(email);
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
});

// POST update coins and lightnings
router.post('/currency', async (req, res) => {
  const { email, coins, lightnings } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await prisma.user.update({
    where: { email },
    data: {
      coins: typeof coins === 'number' ? coins : user.coins,
      lightnings: typeof lightnings === 'number' ? lightnings : user.lightnings,
    },
  });
  res.json({ success: true });
});

module.exports = router; 