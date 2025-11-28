import express from 'express';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('User')
      .find({}, { projection: { password: 0, refreshToken: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, subscriptionTier } = req.body;
    const db = getDB();

    await db.collection('User').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role, subscriptionTier, updatedAt: new Date() } }
    );

    const user = await db.collection('User').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0, refreshToken: 0 } }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    await db.collection('User').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
