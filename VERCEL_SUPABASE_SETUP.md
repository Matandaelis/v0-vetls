# Vercel & Supabase Integration Setup

This document describes the connection between this project and Vercel/Supabase via MCP (Model Context Protocol).

## 🎯 Project Configuration

### Supabase Project
- **Project Name**: live-shopping-marketplace
- **Project ID**: vawelzguxlzysrkvzonn
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY
- **API URL**: https://vawelzguxlzysrkvzonn.supabase.co
- **Database Host**: db.vawelzguxlzysrkvzonn.supabase.co

### Vercel Team
- **Team ID**: team_YGlswcvTIrB8WCQ64z8P0s2z
- **Team Name**: matsonke-admin's projects

## 🔑 API Keys

The following environment variables have been configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vawelzguxlzysrkvzonn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Next Steps

### 1. Get Supabase Service Role Key

The service role key is needed for server-side operations. Get it from the Supabase dashboard:

1. Visit https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn/settings/api
2. Copy the `service_role` key (keep it secret!)
3. Add it to your `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 2. Initialize Database Schema

Run the database initialization to set up all tables, policies, and triggers:

```bash
# Local development
npm run db:init

# Or via API endpoint (after deployment)
curl -X POST https://your-app.vercel.app/api/admin/init-db \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

### 3. Configure Additional Services

#### Stripe (for payments)
1. Get your Stripe keys from https://dashboard.stripe.com/apikeys
2. Add to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

#### LiveKit (for live streaming)
1. Create a LiveKit project at https://cloud.livekit.io
2. Add credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   ```

#### Upstash Vector (optional, for AI features)
1. Create an Upstash Vector database at https://console.upstash.com
2. Add credentials to `.env.local`:
   ```bash
   UPSTASH_VECTOR_REST_URL=https://...
   UPSTASH_VECTOR_REST_TOKEN=...
   ```

### 4. Deploy to Vercel

You can deploy this project to Vercel using one of these methods:

#### Option A: Link to Existing Project
If you want to link to an existing Vercel project (e.g., "liveshoppingpj", "stream", "v0-marketplace"):

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to existing project
vercel link --project=<project-name>

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add other env vars

# Deploy
vercel --prod
```

#### Option B: Create New Vercel Project
```bash
vercel

# Follow the prompts to create a new project
# Then add environment variables via Vercel dashboard or CLI
```

#### Option C: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Add environment variables in the project settings
4. Deploy

### 5. Set Environment Variables in Vercel

After linking/creating your Vercel project, add these environment variables:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure to add them for all environments (Production, Preview, Development)

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `ADMIN_API_KEY` (for running migrations)

**Optional Variables:**
- `UPSTASH_VECTOR_REST_URL`
- `UPSTASH_VECTOR_REST_TOKEN`

## 🗄️ Database Schema

The project includes comprehensive database migrations in `lib/db/migrations.ts` that will create:

- User profiles and authentication
- Products, categories, and inventory
- Shopping cart and orders
- Live shows and streaming
- Auction and bidding system
- Affiliate and partnership tracking
- Loyalty points and gamification
- Social features (follows, wishlist, collections)
- Analytics and metrics
- Notifications system

## 🔒 Security Notes

1. **Never commit** `.env.local` or any file containing secrets to Git
2. The `.gitignore` file should include `.env.local` and `.vercel`
3. Use Vercel's environment variables for production secrets
4. The service role key has admin access - protect it carefully
5. Use RLS (Row Level Security) policies for data protection

## 🧪 Testing the Connection

After setup, test the connection:

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Check browser console for any Supabase connection errors
# Try signing up/logging in
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [LiveKit Documentation](https://docs.livekit.io)
- [Stripe Documentation](https://stripe.com/docs)

## 🆘 Troubleshooting

### Issue: "Invalid API key" error
- Verify your Supabase URL and anon key in `.env.local`
- Check that environment variables are properly loaded
- Restart your development server

### Issue: Database tables not found
- Run `npm run db:init` to initialize the schema
- Check that the service role key is set correctly

### Issue: Vercel deployment fails
- Verify all required environment variables are set in Vercel
- Check build logs for specific errors
- Ensure `vercel.json` configuration is correct

### Issue: LiveKit streaming not working
- Verify LiveKit credentials are correct
- Check that WebSocket connections are allowed
- Review LiveKit console for error messages
