// 1. Live Auction System (Real-time bidding during shows)
export const createAuctionTables = `
  CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    starting_bid NUMERIC(10, 2) NOT NULL,
    current_bid NUMERIC(10, 2),
    highest_bidder_id UUID REFERENCES profiles(id),
    auction_start TIMESTAMP NOT NULL,
    auction_end TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'sold')),
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES profiles(id),
    bid_amount NUMERIC(10, 2) NOT NULL,
    placed_at TIMESTAMP DEFAULT NOW()
  );
`

// 2. Creator Partnerships & Affiliate System (Unique to this platform)
export const createPartnershipTables = `
  CREATE TABLE IF NOT EXISTS creator_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    commission_rate NUMERIC(5, 2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    total_earnings NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES creator_partnerships(id),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    click_time TIMESTAMP DEFAULT NOW(),
    conversion BOOLEAN DEFAULT false,
    commission_earned NUMERIC(10, 2)
  );
`

// 3. Gamification & Loyalty Points
export const createGamificationTables = `
  CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    last_purchase TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    transaction_date TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW()
  );
`

// 4. Social Features (Following, Collections, Wishlist)
export const createSocialTables = `
  CREATE TABLE IF NOT EXISTS user_follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
  );
  
  CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  );
  
  CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW()
  );
`

// 5. Analytics & Insights Dashboard
export const createAnalyticsTables = `
  CREATE TABLE IF NOT EXISTS show_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    hourly_viewers INTEGER,
    total_conversions INTEGER,
    total_revenue NUMERIC(12, 2),
    engagement_rate NUMERIC(5, 2),
    peak_viewer_time TIMESTAMP,
    recorded_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS seller_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales NUMERIC(12, 2),
    units_sold INTEGER,
    unique_customers INTEGER,
    avg_order_value NUMERIC(10, 2),
    PRIMARY KEY (seller_id, date)
  );
`

// 6. Live Interactions & Polls/Questions
export const createInteractionTables = `
  CREATE TABLE IF NOT EXISTS live_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES live_polls(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL,
    vote_count INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(option_id, user_id)
  );
`

// 7. Host Verification & Trust Score
export const createTrustTables = `
  CREATE TABLE IF NOT EXISTS host_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    trust_score INTEGER DEFAULT 0,
    total_shows INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    customer_satisfaction NUMERIC(3, 2),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
`
