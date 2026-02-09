/**
 * Initialize Supabase Database Schema
 * 
 * This script creates all necessary tables, indexes, and RLS policies
 * for the live-shopping marketplace application.
 * 
 * Run with: npx tsx scripts/init-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrations = [
  {
    id: '001',
    name: 'create_profiles',
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
      DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
      CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    `
  },
  {
    id: '002',
    name: 'create_shows',
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
      DROP POLICY IF EXISTS "Anyone can view shows" ON shows;
      CREATE POLICY "Anyone can view shows" ON shows FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Hosts can create shows" ON shows;
      CREATE POLICY "Hosts can create shows" ON shows FOR INSERT WITH CHECK (auth.uid() = host_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'host'));
      DROP POLICY IF EXISTS "Hosts can update own shows" ON shows;
      CREATE POLICY "Hosts can update own shows" ON shows FOR UPDATE USING (auth.uid() = host_id);
      
      CREATE INDEX IF NOT EXISTS idx_shows_host_id ON shows(host_id);
      CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
      CREATE INDEX IF NOT EXISTS idx_shows_created_at ON shows(created_at);
    `
  },
  {
    id: '003',
    name: 'create_products',
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
      DROP POLICY IF EXISTS "Anyone can view products" ON products;
      CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Sellers can create products" ON products;
      CREATE POLICY "Sellers can create products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
      DROP POLICY IF EXISTS "Sellers can update own products" ON products;
      CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
      
      CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
    `
  },
  {
    id: '004',
    name: 'create_orders',
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
      DROP POLICY IF EXISTS "Users can view own orders" ON orders;
      CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can create orders" ON orders;
      CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `
  },
  {
    id: '005',
    name: 'create_order_items',
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
      DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
      CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR seller_id = auth.uid()
      );
      
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `
  },
  {
    id: '006',
    name: 'create_cart',
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
      DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
      CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
      CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
    `
  },
  {
    id: '007',
    name: 'create_chat_messages',
    sql: `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Anyone can view show chat" ON chat_messages;
      CREATE POLICY "Anyone can view show chat" ON chat_messages FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
      CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_chat_messages_show_id ON chat_messages(show_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
    `
  },
  {
    id: '008',
    name: 'create_ratings_and_reviews',
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
      DROP POLICY IF EXISTS "Anyone can view ratings" ON ratings;
      CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
      CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_show_id ON ratings(show_id);
    `
  },
  {
    id: '009',
    name: 'create_clips',
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
      DROP POLICY IF EXISTS "Anyone can view clips" ON clips;
      CREATE POLICY "Anyone can view clips" ON clips FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Hosts can create clips from own shows" ON clips;
      CREATE POLICY "Hosts can create clips from own shows" ON clips FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM shows WHERE id = show_id AND host_id = auth.uid())
      );
      
      CREATE INDEX IF NOT EXISTS idx_clips_show_id ON clips(show_id);
      CREATE INDEX IF NOT EXISTS idx_clips_product_id ON clips(product_id);
    `
  },
  {
    id: '010',
    name: 'create_notifications',
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
      DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
      CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
      DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
      CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `
  }
]

async function runMigrations() {
  console.log('🚀 Starting Supabase database initialization...\n')

  for (const migration of migrations) {
    console.log(`📦 Running migration: ${migration.name}`)
    
    const { error } = await supabase.rpc('exec', {
      query: migration.sql
    })

    if (error) {
      console.error(`❌ Migration ${migration.name} failed:`, error)
      throw error
    }

    console.log(`✅ Migration ${migration.name} completed\n`)
  }

  console.log('✨ All migrations completed successfully!')
  console.log('\n📊 Database schema is now ready for use.')
  console.log('\n🔐 Remember to configure RLS policies in the Supabase dashboard if needed.')
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
