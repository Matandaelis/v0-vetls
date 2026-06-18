```markdown
# v0-vetls Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns, coding conventions, and collaborative workflows used in the `v0-vetls` repository. The project is a TypeScript codebase built with Next.js, featuring both frontend and backend development, accessibility best practices, and a structured approach to feature development, documentation, and testing.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for file names.  
  *Example:*  
  ```
  userProfile.tsx
  apiRoutes.ts
  ```

- **Import Style:**  
  Use path aliases for imports.  
  *Example:*  
  ```typescript
  import Button from '@/components/button'
  import { getUser } from '@/lib/api'
  ```

- **Export Style:**  
  Default exports are preferred.  
  *Example:*  
  ```typescript
  // Good
  export default function UserProfile() { ... }
  ```

- **Commit Messages:**  
  - Prefix with `feat`, `fix`, or `refactor`.
  - Average length: ~60 characters.
  *Example:*  
  ```
  feat: add ARIA support to modal component
  fix: correct user role assignment in API
  refactor: migrate db schema to new format
  ```

## Workflows

### Accessibility Enhancement Workflow
**Trigger:** When you want to improve the accessibility (a11y) of a UI component or feature.  
**Command:** `/improve-a11y`

1. Edit one or more React component files (e.g., in `components/`) to add ARIA attributes, semantic HTML, or improve screen reader support.
   ```tsx
   // Example: Adding ARIA label
   <button aria-label="Close dialog">×</button>
   ```
2. Update or add related accessibility tests (e.g., `test_a11y.py` or `verify-a11y.py`).
3. Document the change or learning in `.Jules/palette.md`.

### Feature Development with Docs and Migrations
**Trigger:** When implementing a new feature or major enhancement involving backend, frontend, migrations, and docs.  
**Command:** `/add-feature`

1. Create or update API route files (e.g., `app/api/*/route.ts`).
   ```typescript
   // app/api/user/route.ts
   export default async function handler(req, res) { ... }
   ```
2. Create or update frontend components (e.g., `components/*.tsx`).
3. Create or update database migration or schema files (e.g., `lib/db/migrations.ts`, `scripts/*.sql`, `supabase-schema.sql`).
4. Update or add documentation or implementation summary files (e.g., `*.md`).
5. Update `package.json` if new dependencies are needed.

### Merge PR with Feature or Fix
**Trigger:** When merging a pull request that implements a feature or fix, after review.  
**Command:** `/merge-pr`

1. Develop and commit the feature/fix branch, touching relevant files.
2. Create a merge commit, typically affecting the same files as the feature/fix.

## Testing Patterns

- **Test File Pattern:**  
  Test files use the pattern `*.test.*` (e.g., `user.test.tsx`).
- **Testing Framework:**  
  Not specified in the repository, but tests are present.
- **Accessibility Tests:**  
  Additional a11y tests may be found in `test_a11y.py` or `verify-a11y.py`.

*Example:*
```typescript
// user.test.tsx
import { render } from '@testing-library/react'
import UserProfile from '@/components/userProfile'

test('renders user profile', () => {
  render(<UserProfile />)
  // assertions...
})
```

## Commands

| Command        | Purpose                                                      |
|----------------|--------------------------------------------------------------|
| /improve-a11y  | Start the accessibility enhancement workflow                 |
| /add-feature   | Begin feature development with docs and migrations           |
| /merge-pr      | Merge a pull request after review                            |
```
