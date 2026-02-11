-- Performance optimization indexes for Tokshop Live Seller Platform
-- These indexes improve query performance for common operations

-- ============================================
-- Core Tables Indexes
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON profiles(last_sign_in_at DESC NULLS LAST);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;

-- Composite index for product search
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products(category_id, price, status) 
WHERE status = 'active';

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_fts ON products USING gin(to_tsvector('english', description));

-- Shows indexes
CREATE INDEX IF NOT EXISTS idx_shows_host_id ON shows(host_id);
CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
CREATE INDEX IF NOT EXISTS idx_shows_start_time ON shows(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_shows_featured ON shows(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_shows_room_name ON shows(room_name) WHERE room_name IS NOT NULL;

-- Composite index for live shows
CREATE INDEX IF NOT EXISTS idx_shows_live 
ON shows(status, start_time DESC) 
WHERE status = 'live';

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Composite index for order queries
CREATE INDEX IF NOT EXISTS idx_orders_seller_status 
ON orders(seller_id, status, created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- Advanced Features Indexes
-- ============================================

-- Auctions indexes
CREATE INDEX IF NOT EXISTS idx_auctions_show_id ON auctions(show_id);
CREATE INDEX IF NOT EXISTS idx_auctions_product_id ON auctions(product_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_auction_end ON auctions(auction_end);
CREATE INDEX IF NOT EXISTS idx_auctions_highest_bidder ON auctions(highest_bidder_id) WHERE highest_bidder_id IS NOT NULL;

-- Active auctions composite index
CREATE INDEX IF NOT EXISTS idx_auctions_active 
ON auctions(status, auction_end) 
WHERE status IN ('upcoming', 'active');

-- Bids indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_placed_at ON bids(placed_at DESC);

-- Social features indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_at ON user_follows(followed_at DESC);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_added_at ON wishlist(added_at DESC);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_creator_id ON collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_product ON collection_items(product_id);

-- ============================================
-- Analytics Indexes
-- ============================================

-- Show analytics indexes
CREATE INDEX IF NOT EXISTS idx_show_analytics_show_id ON show_analytics(show_id);
CREATE INDEX IF NOT EXISTS idx_show_analytics_recorded_at ON show_analytics(recorded_at DESC);

-- Seller analytics indexes (composite primary key already indexed)
CREATE INDEX IF NOT EXISTS idx_seller_analytics_date ON seller_analytics(date DESC);

-- Show views indexes
CREATE INDEX IF NOT EXISTS idx_show_views_show_id ON show_views(show_id);
CREATE INDEX IF NOT EXISTS idx_show_views_viewer_id ON show_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_show_views_viewed_at ON show_views(viewed_at DESC);

-- ============================================
-- Gamification Indexes
-- ============================================

-- User points indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_tier ON user_points(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);

-- Point transactions indexes
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_date ON point_transactions(transaction_date DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_achieved_at ON achievements(achieved_at DESC);

-- ============================================
-- Live Interactions Indexes
-- ============================================

-- Live polls indexes
CREATE INDEX IF NOT EXISTS idx_live_polls_show_id ON live_polls(show_id);
CREATE INDEX IF NOT EXISTS idx_live_polls_created_at ON live_polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_polls_active ON live_polls(expires_at) WHERE expires_at > NOW();

-- Poll options indexes
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);

-- Poll votes indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Comments/Chat indexes
CREATE INDEX IF NOT EXISTS idx_comments_show_id ON comments(show_id) WHERE show_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- Partnerships & Affiliates Indexes
-- ============================================

-- Creator partnerships indexes
CREATE INDEX IF NOT EXISTS idx_partnerships_influencer ON creator_partnerships(influencer_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_brand ON creator_partnerships(brand_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON creator_partnerships(status) WHERE status = 'active';

-- Affiliate clicks indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partnership ON affiliate_clicks(partnership_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_referrer ON affiliate_clicks(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_conversion ON affiliate_clicks(conversion) WHERE conversion = true;
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_time ON affiliate_clicks(click_time DESC);

-- ============================================
-- Admin & Moderation Indexes
-- ============================================

-- Content reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_content_id ON content_reports(content_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON content_reports(created_at DESC);

-- Seller applications indexes
CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id ON seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_applications_submitted ON seller_applications(submitted_at DESC);

-- ============================================
-- Notifications Indexes
-- ============================================

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, read, created_at DESC) 
WHERE read = false;

-- ============================================
-- Ratings & Reviews Indexes
-- ============================================

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ratings_show_id ON ratings(show_id) WHERE show_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_score ON ratings(score);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- ============================================
-- Performance Optimization Settings
-- ============================================

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE products;
ANALYZE shows;
ANALYZE orders;
ANALYZE order_items;
ANALYZE auctions;
ANALYZE bids;

-- Enable parallel query execution for large tables
ALTER TABLE products SET (parallel_workers = 4);
ALTER TABLE orders SET (parallel_workers = 4);
ALTER TABLE show_analytics SET (parallel_workers = 2);

-- Set autovacuum settings for high-traffic tables
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

ALTER TABLE show_views SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);
