import express from 'express';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { tier } = req.body;

    if (tier !== 'PREMIUM') {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Mock Stripe checkout session
    const session = {
      id: `cs_mock_${Date.now()}`,
      url: `https://checkout.stripe.com/mock/${Date.now()}`,
      customer: req.user.id,
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/subscription/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/subscription/cancel`
    };

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Mock webhook handler for Stripe events
    const event = req.body;
    const db = getDB();

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await db.collection('User').updateOne(
          { _id: new ObjectId(session.customer) },
          {
            $set: {
              subscriptionTier: 'PREMIUM',
              subscriptionId: session.subscription,
              subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date()
            }
          }
        );
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await db.collection('User').updateMany(
          { subscriptionId: subscription.id },
          {
            $set: {
              subscriptionTier: 'FREE',
              subscriptionId: null,
              subscriptionEnd: null,
              updatedAt: new Date()
            }
          }
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cancel', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('User').findOne({ _id: new ObjectId(req.user.id) });

    if (user.subscriptionTier !== 'PREMIUM') {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Mock cancellation
    await db.collection('User').updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          subscriptionTier: 'FREE',
          subscriptionId: null,
          subscriptionEnd: null,
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
