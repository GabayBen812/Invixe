import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body as { phone: string; password: string };
    if (!phone || !password) {
      return res.status(400).json({ error: 'Missing phone or password' });
    }
    const user = await prisma.user.findUnique({ where: { email: phone } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ id: user.id, phone: user.email, ageGroup: user.ageGroup, goal: user.goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router; 