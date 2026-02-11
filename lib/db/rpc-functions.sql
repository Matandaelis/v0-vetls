-- Database functions for advanced features
-- These are PostgreSQL stored procedures for optimized operations

-- ============================================
-- Poll Functions
-- ============================================

-- Increment poll vote count
CREATE OR REPLACE FUNCTION increment_poll_vote(option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Question Functions
-- ============================================

-- Increment question upvotes
CREATE OR REPLACE FUNCTION increment_question_upvotes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE show_questions
  SET upvotes = upvotes + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement question upvotes
CREATE OR REPLACE FUNCTION decrement_question_upvotes(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE show_questions
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Analytics Functions
-- ============================================

-- Get seller analytics summary
CREATE OR REPLACE FUNCTION get_seller_analytics(
  seller_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders INTEGER,
  avg_order_value NUMERIC,
  unique_customers INTEGER,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(DISTINCT o.id)::INTEGER as total_orders,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(DISTINCT o.buyer_id)::INTEGER as unique_customers,
    CASE 
      WHEN COUNT(DISTINCT sv.viewer_id) > 0 
      THEN (COUNT(DISTINCT o.buyer_id)::NUMERIC / COUNT(DISTINCT sv.viewer_id) * 100)
      ELSE 0
    END as conversion_rate
  FROM orders o
  LEFT JOIN show_views sv ON sv.show_id IN (
    SELECT id FROM shows WHERE host_id = seller_uuid
  )
  WHERE o.seller_id = seller_uuid
    AND o.created_at >= start_date
    AND o.created_at <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get show analytics summary
CREATE OR REPLACE FUNCTION get_show_analytics(
  show_uuid UUID
)
RETURNS TABLE (
  total_viewers INTEGER,
  peak_viewers INTEGER,
  avg_watch_time NUMERIC,
  engagement_rate NUMERIC,
  total_revenue NUMERIC,
  total_conversions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT sv.viewer_id)::INTEGER as total_viewers,
    COALESCE(MAX(s.viewer_count), 0)::INTEGER as peak_viewers,
    COALESCE(AVG(sv.duration), 0) as avg_watch_time,
    CASE 
      WHEN COUNT(DISTINCT sv.viewer_id) > 0 
      THEN (COUNT(DISTINCT c.user_id)::NUMERIC / COUNT(DISTINCT sv.viewer_id) * 100)
      ELSE 0
    END as engagement_rate,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COUNT(DISTINCT o.id)::INTEGER as total_conversions
  FROM shows s
  LEFT JOIN show_views sv ON sv.show_id = s.id
  LEFT JOIN comments c ON c.show_id = s.id
  LEFT JOIN orders o ON o.id IN (
    SELECT order_id FROM order_items oi
    WHERE oi.product_id IN (
      SELECT product_id FROM show_products WHERE show_id = s.id
    )
  )
  WHERE s.id = show_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- User Points Functions
-- ============================================

-- Add points to user
CREATE OR REPLACE FUNCTION add_user_points(
  user_uuid UUID,
  points INTEGER,
  reason TEXT
)
RETURNS void AS $$
DECLARE
  current_points INTEGER;
  new_tier TEXT;
BEGIN
  -- Insert or update user points
  INSERT INTO user_points (user_id, total_points)
  VALUES (user_uuid, points)
  ON CONFLICT (user_id)
  DO UPDATE SET total_points = user_points.total_points + points;

  -- Get current points
  SELECT total_points INTO current_points
  FROM user_points
  WHERE user_id = user_uuid;

  -- Calculate tier
  IF current_points >= 50000 THEN
    new_tier := 'diamond';
  ELSIF current_points >= 25000 THEN
    new_tier := 'platinum';
  ELSIF current_points >= 10000 THEN
    new_tier := 'gold';
  ELSIF current_points >= 5000 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;

  -- Update tier
  UPDATE user_points
  SET loyalty_tier = new_tier
  WHERE user_id = user_uuid;

  -- Record transaction
  INSERT INTO point_transactions (user_id, points, reason)
  VALUES (user_uuid, points, reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Auction Functions
-- ============================================

-- Place bid on auction
CREATE OR REPLACE FUNCTION place_auction_bid(
  auction_uuid UUID,
  bidder_uuid UUID,
  bid_amount NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
  current_bid NUMERIC;
  auction_status TEXT;
BEGIN
  -- Get current auction state
  SELECT current_bid, status INTO current_bid, auction_status
  FROM auctions
  WHERE id = auction_uuid;

  -- Validate auction is active
  IF auction_status != 'active' THEN
    RAISE EXCEPTION 'Auction is not active';
  END IF;

  -- Validate bid is higher
  IF bid_amount <= COALESCE(current_bid, 0) THEN
    RAISE EXCEPTION 'Bid must be higher than current bid';
  END IF;

  -- Insert bid
  INSERT INTO bids (auction_id, bidder_id, bid_amount)
  VALUES (auction_uuid, bidder_uuid, bid_amount);

  -- Update auction
  UPDATE auctions
  SET 
    current_bid = bid_amount,
    highest_bidder_id = bidder_uuid
  WHERE id = auction_uuid;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Affiliate Tracking Functions
-- ============================================

-- Track affiliate click
CREATE OR REPLACE FUNCTION track_affiliate_click(
  partnership_uuid UUID,
  referrer_uuid UUID
)
RETURNS UUID AS $$
DECLARE
  click_id UUID;
BEGIN
  INSERT INTO affiliate_clicks (partnership_id, referrer_id)
  VALUES (partnership_uuid, referrer_uuid)
  RETURNING id INTO click_id;

  RETURN click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record affiliate conversion
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  click_uuid UUID,
  order_amount NUMERIC
)
RETURNS void AS $$
DECLARE
  partnership_uuid UUID;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
BEGIN
  -- Get partnership details
  SELECT partnership_id INTO partnership_uuid
  FROM affiliate_clicks
  WHERE id = click_uuid;

  SELECT commission_rate INTO commission_rate
  FROM creator_partnerships
  WHERE id = partnership_uuid;

  -- Calculate commission
  commission_amount := order_amount * (commission_rate / 100);

  -- Update click record
  UPDATE affiliate_clicks
  SET 
    conversion = TRUE,
    commission_earned = commission_amount
  WHERE id = click_uuid;

  -- Update partnership total earnings
  UPDATE creator_partnerships
  SET total_earnings = total_earnings + commission_amount
  WHERE id = partnership_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Notification Functions
-- ============================================

-- Create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notification_type TEXT,
  title TEXT,
  message TEXT,
  target_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, target_id)
  VALUES (user_uuid, notification_type, title, message, target_uuid)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  user_uuid UUID,
  notification_ids UUID[] DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF notification_ids IS NULL THEN
    -- Mark all user's notifications as read
    UPDATE notifications
    SET read = TRUE
    WHERE user_id = user_uuid AND read = FALSE;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET read = TRUE
    WHERE id = ANY(notification_ids) AND user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Search Functions
-- ============================================

-- Full-text search for products
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  price NUMERIC,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM products p
  WHERE 
    to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) 
    @@ plainto_tsquery('english', search_query)
    AND p.status = 'active'
  ORDER BY relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers
-- ============================================

-- Update product search vector on insert/update
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.name || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'search_vector'
  ) THEN
    DROP TRIGGER IF EXISTS products_search_vector_update ON products;
    CREATE TRIGGER products_search_vector_update
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();
  END IF;
END $$;

-- Auto-update show status based on time
CREATE OR REPLACE FUNCTION update_show_status()
RETURNS void AS $$
BEGIN
  -- Set shows to live if start time has passed
  UPDATE shows
  SET status = 'live'
  WHERE status = 'scheduled'
    AND start_time <= NOW();

  -- Set shows to ended if end time has passed
  UPDATE shows
  SET status = 'ended'
  WHERE status = 'live'
    AND end_time IS NOT NULL
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update auction status
CREATE OR REPLACE FUNCTION update_auction_status()
RETURNS void AS $$
BEGIN
  -- Start upcoming auctions
  UPDATE auctions
  SET status = 'active'
  WHERE status = 'upcoming'
    AND auction_start <= NOW();

  -- End active auctions
  UPDATE auctions
  SET status = 'ended'
  WHERE status = 'active'
    AND auction_end <= NOW();

  -- Mark ended auctions with bids as sold
  UPDATE auctions
  SET status = 'sold'
  WHERE status = 'ended'
    AND highest_bidder_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
