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

// POST update progress
router.post('/progress', async (req, res) => {
  try {
    const { email, completedLessons } = req.body;
    
    let user;
    if (email) {
      user = await getUserByEmail(email);
    } else {
      user = await getDefaultUser();
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Clear existing progress
    await prisma.progress.deleteMany({
      where: { userId: user.id }
    });
    
    // Add new completed lessons
    if (completedLessons && completedLessons.length > 0) {
      const progressData = completedLessons.map(lessonId => ({
        userId: user.id,
        lessonId: lessonId.toString(),
        completed: true
      }));
      
      await prisma.progress.createMany({
        data: progressData
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

// GET portfolio
router.get('/portfolio', async (req, res) => {
  try {
    let user = await getDefaultUser();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST buy stock
router.post('/portfolio/buy', async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    // Parse shares and price as floats
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);

    if (!symbol || isNaN(sharesNum) || isNaN(priceNum)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    if (sharesNum <= 0 || priceNum <= 0) {
      return res.status(400).json({ error: 'Invalid shares or price' });
    }

    let user = await getDefaultUser();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalCost = sharesNum * priceNum;
    if (user.coins < totalCost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Check if user already has this stock
    const existingHolding = await prisma.portfolio.findFirst({
      where: { userId: user.id, symbol }
    });

    if (existingHolding) {
      // Update existing holding
      const newShares = existingHolding.shares + sharesNum;
      const newAvgPrice = ((existingHolding.shares * existingHolding.avgPrice) + (sharesNum * priceNum)) / newShares;

      await prisma.portfolio.update({
        where: { id: existingHolding.id },
        data: { shares: newShares, avgPrice: newAvgPrice }
      });
    } else {
      // Create new holding
      await prisma.portfolio.create({
        data: { userId: user.id, symbol, shares: sharesNum, avgPrice: priceNum }
      });
    }

    // Deduct coins
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: user.coins - totalCost }
    });

    res.json({ 
      success: true, 
      newCoins: user.coins - totalCost,
      coinsSpent: totalCost
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST sell stock
router.post('/portfolio/sell', async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    // Parse shares and price as floats
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);

    if (!symbol || isNaN(sharesNum) || isNaN(priceNum)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    if (sharesNum <= 0 || priceNum <= 0) {
      return res.status(400).json({ error: 'Invalid shares or price' });
    }

    let user = await getDefaultUser();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const holding = await prisma.portfolio.findFirst({
      where: { userId: user.id, symbol }
    });

    if (!holding || holding.shares < sharesNum) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }

    const totalValue = sharesNum * priceNum;
    const newShares = holding.shares - sharesNum;

    if (newShares === 0) {
      // Delete holding if no shares left
      await prisma.portfolio.delete({
        where: { id: holding.id }
      });
    } else {
      // Update holding
      await prisma.portfolio.update({
        where: { id: holding.id },
        data: { shares: newShares }
      });
    }

    // Add coins
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: user.coins + totalValue }
    });

    res.json({ 
      success: true, 
      newCoins: user.coins + totalValue,
      coinsEarned: totalValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 