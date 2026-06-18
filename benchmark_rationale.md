# Performance Optimization Baseline

## Issue
The function `loadProducts` in `contexts/product-context.tsx` fetches all records from the `products` table on component mount.

```typescript
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:profiles!seller_id(username, display_name)
        `)
```

## Complexity Analysis
- **Time Complexity:** O(N) where N is the total number of products in the database.
- **Space Complexity (Client):** O(N) to store all products in React state.
- **Network Bandwidth:** O(N).

## Impact
As the product catalog grows, the initial load time of the application will increase linearly. For a store with 10,000 products:
- If each product object is ~1KB.
- Total payload: ~10MB.
- This will cause significant delay in Time to Interactive (TTI) and high memory usage on client devices.

## Proposed Solution: Pagination
Implement server-side pagination (Limit/Offset or Cursor-based).
- **Fetch Size:** Fixed at 20 items (or similar page size).
- **Time Complexity:** O(1) for the initial fetch.
- **Space Complexity:** O(P) where P is page size.
- **Network Bandwidth:** Small, constant payload (~20KB).

## Verification Method
Since runtime benchmarking is not possible in the current environment (no database, no network), verification will be based on:
1.  Code analysis ensuring `range()` or `limit()` is applied to the Supabase query.
2.  Ensuring functional correctness of dependent components (`CategoryPage`, `UserProfilePage`, etc.) via code review.
