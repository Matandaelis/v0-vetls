/**
 * Enhanced Stripe subscription management
 * Supports recurring payments, subscription tiers, and usage-based billing
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface SubscriptionTier {
  id: string
  name: string
  priceId: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    maxProducts?: number
    maxShows?: number
    maxViewers?: number
    commission?: number
  }
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    price: 29,
    interval: 'month',
    features: [
      'Up to 10 products',
      'Up to 5 live shows per month',
      'Max 100 concurrent viewers',
      'Basic analytics',
    ],
    limits: {
      maxProducts: 10,
      maxShows: 5,
      maxViewers: 100,
      commission: 5,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    price: 99,
    interval: 'month',
    features: [
      'Up to 100 products',
      'Unlimited live shows',
      'Max 500 concurrent viewers',
      'Advanced analytics',
      'Priority support',
    ],
    limits: {
      maxProducts: 100,
      maxViewers: 500,
      commission: 3,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited products',
      'Unlimited live shows',
      'Unlimited concurrent viewers',
      'Custom analytics',
      '24/7 dedicated support',
      'White-label options',
    ],
    limits: {
      commission: 2,
    },
  },
]

/**
 * Create a subscription for a customer
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    })

    return subscription
  } catch (error) {
    console.error('Create subscription error:', error)
    throw new Error('Failed to create subscription')
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    throw new Error('Failed to update subscription')
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
  } catch (error) {
    console.error('Reactivate subscription error:', error)
    throw new Error('Failed to reactivate subscription')
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'latest_invoice'],
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    throw new Error('Failed to get subscription')
  }
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    })

    return subscriptions.data
  } catch (error) {
    console.error('List subscriptions error:', error)
    throw new Error('Failed to list subscriptions')
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session.url
  } catch (error) {
    console.error('Create portal session error:', error)
    throw new Error('Failed to create billing portal session')
  }
}

/**
 * Create usage record for metered billing
 */
export async function createUsageRecord(
  subscriptionItemId: string,
  quantity: number,
  timestamp?: number
): Promise<Stripe.UsageRecord> {
  try {
    return await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    )
  } catch (error) {
    console.error('Create usage record error:', error)
    throw new Error('Failed to create usage record')
  }
}

/**
 * Get usage records for a subscription item
 */
export async function listUsageRecords(
  subscriptionItemId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Stripe.UsageRecord[]> {
  try {
    const params: any = {
      limit: 100,
    }

    if (startDate) {
      params.starting_after = Math.floor(startDate.getTime() / 1000)
    }
    if (endDate) {
      params.ending_before = Math.floor(endDate.getTime() / 1000)
    }

    const records = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      params
    )

    return records.data as any[]
  } catch (error) {
    console.error('List usage records error:', error)
    throw new Error('Failed to list usage records')
  }
}

/**
 * Handle subscription webhook events
 */
export async function handleSubscriptionWebhook(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(subscription)
      break
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(subscription)
      break
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(subscription)
      break
    
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(subscription)
      break
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  // Update user's subscription status in database
  console.log('Subscription created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  // Update user's subscription details in database
  console.log('Subscription updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // Downgrade user to free tier
  console.log('Subscription deleted:', subscription.id)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
  // Send notification to user about trial ending
  console.log('Trial will end:', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Record successful payment
  console.log('Payment succeeded:', invoice.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Send notification to user about failed payment
  console.log('Payment failed:', invoice.id)
}

/**
 * Get subscription tier by price ID
 */
export function getSubscriptionTierByPriceId(priceId: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(tier => tier.priceId === priceId)
}

/**
 * Check if user has reached subscription limit
 */
export function hasReachedLimit(
  tier: SubscriptionTier,
  limitType: keyof SubscriptionTier['limits'],
  currentValue: number
): boolean {
  const limit = tier.limits[limitType]
  if (limit === undefined) return false
  return currentValue >= limit
}
