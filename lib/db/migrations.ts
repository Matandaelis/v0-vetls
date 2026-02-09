import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface Migration {
  id: string
  name: string
  sql: string
  checksum: string
}

const migrations: Migration[] = [
  {
    id: "001",
    name: "create_profiles",
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'host', 'admin')),
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        total_sales NUMERIC(10, 2) DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 0,
        verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
      CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    `,
    checksum: "001_profiles",
  },
  {
    id: "002",
    name: "create_shows",
    sql: `
      CREATE TABLE IF NOT EXISTS shows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        thumbnail_url TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
        viewer_count INTEGER DEFAULT 0,
        max_viewers INTEGER,
        room_name VARCHAR(255),
        is_featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        revenue NUMERIC(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view shows" ON shows FOR SELECT USING (true);
      CREATE POLICY "Hosts can create shows" ON shows FOR INSERT WITH CHECK (auth.uid() = host_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'host'));
      CREATE POLICY "Hosts can update own shows" ON shows FOR UPDATE USING (auth.uid() = host_id);
      
      CREATE INDEX idx_shows_host_id ON shows(host_id);
      CREATE INDEX idx_shows_status ON shows(status);
      CREATE INDEX idx_shows_created_at ON shows(created_at);
    `,
    checksum: "002_shows",
  },
  {
    id: "003",
    name: "create_products",
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        sku VARCHAR(100) UNIQUE,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
      CREATE POLICY "Sellers can create products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
      CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
      
      CREATE INDEX idx_products_seller_id ON products(seller_id);
      CREATE INDEX idx_products_category ON products(category);
      CREATE INDEX idx_products_created_at ON products(created_at);
    `,
    checksum: "003_products",
  },
  {
    id: "004",
    name: "create_orders",
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        total_amount NUMERIC(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
        payment_method TEXT,
        shipping_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX idx_orders_user_id ON orders(user_id);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_created_at ON orders(created_at);
    `,
    checksum: "004_orders",
  },
  {
    id: "005",
    name: "create_order_items",
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        seller_id UUID NOT NULL REFERENCES profiles(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR seller_id = auth.uid()
      );
      
      CREATE INDEX idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX idx_order_items_product_id ON order_items(product_id);
    `,
    checksum: "005_order_items",
  },
  {
    id: "006",
    name: "create_cart",
    sql: `
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
      
      ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own cart" ON cart_items FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);
      
      CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
    `,
    checksum: "006_cart",
  },
  {
    id: "007",
    name: "create_chat_messages",
    sql: `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view show chat" ON chat_messages FOR SELECT USING (true);
      CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX idx_chat_messages_show_id ON chat_messages(show_id);
      CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
    `,
    checksum: "007_chat",
  },
  {
    id: "008",
    name: "create_ratings_and_reviews",
    sql: `
      CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
        score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
        title VARCHAR(255),
        comment TEXT,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        CHECK ((product_id IS NOT NULL AND show_id IS NULL) OR (product_id IS NULL AND show_id IS NOT NULL))
      );
      
      ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
      CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX idx_ratings_product_id ON ratings(product_id);
      CREATE INDEX idx_ratings_show_id ON ratings(show_id);
    `,
    checksum: "008_ratings",
  },
  {
    id: "009",
    name: "create_clips",
    sql: `
      CREATE TABLE IF NOT EXISTS clips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration INTEGER,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view clips" ON clips FOR SELECT USING (true);
      CREATE POLICY "Hosts can create clips from own shows" ON clips FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM shows WHERE id = show_id AND host_id = auth.uid())
      );
      
      CREATE INDEX idx_clips_show_id ON clips(show_id);
      CREATE INDEX idx_clips_product_id ON clips(product_id);
    `,
    checksum: "009_clips",
  },
  {
    id: "010",
    name: "create_notifications",
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('follow', 'show_starting', 'restock', 'rating', 'comment', 'purchase', 'sale')),
        title VARCHAR(255) NOT NULL,
        message TEXT,
        target_id UUID,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    `,
    checksum: "010_notifications",
  },
  {
    id: "011",
    name: "create_auctions",
    sql: `
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
      
      ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view auctions" ON auctions FOR SELECT USING (true);
      CREATE POLICY "Hosts can create auctions" ON auctions FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM shows WHERE id = show_id AND host_id = auth.uid())
      );
      
      ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);
      CREATE POLICY "Users can place bids" ON bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);
      
      CREATE INDEX idx_auctions_show_id ON auctions(show_id);
      CREATE INDEX idx_auctions_status ON auctions(status);
      CREATE INDEX idx_bids_auction_id ON bids(auction_id);
    `,
    checksum: "011_auctions",
  },
  {
    id: "012",
    name: "create_partnerships",
    sql: `
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
      
      ALTER TABLE creator_partnerships ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own partnerships" ON creator_partnerships FOR SELECT USING (
        auth.uid() = influencer_id OR auth.uid() = brand_id
      );
      CREATE POLICY "Users can create partnerships" ON creator_partnerships FOR INSERT WITH CHECK (
        auth.uid() = influencer_id OR auth.uid() = brand_id
      );
      
      ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own clicks" ON affiliate_clicks FOR SELECT USING (
        auth.uid() = referrer_id OR EXISTS (SELECT 1 FROM creator_partnerships WHERE id = partnership_id AND (influencer_id = auth.uid() OR brand_id = auth.uid()))
      );
    `,
    checksum: "012_partnerships",
  },
  {
    id: "013",
    name: "create_gamification",
    sql: `
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
      
      ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
      
      ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
      
      ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
    `,
    checksum: "013_gamification",
  },
  {
    id: "014",
    name: "create_social_features",
    sql: `
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
      
      ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
      CREATE POLICY "Users can manage own follows" ON user_follows FOR INSERT, DELETE USING (auth.uid() = follower_id);
      
      ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own wishlist" ON wishlist FOR INSERT, DELETE USING (auth.uid() = user_id);
      
      ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view public collections" ON collections FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
      CREATE POLICY "Users can manage own collections" ON collections FOR INSERT, UPDATE, DELETE USING (auth.uid() = creator_id);
      
      ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can view collection items" ON collection_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND (is_public = true OR creator_id = auth.uid()))
      );
      CREATE POLICY "Users can manage own collection items" ON collection_items FOR INSERT, DELETE USING (
        EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND creator_id = auth.uid())
      );
    `,
    checksum: "014_social",
  },
  {
    id: "015",
    name: "create_analytics",
    sql: `
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
      
      ALTER TABLE show_analytics ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Hosts can view own show analytics" ON show_analytics FOR SELECT USING (
        EXISTS (SELECT 1 FROM shows WHERE id = show_id AND host_id = auth.uid())
      );
      
      ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Sellers can view own analytics" ON seller_analytics FOR SELECT USING (auth.uid() = seller_id);
    `,
    checksum: "015_analytics",
  },
  {
    id: "016",
    name: "create_interactions",
    sql: `
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
      
      ALTER TABLE live_polls ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view polls" ON live_polls FOR SELECT USING (true);
      CREATE POLICY "Hosts can create polls" ON live_polls FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM shows WHERE id = show_id AND host_id = auth.uid())
      );
      
      ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view poll options" ON poll_options FOR SELECT USING (true);
      
      ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view votes" ON poll_votes FOR SELECT USING (true);
      CREATE POLICY "Users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
    `,
    checksum: "016_interactions",
  },
  {
    id: "017",
    name: "create_verification",
    sql: `
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
      
      ALTER TABLE host_verification ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Anyone can view verification" ON host_verification FOR SELECT USING (true);
      CREATE POLICY "Hosts can view own verification" ON host_verification FOR UPDATE USING (auth.uid() = host_id);
    `,
    checksum: "017_verification",
  },
  {
    id: "018",
    name: "create_payouts",
    sql: `
      CREATE TABLE IF NOT EXISTS seller_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        stripe_transfer_id TEXT,
        stripe_account_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS seller_balance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
        available_balance NUMERIC(12, 2) DEFAULT 0,
        pending_balance NUMERIC(12, 2) DEFAULT 0,
        total_earned NUMERIC(12, 2) DEFAULT 0,
        total_withdrawn NUMERIC(12, 2) DEFAULT 0,
        stripe_account_id TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Sellers can view own payouts" ON seller_payouts FOR SELECT USING (auth.uid() = seller_id);
      
      ALTER TABLE seller_balance ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Sellers can view own balance" ON seller_balance FOR SELECT USING (auth.uid() = seller_id);
      
      CREATE INDEX idx_payouts_seller_id ON seller_payouts(seller_id);
      CREATE INDEX idx_payouts_status ON seller_payouts(status);
    `,
    checksum: "018_payouts",
  },
  {
    id: "019",
    name: "create_moderation",
    sql: `
      CREATE TABLE IF NOT EXISTS content_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID NOT NULL REFERENCES profiles(id),
        reported_user_id UUID REFERENCES profiles(id),
        show_id UUID REFERENCES shows(id),
        product_id UUID REFERENCES products(id),
        message_id UUID REFERENCES chat_messages(id),
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
        reviewed_by UUID REFERENCES profiles(id),
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS moderation_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        moderator_id UUID NOT NULL REFERENCES profiles(id),
        target_user_id UUID REFERENCES profiles(id),
        action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'timeout', 'ban', 'content_removal')),
        reason TEXT NOT NULL,
        duration_minutes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      );
      
      ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Users can create reports" ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
      CREATE POLICY "Admins can view all reports" ON content_reports FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
      
      ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Admins can manage moderation" ON moderation_actions FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
      
      CREATE INDEX idx_reports_status ON content_reports(status);
      CREATE INDEX idx_reports_reporter ON content_reports(reporter_id);
      CREATE INDEX idx_actions_target ON moderation_actions(target_user_id);
    `,
    checksum: "019_moderation",
  },
]

export async function runMigrations() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    },
  )

  // Create migrations table if it doesn't exist
  await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `,
  })

  // Run pending migrations
  for (const migration of migrations) {
    const { data: executed } = await supabase.from("migrations").select("id").eq("id", migration.id).single()

    if (!executed) {
      console.log(`Running migration: ${migration.name}`)
      const { error } = await supabase.rpc("execute_sql", {
        sql: migration.sql,
      })

      if (error) {
        console.error(`Migration ${migration.name} failed:`, error)
        throw error
      }

      await supabase.from("migrations").insert({
        id: migration.id,
        name: migration.name,
        checksum: migration.checksum,
      })

      console.log(`✓ Migration ${migration.name} completed`)
    }
  }

  console.log("All migrations completed successfully")
}
