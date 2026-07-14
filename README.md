# SQL Practice Dashboard — Next.js + Neon

This project was migrated from a custom Node HTTP server and static HTML/JavaScript to a single Next.js App Router application.

## Structure

- `app/page.js` — dashboard page
- `components/` — React UI components
- `app/api/*/route.js` — API endpoints
- `lib/db.js` — Neon PostgreSQL pool
- `seed-neon.js` — database seed script

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Put your Neon connection string in `.env.local`:

   ```env
   NEON_DB=postgresql://USER:PASSWORD@HOST/neondb?sslmode=verify-full
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

The Next.js server handles both the React frontend and the API routes, so a separate Express process is no longer needed.

## Database seeding

The included seed script reads `NEON_DB`. Node does not automatically load `.env.local` for standalone scripts, so run it with an environment file or rename/copy the variable into `.env` before seeding.

```bash
npm run seed
```

## Safety

The query endpoint accepts one `SELECT` or `WITH ... SELECT` statement, runs it inside a read-only transaction, and applies a 10-second statement timeout. Do not expose a database owner connection string publicly; for deployment, use a dedicated read-only PostgreSQL role for this application.
