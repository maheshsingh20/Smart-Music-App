import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../db/mongodb.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = await db.collection('User').findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      subscriptionTier: user.subscriptionTier
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requirePremium = (req, res, next) => {
  if (req.user.subscriptionTier !== 'PREMIUM') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
