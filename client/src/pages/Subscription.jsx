import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Check, Crown } from 'lucide-react';

export default function Subscription() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: () => subscriptionAPI.createCheckoutSession('PREMIUM'),
    onSuccess: (response) => {
      window.location.href = response.data.url;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionAPI.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    }
  });

  const features = {
    free: [
      'Ad-supported playback',
      'Standard audio quality (128kbps)',
      'Limited skips (6 per hour)',
      'Online streaming only'
    ],
    premium: [
      'Ad-free playback',
      'High audio quality (320kbps)',
      'Unlimited skips',
      'Offline downloads',
      'Crossfade playback',
      'Early access to new features'
    ]
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
      <p className="text-dark-400 mb-12">Upgrade to Premium for the best music experience</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-dark-400">/month</span></p>

          <ul className="space-y-3 mb-8">
            {features.free.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {user?.subscriptionTier === 'FREE' && (
            <div className="btn-secondary w-full text-center cursor-default">
              Current Plan
            </div>
          )}
        </div>

        {/* Premium Plan */}
        <div className="card border-2 border-primary-600 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </div>

          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Crown className="text-yellow-500" />
            Premium
          </h2>
          <p className="text-4xl font-bold mb-6">
            $9.99<span className="text-lg text-dark-400">/month</span>
          </p>

          <ul className="space-y-3 mb-8">
            {features.premium.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {user?.subscriptionTier === 'PREMIUM' ? (
            <div>
              <div className="btn-primary w-full text-center cursor-default mb-3">
                Current Plan
              </div>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="btn-secondary w-full"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="btn-primary w-full"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-dark-900 rounded-lg border border-dark-800">
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Can I cancel anytime?</h4>
            <p className="text-dark-400">Yes, you can cancel your Premium subscription at any time. You'll continue to have Premium benefits until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">What payment methods do you accept?</h4>
            <p className="text-dark-400">We accept all major credit cards, debit cards, and PayPal through our secure payment processor Stripe.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Can I download songs for offline listening?</h4>
            <p className="text-dark-400">Yes, Premium subscribers can download unlimited songs for offline playback on any device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
