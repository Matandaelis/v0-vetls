# Live Shopping Marketplace 🛍️📹

*A Next.js 16 live-shopping platform with real-time streaming, e-commerce, and social features*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/matsonke-admins-projects)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

## 🎯 Overview

A comprehensive live-shopping marketplace platform that combines:
- 📹 **Live Streaming** - Real-time video shopping experiences powered by LiveKit
- 🛒 **E-commerce** - Full shopping cart, checkout, and order management
- 💳 **Payments** - Secure payment processing via Stripe
- 👥 **Social Features** - User profiles, follows, chat, and notifications
- 🎨 **Modern UI** - Built with React 19, Tailwind CSS, and Radix UI
- 🔐 **Secure Backend** - Supabase authentication and PostgreSQL with RLS

## 🚀 Quick Start

**New to this project? Start here:**

1. **[📖 QUICK_START.md](./QUICK_START.md)** - Get up and running in minutes
2. **[🔧 VERCEL_SUPABASE_SETUP.md](./VERCEL_SUPABASE_SETUP.md)** - Detailed integration guide
3. **[📊 MCP_INTEGRATION_SUMMARY.md](./MCP_INTEGRATION_SUMMARY.md)** - Technical integration details

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (free tier)
- Supabase account (free tier)
- Stripe account (for payments)
- LiveKit account (for streaming)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your credentials in .env.local

# Initialize database
# Run supabase-schema.sql in Supabase SQL Editor

# Start development server
npm run dev
```

Visit http://localhost:3000 🎉

## 📦 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library

### Backend
- **Supabase** - Authentication, database, and storage
- **PostgreSQL 17** - Robust relational database
- **Row Level Security** - Fine-grained access control
- **Stripe** - Payment processing
- **LiveKit** - Real-time video streaming

### Infrastructure
- **Vercel** - Hosting and serverless functions
- **Vercel Analytics** - Real-time traffic insights
- **Edge Functions** - Low-latency API endpoints

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Stripe, LiveKit, admin)
│   ├── (marketing)/       # Landing and public pages
│   ├── (commerce)/        # Product and order pages
│   └── (live)/            # Live show pages
├── components/            # React components
│   ├── ui/               # Reusable UI primitives
│   ├── live/             # Live streaming components
│   ├── products/         # Product display components
│   └── layout/           # Layout components
├── lib/                   # Shared utilities
│   ├── supabase/         # Supabase clients
│   ├── db/               # Database schema and migrations
│   ├── stripe/           # Stripe integration
│   └── types.ts          # TypeScript types
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## ✨ Features

### For Shoppers
- 🔍 Browse products and categories
- 🎥 Watch live shopping shows
- 💬 Chat during live streams
- 🛒 Shopping cart and wishlist
- 💳 Secure checkout with Stripe
- 📦 Order tracking and history
- ⭐ Rate and review products

### For Hosts/Sellers
- 📹 Host live shopping shows
- 📊 Real-time viewer analytics
- 💼 Product catalog management
- 📈 Sales and revenue tracking
- 🎬 Create highlight clips
- 👥 Audience engagement tools

### For Admins
- 👑 User role management
- 📊 Platform analytics dashboard
- 🔧 Database administration
- 🚨 Content moderation tools

## 🗄️ Database Schema

The platform includes 10+ tables with comprehensive features:

- **profiles** - User accounts and roles
- **shows** - Live streaming events
- **products** - Product catalog
- **orders** & **order_items** - Order management
- **cart_items** - Shopping cart
- **chat_messages** - Live chat
- **ratings** - Product/show reviews
- **clips** - Video highlights
- **notifications** - User alerts

All tables have Row Level Security (RLS) enabled for data protection.

## 🔐 Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

See `.env.example` for complete list.

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

Or use the Vercel dashboard to import from Git.

### Database Setup

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn/sql/new)
2. Copy contents of `supabase-schema.sql`
3. Run in SQL editor
4. Verify tables are created

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast-track setup guide
- **[VERCEL_SUPABASE_SETUP.md](./VERCEL_SUPABASE_SETUP.md)** - Integration details
- **[MCP_INTEGRATION_SUMMARY.md](./MCP_INTEGRATION_SUMMARY.md)** - Technical reference
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[STREAMING_SETUP.md](./STREAMING_SETUP.md)** - LiveKit configuration

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🐛 Troubleshooting

Common issues and solutions:

1. **Database connection errors**: Verify Supabase credentials in `.env.local`
2. **Build failures**: Check all required environment variables are set
3. **Payment issues**: Ensure Stripe is in test mode during development
4. **Streaming problems**: Verify LiveKit credentials and WebSocket connection

See [VERCEL_SUPABASE_SETUP.md](./VERCEL_SUPABASE_SETUP.md) for detailed troubleshooting.

## 🤝 Contributing

This is a private project, but contributions are welcome:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

All rights reserved.

## 🔗 Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/vawelzguxlzysrkvzonn
- **Vercel Dashboard**: https://vercel.com/matsonke-admins-projects
- **v0.app Chat**: https://v0.app/chat/ppsj2eC5lAM

## 💡 Support

For questions or issues:
- Check the documentation files
- Review Supabase logs
- Check Vercel deployment logs
- Contact the development team

---

**Built with ❤️ using Next.js, Supabase, and Vercel**