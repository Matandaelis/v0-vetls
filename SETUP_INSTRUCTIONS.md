# Live Commerce Platform - Setup Instructions

## 🚀 Quick Start Guide

This guide will help you set up and run the live-commerce platform locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

## 🔑 Required Service Accounts

You'll need to create free accounts for these services:

1. **Supabase** - Database and authentication ([Sign up](https://supabase.com))
2. **Stripe** - Payment processing ([Sign up](https://stripe.com))
3. **LiveKit** - Live streaming ([Sign up](https://livekit.io))
4. **SendGrid** (Optional) - Email notifications ([Sign up](https://sendgrid.com))
5. **Vercel** (Optional) - Deployment ([Sign up](https://vercel.com))

## 📦 Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd live-commerce-platform

# Install dependencies (IMPORTANT: use --legacy-peer-deps)
npm install --legacy-peer-deps

# This is required due to React 19 compatibility
```

## 🔐 Step 2: Environment Variables

### Create Local Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### Configure Environment Variables

Open `.env.local` in your editor and fill in the following:

#### 2.1 Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or select existing)
3. Go to **Settings > API**
4. Copy the values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 2.2 Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers > API Keys**
3. Use **Test Mode** for development
4. Copy the keys:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

5. For Stripe Connect (seller payouts):
   - Go to **Settings > Connect > Settings**
   - Get your Connect client ID:

```bash
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx
```

#### 2.3 LiveKit Configuration

1. Go to [LiveKit Cloud](https://cloud.livekit.io)
2. Create a new project
3. Go to **Settings**
4. Copy the credentials:

```bash
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxx
LIVEKIT_API_SECRET=your_secret_here
```

#### 2.4 SendGrid (Optional but Recommended)

1. Go to [SendGrid](https://sendgrid.com)
2. Create an API key: **Settings > API Keys > Create API Key**
3. Verify sender email: **Settings > Sender Authentication**
4. Add to .env.local:

```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Live Shopping Platform
```

#### 2.5 Admin API Key (Create Your Own)

Generate a secure random string for database initialization:

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Add to .env.local:
ADMIN_API_KEY=your_generated_key_here
```

### Complete .env.local Example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxx
LIVEKIT_API_SECRET=xxxxx

# SendGrid (Optional)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Live Shopping Platform

# Admin
ADMIN_API_KEY=your_secure_random_key
```

## 🗄️ Step 3: Database Setup

### Option A: Using the API (Recommended)

1. Start the development server:

```bash
npm run dev
```

2. In a new terminal, initialize the database:

```bash
# Make sure ADMIN_API_KEY matches your .env.local
curl -X POST http://localhost:3000/api/admin/init-db \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

3. You should see:

```
Running migration: create_profiles
✓ Migration create_profiles completed
Running migration: create_shows
✓ Migration create_shows completed
...
All migrations completed successfully
```

### Option B: Manual SQL Execution

If the API method doesn't work:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Create a new query
3. Copy the SQL from `lib/db/migrations.ts`
4. Execute each migration SQL block

## 🎨 Step 4: Test the Application

### Start Development Server

```bash
npm run dev
```

The application should be running at [http://localhost:3000](http://localhost:3000)

### Create Test Accounts

#### 1. Register as a Viewer

1. Go to http://localhost:3000/register
2. Fill in the form
3. Check your email for verification (if SendGrid configured)
4. Login at http://localhost:3000/login

#### 2. Create an Admin Account

After registering, manually update the role in Supabase:

1. Go to Supabase Dashboard > Table Editor > profiles
2. Find your account
3. Change `role` from 'viewer' to 'admin'
4. Save

#### 3. Create a Host/Seller Account

Same process, but change `role` to 'host'

### Test Core Features

#### Test Shopping Flow

1. Navigate to Products
2. Add items to cart
3. Go to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete purchase
6. Check order confirmation

#### Test Live Streaming (as Host)

1. Login as host
2. Go to /host
3. Create a new show
4. Grant camera/mic permissions
5. Start streaming
6. Open in incognito mode to view as audience

#### Test Admin Features (as Admin)

1. Login as admin
2. Go to /admin
3. View dashboard statistics
4. Check seller approvals at /admin/sellers
5. Review content reports at /admin/moderation

## 🔧 Troubleshooting

### Common Issues

#### 1. npm install fails

```bash
# Solution: Always use --legacy-peer-deps
npm install --legacy-peer-deps
```

#### 2. Database connection error

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify in Supabase dashboard that the project is active
```

#### 3. Payment not working

```bash
# Verify Stripe keys are for TEST mode
# Check browser console for errors
# Ensure webhook endpoint is accessible
```

#### 4. LiveKit connection fails

```bash
# Check WebSocket URL format: wss://xxx.livekit.cloud
# Verify API key and secret
# Check browser console for CORS errors
# Ensure ports are not blocked by firewall
```

#### 5. Migration fails

```bash
# Check if tables already exist
# Drop all tables and retry
# Or manually execute SQL in Supabase
```

### Clear and Restart

If things get messy:

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps

# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

## 🚀 Step 5: Deployment (Optional)

### Deploy to Vercel

#### Prerequisites

- Vercel account
- GitHub repository
- All environment variables ready

#### Deployment Steps

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other variables

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Post-Deployment

1. **Update Stripe Webhooks**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `transfer.paid`

2. **Update Supabase Auth URL**:
   - Go to Supabase > Authentication > URL Configuration
   - Add your Vercel domain

3. **Test Production Deployment**:
   - Visit your domain
   - Test all major features
   - Monitor Vercel logs for errors

## 📚 Additional Resources

### Documentation

- [Complete Implementation Status](./IMPLEMENTATION_STATUS.md)
- [MCP Integration Guide](./MCP_INTEGRATION_COMPLETE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Vercel Setup Guide](./VERCEL_SUPABASE_SETUP.md)

### External Docs

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [LiveKit Documentation](https://docs.livekit.io)
- [Vercel Documentation](https://vercel.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error messages in:
   - Browser console (F12)
   - Terminal output
   - Vercel logs (if deployed)
   - Supabase logs
3. Search documentation
4. Check GitHub issues
5. Contact support

## ✅ Setup Checklist

Use this checklist to ensure everything is configured:

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed with `--legacy-peer-deps`
- [ ] `.env.local` file created
- [ ] Supabase project created and keys added
- [ ] Stripe account set up and keys added
- [ ] LiveKit project created and keys added
- [ ] SendGrid configured (optional)
- [ ] Admin API key generated
- [ ] Database migrations run successfully
- [ ] Dev server starts without errors
- [ ] Can register and login
- [ ] Can view products
- [ ] Can add to cart
- [ ] Payment processing works
- [ ] Live streaming works
- [ ] Admin dashboard accessible
- [ ] All tests passing

## 🎉 Success!

Once you've completed all steps, you should have a fully functional live-commerce platform running locally. Happy coding!

---

**Need Help?** Check the documentation or open an issue on GitHub.

**Ready for Production?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
