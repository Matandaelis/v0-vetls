# Schema/Model Mismatch Fixes - Implementation Summary

## Overview
This document summarizes the fixes applied to resolve schema/model mismatches between Supabase database (snake_case) and UI models (camelCase), along with improvements to type safety and validation.

## Key Changes

### 1. Database Mappers (`lib/db/mappers.ts`)
Created comprehensive mapper utilities to convert between database rows and UI models:

- **DbProduct → Product**: Maps `seller_id`, `image_url`, etc. to camelCase
- **DbShow → Show**: Maps `host_id`, `thumbnail_url`, `start_time`, `viewer_count`, etc.
- **DbProfile → User**: Maps `username`, `display_name`, `avatar_url`, `followers_count`, etc.
- **Role mapping**: Converts between DB roles (`viewer`/`host`/`admin`) and UI roles (`buyer`/`seller`/`admin`)
- **Reverse mappers**: `productToDb()`, `showToDb()` for inserts/updates
- **Date parsing**: Converts ISO string timestamps to Date objects

### 2. Validation Schemas (`lib/validation/schemas.ts`)
Added Zod validation schemas for API request bodies:

- `createProductSchema` - validates product creation
- `createOrderSchema` - validates order creation with items
- `addToCartSchema` - validates cart operations
- `registerSchema` - validates user registration

### 3. Context Updates

#### AuthContext (`contexts/auth-context.tsx`)
- Uses `mapProfile()` to convert Supabase profile rows to User models
- Uses `mapRoleToDb()` when creating profiles
- Fixed profile insertion to use correct schema fields (`username`, `display_name`, `role`)
- Updated session loading to properly access nested session object

#### ProductContext (`contexts/product-context.tsx`)
- Loads products with seller join: `profiles!seller_id(username, display_name)`
- Uses `mapProduct()` to convert rows to UI models
- Uses `productToDb()` for inserts/updates
- Properly maps seller name from joined profile data

#### ShowContext (`contexts/show-context.tsx`)
- Loads shows with host join: `profiles!host_id(username, display_name, avatar_url)`
- Uses `mapShow()` to convert rows to UI models
- Maps host information from joined profile data

#### SearchContext (`contexts/search-context.tsx`)
- Updated to use mappers for both products and shows
- Fixed ordering to use correct snake_case column names (`viewer_count`, `start_time`)
- Changed popularity sort for products to use `sold` instead of `stock`

### 4. API Route Fixes

#### `/api/products/route.ts`
- **GET**: Changed from `host_id` to `seller_id`, added seller join, returns mapped products
- **POST**: Fixed to use `seller_id`, validates required fields, returns mapped product
- Removed references to non-existent `show_id` column

#### `/api/orders/route.ts`
- **GET**: Changed from `buyer_id`/`host_id` to `user_id`, added proper joins
- **POST**: Fixed to use `user_id`, validates items array, creates order_items correctly
- Added validation for required fields

#### `/api/cart/route.ts`
- **GET**: Removed reference to non-existent `carts` table, queries `cart_items` directly
- **POST**: Simplified to use `cart_items` table with `user_id`/`product_id` unique constraint
- **DELETE**: Added DELETE endpoint for removing cart items
- All operations use proper joins to fetch product and seller data

### 5. Page Component Updates

#### `/app/page.tsx`
- Fixed "Upcoming Shows" filter from `status === "upcoming"` to `status === "scheduled"`
- Added `.slice(0, 3)` to limit displayed upcoming shows

#### `/app/shows/[id]/page.tsx`
- Updated to use new Supabase server client (`@/lib/supabase/server`)
- Uses `mapShow()` and `mapProduct()` to convert database rows
- Adds proper joins for host and seller information
- Removed usage of deprecated `createServerComponentClient`

### 6. Configuration

#### `next.config.mjs`
- **Removed** `typescript.ignoreBuildErrors: true`
- TypeScript errors will now surface during build

## Database Schema Alignment

### Profiles Table
```sql
- username (VARCHAR, unique)
- display_name (VARCHAR, nullable)
- avatar_url (TEXT, nullable)
- role (viewer | host | admin)
- followers_count (INTEGER)
- following_count (INTEGER)
```

### Products Table
```sql
- seller_id (UUID FK to profiles)
- image_url (TEXT, nullable)
- stock (INTEGER)
```

### Shows Table
```sql
- host_id (UUID FK to profiles)
- thumbnail_url (TEXT, nullable)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP, nullable)
- viewer_count (INTEGER)
- is_featured (BOOLEAN)
```

### Orders Table
```sql
- user_id (UUID FK to profiles)
- total_amount (NUMERIC)
- status (pending | processing | completed | failed | refunded)
```

### Cart Items Table
```sql
- user_id (UUID FK to profiles)
- product_id (UUID FK to products)
- quantity (INTEGER)
- UNIQUE(user_id, product_id)
```

## Role Mapping

### Database Roles → UI Roles
- `viewer` → `buyer`
- `host` → `seller`
- `admin` → `admin`

This mapping is handled transparently by `mapProfile()` and `mapRoleToDb()`.

## Testing Recommendations

1. **Auth Flow**
   - Register new user → verify profile created with correct schema
   - Login → verify user data properly mapped

2. **Product Flow**
   - Load products → verify seller name displayed correctly
   - Create product → verify seller_id set properly
   - Filter by category → verify results

3. **Show Flow**
   - Load live shows → verify host name/avatar displayed
   - Load scheduled shows → verify startTime parsed as Date
   - Homepage upcoming filter → verify shows display

4. **Cart/Order Flow**
   - Add to cart → verify cart_items row created
   - View cart → verify product details fetched
   - Create order → verify order and order_items created

5. **Search**
   - Search products → verify sorting by price/popularity
   - Search shows → verify sorting by viewer_count/start_time

## Known Limitations

1. **Show Products**: The `Show.products` field is currently a simple string array. In production, consider a `show_products` join table.

2. **Tags**: The `Show.tags` field is hardcoded to empty array. Consider adding a tags column or join table if needed.

3. **Cart Persistence**: Cart context uses localStorage. Consider syncing with `cart_items` table for logged-in users.

4. **Seller Orders**: The seller view of orders (filtering by seller_id in order_items) is partially implemented. Requires RLS policy updates for full functionality.

## Migration Notes

- Existing database schema is unchanged - these fixes only correct the application layer
- No data migration required
- All changes are backward compatible with existing database structure
