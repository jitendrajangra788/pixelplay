# Nexora

A gaming promotion site: public pages for categories, videos, photos, journal posts, FAQ, and contact, plus an admin for the same records. Content is stored in PostgreSQL.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` starts a local PostgreSQL instance on port 5432, applies migrations, seeds the library when it is empty, and opens Next.js at [http://localhost:3000](http://localhost:3000).

The first start downloads PostgreSQL binaries and the seed images. Later starts reuse `data/pg`.

## Admin

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: `admin@nexora.gg`
- Password: `Admin@12345`

The password is created only when that admin does not exist yet. Change `ADMIN_PASSWORD` in `.env` before the first seed if you want a different one.

## Useful commands

- `npm run db:migrate` applies SQL migrations to the database named in `DATABASE_URL`.
- `npm run db:seed` loads the starter library when no categories exist.
- `npm run build` generates the Prisma client and builds the Next.js app. PostgreSQL must already be running.

To use your own PostgreSQL server, point `DATABASE_URL` at it and run `npm run dev:next` after `npm run db:migrate` and `npm run db:seed`.

## Deploy

The GitHub repository is [pixelplay](https://github.com/jitendrajangra788/pixelplay). Vercel needs a hosted PostgreSQL database, not the local one started by `npm run dev`.

Set these environment variables on Vercel, then run `npx prisma migrate deploy` and `npm run db:seed` against that database:

- `DATABASE_URL`
- `AUTH_SECRET` (at least 32 characters)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` (the Vercel URL)
