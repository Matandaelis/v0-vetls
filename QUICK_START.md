# 🚀 Quick Start Guide - Vercel & Supabase Integration

This guide will help you get your live-shopping marketplace up and running quickly.

## ✅ What's Already Done

✨ **Supabase Project Created**
- Project Name: `live-shopping-marketplace`
- Project ID: `vawelzguxlzysrkvzonn`
- Region: `us-east-1`
- API URL: `https://vawelzguxlzysrkvzonn.supabase.co`

✨ **Environment Configuration**
- `.env.local` file created with Supabase credentials
- `.env.example` file for documentation

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Vercel account (free tier is fine)
- Access to the Supabase dashboard

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd /path/to/your/project
npm install
```

### 2. Complete Environment Configuration

The `.env.local` file has been created with Supabase credentials. You need to add:

1. **Get Supabase Service Role Key**:
   - Visit: https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn/settings/api
   - Copy the `service_role` key
   - Add to `.env.local`:
     ```bash
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

2. **Configure Stripe** (required for payments):
   - Sign up at https://stripe.com
   - Get your API keys from https://dashboard.stripe.com/apikeys
   - Add to `.env.local`:
     ```bash
     STRIPE_SECRET_KEY=sk_test_...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

3. **Configure LiveKit** (required for live streaming):
   - Create project at https://cloud.livekit.io
   - Get your credentials
   - Add to `.env.local`:
     ```bash
     NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
     LIVEKIT_API_KEY=your_api_key
     LIVEKIT_API_SECRET=your_api_secret
     ```

### 3. Initialize Database Schema

You have two options:

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn/sql/new
2. Copy the entire contents of `supabase-schema.sql`
3. Paste into the SQL editor
4. Click "Run" to execute

#### Option B: Using the API endpoint

1. Add an admin API key to `.env.local`:
   ```bash
   ADMIN_API_KEY=your_secure_random_string
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Run the initialization:
   ```bash
   npm run db:init
   ```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 to see your app running!

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to create a new project or link to existing
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Add environment variables (see section below)
4. Deploy!

#### Option C: Link to Existing Project

If you want to use an existing Vercel project:

```bash
vercel link --project=your-project-name
vercel env pull
vercel --prod
```

### 6. Configure Vercel Environment Variables

In your Vercel project settings, add these environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://vawelzguxlzysrkvzonn.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from `.env.local`)
- `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase dashboard)
- `STRIPE_SECRET_KEY` = (from Stripe dashboard)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = (from Stripe dashboard)
- `NEXT_PUBLIC_LIVEKIT_URL` = (from LiveKit dashboard)
- `LIVEKIT_API_KEY` = (from LiveKit dashboard)
- `LIVEKIT_API_SECRET` = (from LiveKit dashboard)
- `ADMIN_API_KEY` = (your secure random string)

**Optional:**
- `UPSTASH_VECTOR_REST_URL` = (if using Upstash for AI features)
- `UPSTASH_VECTOR_REST_TOKEN` = (if using Upstash)

## 🎯 What's Included

The database schema includes:

- ✅ User profiles and authentication
- ✅ Live shows and streaming
- ✅ Product catalog and inventory
- ✅ Shopping cart and orders
- ✅ Payment processing (via Stripe)
- ✅ Chat and messaging
- ✅ Ratings and reviews
- ✅ Video clips and highlights
- ✅ Notifications system
- ✅ Row-level security (RLS) policies

## 🔒 Security Features

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Hosts can only manage their own shows
- Sellers can only manage their own products
- Comprehensive access control policies

## 📊 Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles and roles |
| `shows` | Live streaming shows |
| `products` | Product catalog |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `cart_items` | Shopping cart |
| `chat_messages` | Live chat messages |
| `ratings` | Product/show reviews |
| `clips` | Video highlights |
| `notifications` | User notifications |

## 🧪 Testing the Setup

1. **Check Database Connection**:
   ```bash
   npm run dev
   ```
   Open browser console - you shouldn't see any Supabase errors

2. **Test Authentication**:
   - Try signing up/logging in
   - Check if profile is created in Supabase

3. **Test Features**:
   - Browse products
   - Add items to cart
   - View live shows (if any scheduled)

## 🆘 Troubleshooting

### "Invalid API key" error
- Verify environment variables are correctly set
- Restart dev server after changing `.env.local`
- Check for typos in Supabase URL/keys

### Database tables not found
- Make sure you ran the schema initialization (Step 3)
- Check Supabase SQL logs for any errors
- Verify service role key is correct

### Vercel deployment fails
- Check all environment variables are set in Vercel dashboard
- Review build logs for specific errors
- Make sure `vercel.json` is committed to Git

### LiveKit streaming not working
- Verify LiveKit credentials are correct
- Check browser console for WebSocket errors
- Ensure LiveKit project is active

## 📚 Next Steps

1. **Customize the UI**: Modify components in `components/` directory
2. **Add Products**: Use the product management interface
3. **Schedule Shows**: Create live streaming events
4. **Configure Payments**: Test Stripe integration
5. **Invite Users**: Share your live marketplace URL

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com
- **LiveKit Console**: https://cloud.livekit.io

## 📖 Documentation

- See `VERCEL_SUPABASE_SETUP.md` for detailed configuration
- See `supabase-schema.sql` for complete database schema
- Check existing docs for platform features and architecture

## 💡 Tips

- Use test mode for Stripe during development
- Monitor Supabase usage in the dashboard
- Set up monitoring and alerts in Vercel
- Enable Vercel Analytics for traffic insights
- Use Supabase Auth for user management

## 🎉 You're All Set!

Your live-shopping marketplace is ready to go. Start building amazing live shopping experiences! 🛍️📹
