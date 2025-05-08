import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { phone, password, ageGroup, goal } = req.body as {
      phone: string;
      password: string;
      ageGroup: string;
      goal: string;
    };
    if (!phone || !password || !ageGroup || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: phone, // using phone as email for now
        name: phone,
        password: hashedPassword,
        ageGroup,
        goal,
      },
    });
    res.status(201).json({ id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router; 