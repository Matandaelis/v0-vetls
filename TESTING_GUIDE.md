# Live Commerce Platform - Testing Guide

This guide provides comprehensive testing procedures for the live-commerce platform.

## 🎯 Testing Overview

### Testing Priorities
1. **Critical Path**: Payment flows, live streaming, authentication
2. **High Priority**: Auction bidding, seller payouts, content moderation
3. **Medium Priority**: Social features, notifications, analytics
4. **Low Priority**: UI/UX refinements, performance optimizations

## 🧪 Manual Testing Checklist

### 1. Authentication & Authorization

#### User Registration & Login
- [ ] Register new user with email/password
- [ ] Verify email confirmation flow
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Password reset flow
- [ ] Social login (if implemented)

#### Role-Based Access
- [ ] Viewer role has correct permissions
- [ ] Host role can create shows and products
- [ ] Admin role has access to admin dashboard
- [ ] Unauthorized access is properly blocked

### 2. Live Streaming (LiveKit Integration)

#### Broadcaster Features
```bash
# Test as host/broadcaster
1. Navigate to /host
2. Click "Start New Show"
3. Grant camera/microphone permissions
4. Verify video preview appears
5. Start broadcast
6. Check stream quality indicators
7. Test recording start/stop
8. End broadcast properly
```

- [ ] Camera initialization works
- [ ] Microphone initialization works
- [ ] Screen sharing works
- [ ] Recording starts successfully
- [ ] Recording stops and saves
- [ ] Bandwidth adaptation works
- [ ] Reconnection after network drop

#### Viewer Experience
```bash
# Test as viewer
1. Navigate to /live or /shows
2. Find active show
3. Join show as viewer
4. Test chat functionality
5. Test reactions/engagement
```

- [ ] Video playback is smooth
- [ ] Audio is synchronized
- [ ] Chat messages appear in real-time
- [ ] Viewer count updates
- [ ] Low-latency experience (<3s delay)
- [ ] Mobile viewing works

### 3. E-Commerce Features

#### Product Management
```bash
# Test as seller
1. Navigate to /seller
2. Click "Add Product"
3. Fill product details
4. Upload product image
5. Set price and inventory
6. Save product
```

- [ ] Create product successfully
- [ ] Update product details
- [ ] Delete product
- [ ] Image upload works
- [ ] Inventory tracking accurate
- [ ] Product appears in listings

#### Shopping Cart & Checkout
```bash
# Test as buyer
1. Browse products
2. Add items to cart
3. Update quantities
4. Remove items
5. Proceed to checkout
6. Enter shipping info
7. Complete payment
```

- [ ] Add to cart works
- [ ] Cart persists across sessions
- [ ] Quantity updates correctly
- [ ] Cart total calculates properly
- [ ] Checkout flow is smooth
- [ ] Order confirmation appears

### 4. Payment Processing (Stripe)

#### Payment Intent Flow
```bash
# Test payment scenarios
1. Use Stripe test cards:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - Auth required: 4000 0025 0000 3155
```

- [ ] Payment succeeds with valid card
- [ ] Payment fails with declined card
- [ ] 3D Secure authentication works
- [ ] Order created after successful payment
- [ ] Receipt email sent
- [ ] Payment appears in Stripe dashboard

#### Refunds & Disputes
- [ ] Process refund from admin panel
- [ ] Partial refund works
- [ ] Full refund works
- [ ] Refund reflects in user's order history

### 5. Live Auctions

#### Auction Creation
```bash
# Test as host during live show
1. Start live show
2. Create auction for product
3. Set starting bid and duration
4. Activate auction
```

- [ ] Auction created successfully
- [ ] Starting bid set correctly
- [ ] Timer starts and counts down
- [ ] Auction appears to viewers

#### Bidding Flow
```bash
# Test as viewer
1. Join show with active auction
2. Place initial bid
3. Get outbid by another user
4. Place higher bid
5. Win auction when timer expires
```

- [ ] Bid placement works in real-time
- [ ] Highest bidder updates immediately
- [ ] Minimum bid increment enforced
- [ ] Countdown timer visible
- [ ] Winner notification sent
- [ ] Payment processed for winner

### 6. Seller Payouts (Stripe Connect)

#### Stripe Connect Setup
```bash
# Test as seller
1. Navigate to /seller/payouts
2. Click "Connect Stripe Account"
3. Complete Stripe onboarding
4. Verify account connected
```

- [ ] Stripe Connect onboarding loads
- [ ] KYC information collected
- [ ] Bank account linked
- [ ] Account verification successful
- [ ] Payout capability enabled

#### Payout Request
```bash
# Test payout flow
1. Check available balance
2. Request payout amount
3. Verify balance deduction
4. Check payout status
5. Confirm bank transfer (2-5 days)
```

- [ ] Balance displays correctly
- [ ] Payout request succeeds
- [ ] Available balance updates
- [ ] Payout appears in history
- [ ] Email notification sent
- [ ] Transfer appears in Stripe

### 7. Admin Dashboard & Moderation

#### Seller Approval
```bash
# Test as admin
1. Navigate to /admin/sellers
2. View pending sellers
3. Review seller profile
4. Approve or reject seller
5. Verify status update
```

- [ ] Pending sellers list loads
- [ ] Seller details visible
- [ ] Approval action works
- [ ] Rejection with reason works
- [ ] Seller receives notification
- [ ] Status reflects in seller account

#### Content Moderation
```bash
# Test moderation flow
1. User reports content/user
2. Admin sees report in /admin/moderation
3. Admin reviews report
4. Admin takes action (warn/timeout/ban)
5. Verify action applied
```

