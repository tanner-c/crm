Full Stack CRM
================

This is a full stack Customer Relationship Management (CRM) application built with a React frontend and a Node.js backend using Express and Prisma ORM.

Getting Started
----------------

To set up the development environment, follow these steps:

1. Clone the repo
2. `cd server && npm install`
3. `cd ../client && npm install`
4. Set up your `.env` files.
5. Start PostgreSQL in Docker with `docker-compose up -d`
6. Run database migrations and seed the database:
   - `cd ../server`
   - `npx prisma migrate deploy`
   - `npx prisma db seed`
7. Start the development servers:
    - In `server` directory: `npm run dev`
    - In `client` directory: `npx vite`