- [ ] Report submission works
- [ ] Reports appear in admin panel
- [ ] Report details visible
- [ ] Warning action works
- [ ] Timeout action works
- [ ] Ban action works
- [ ] User notifications sent

### 8. Email Notifications (SendGrid)

#### Email Types
- [ ] Registration/verification email
- [ ] Order confirmation email
- [ ] Show starting notification
- [ ] Payout notification
- [ ] Report acknowledgment
- [ ] Password reset email

#### Email Testing
```bash
# Configure SendGrid test mode
1. Set SENDGRID_API_KEY in .env
2. Trigger each email type
3. Check inbox for delivery
4. Verify email formatting
5. Test all links in emails
```

### 9. Real-Time Features

#### WebSocket Connections
- [ ] Chat messages deliver instantly
- [ ] Auction bids update in real-time
- [ ] Viewer count updates live
- [ ] Notifications appear immediately
- [ ] Connection resilience tested

#### Supabase Realtime
```bash
# Test realtime subscriptions
1. Open two browser windows
2. Perform action in window 1
3. Verify update in window 2
```

- [ ] Product updates sync
- [ ] Order status changes sync
- [ ] Show status updates sync
- [ ] Inventory changes sync

### 10. Performance & Scalability

#### Load Testing
```bash
# Simulate high traffic
1. Use load testing tool (k6, Apache JMeter)
2. Test concurrent users: 10, 50, 100, 500
3. Monitor response times
4. Check error rates
5. Verify database performance
```

- [ ] Handle 100 concurrent viewers
- [ ] Handle 500 concurrent viewers
- [ ] Page load times <3s
- [ ] API response times <500ms
- [ ] Database queries optimized
- [ ] CDN caching effective

#### Streaming Performance
```bash
# Test streaming under load
1. Start multiple concurrent streams
2. Add viewers to each stream
3. Monitor bandwidth usage
4. Check stream quality degradation
5. Verify LiveKit scaling
```

- [ ] 10 concurrent streams stable
- [ ] 100 viewers per stream
- [ ] Bitrate adaptation works
- [ ] No significant frame drops
- [ ] Audio/video sync maintained

## 🔒 Security Testing

### Authentication Security
- [ ] Password strength requirements
- [ ] SQL injection prevention
- [ ] XSS attack prevention
- [ ] CSRF token validation
- [ ] Session management secure
- [ ] Rate limiting active

### Payment Security
- [ ] PCI compliance (Stripe handles)
- [ ] No card data stored locally
- [ ] Secure payment intents
- [ ] Webhook signature verification
- [ ] Idempotency keys used

### API Security
- [ ] Authentication required for protected routes
- [ ] Authorization checks enforced
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] Rate limiting per user/IP

## 📱 Mobile & Browser Testing

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

### PWA Features
- [ ] Add to home screen works
- [ ] Offline page displays
- [ ] Push notifications work
- [ ] App icons correct

## 🐛 Bug Reporting Template

```markdown
**Bug Title**: [Clear, concise title]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Browser: [Chrome 120]
- OS: [macOS 14]
- User Role: [Host/Viewer/Admin]

**Steps to Reproduce**:
1. Go to [URL]
2. Click on [element]
3. Enter [data]
4. Observe error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Videos**:
[Attach if available]

**Console Errors**:
[Copy any errors from browser console]
```

## 🚀 Deployment Testing

### Pre-Deployment Checklist
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Build completes without errors
- [ ] No console errors in production build
- [ ] SSL certificate valid
- [ ] Domain configured correctly
- [ ] CDN configured
- [ ] Monitoring enabled

### Post-Deployment Verification
```bash
# Verify deployment
1. Check deployment URL loads
2. Test critical user flows
3. Verify database connection
4. Check external integrations
5. Monitor error logs
6. Test payment processing
7. Verify email delivery
8. Check streaming works
```

## 📊 Monitoring & Alerts

### Metrics to Monitor
- [ ] Page load times
- [ ] API response times
- [ ] Error rates
- [ ] Payment success rate
- [ ] Stream quality metrics
- [ ] User sign-up rate
- [ ] Conversion rate

### Alert Thresholds
- Error rate >1%
- Response time >2s
- Payment failure rate >5%
- Stream disconnection rate >10%

## 🔄 Regression Testing

### Before Each Release
- [ ] Run full test suite
- [ ] Test critical user journeys
- [ ] Verify no breaking changes
- [ ] Check database migrations
- [ ] Test rollback procedure
- [ ] Update documentation

## 📝 Test Automation

### Recommended Tools
- **Unit Tests**: Jest
- **Integration Tests**: Jest + Testing Library
- **E2E Tests**: Playwright or Cypress
- **Load Tests**: k6 or Artillery
- **API Tests**: Postman or Jest

### Test Coverage Goals
- Critical paths: 100%
- API routes: 90%
- Components: 80%
- Utilities: 90%

## 🎓 Testing Best Practices

1. **Test Early and Often**: Don't wait until the end
2. **Use Test Data**: Never test with production data
3. **Document Issues**: Always create tickets for bugs
4. **Test Edge Cases**: Try to break the system
5. **Mobile First**: Test mobile experience thoroughly
6. **Performance Matters**: Always check performance
7. **Security First**: Never skip security tests
8. **Real User Testing**: Get feedback from actual users

## 📞 Support & Resources

- **Stripe Test Cards**: https://stripe.com/docs/testing
- **LiveKit Docs**: https://docs.livekit.io
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Testing**: https://nextjs.org/docs/testing

---

**Last Updated**: 2024
**Platform Version**: 1.0.0
