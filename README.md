Game Store Management System
=============================

> [!TIP] Design Documents
> * [UML Class Diagram](docs/uml_class_diagram.md)
> * [Design Diagram](docs/design_diagrams.md)
> * [API Specifications](SPECIFICATIONS.md)


> [!IMPORTANT] Documentation
> * [User Guide](docs/user_guide.md)
> * [Developer/Maintenance Guide](#getting-started)


> [!CAUTION] Testing
> * [Test Changes Summary](docs/test_changes_summary.md)
> * [Manual Testing Checklist](#manual-testing)
> * [Test Results](docs/test_suite_results.png)
> * [Test Plan](docs/test_plan.md)

A full stack game retail management application for managing inventory, sales, and customer loyalty. Built with React 19, Express, PostgreSQL, and Prisma ORM.

## Features

- 🎮 **Game Inventory Management**: Add, edit, delete games with platforms (PC, PlayStation, Xbox, Nintendo, Mobile), pricing, and stock tracking
- 🔍 **IGDB Integration**: Search for games from IGDB API and auto-populate inventory with game details
- 👥 **Customer Management**: Manage customers with loyalty tier tracking (Standard, Gold, Platinum) and purchase history
- 💰 **Sales Management**: Create sales transactions with multi-item line items and real-time inventory tracking
- 📊 **Analytics & Reports**: View sales summaries, revenue by customer, top selling games, and staff performance metrics
- 🔐 **Role-Based Access**: Support for User, Manager, and Admin roles with appropriate permissions
- 🎯 **Stock Alerts**: Track low-stock inventory with dedicated low-stock view

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast development and production builds
- Tailwind CSS v4 for styling
- React Router v7 for navigation
- Axios for API requests

**Backend:**
- Node.js with Express
- PostgreSQL 15 database
- Prisma 6 ORM for database management
- JWT authentication
- TypeScript for type safety

**DevOps:**
- Docker and Docker Compose for PostgreSQL
- GitHub for version control

## Project Structure

```
crm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components and forms
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── router/        # Route configuration
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth and other middleware
│   │   ├── prisma/        # Database schema and migrations
│   │   ├── services/      # Business logic (MobyGames API)
│   │   └── utils/         # Utility functions
│   ├── tests/             # Jest test files
│   └── package.json
├── docs/                  # Documentation and screenshots
├── docker-compose.yml     # PostgreSQL setup
└── SPECIFICATIONS.md      # API documentation
```

## Getting Started

### Prerequisites
- Node.js v18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd crm
   ```

2. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables**
   Create `.env` files:
   
   **server/.env:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/game_store
   JWT_SECRET=your-secret-key
   PORT=5000
   NODE_ENV=development
   IGDB_CLIENT_ID=your-client-id
   IGDB_CLIENT_SECRET=your-client-secret
   ```
   
   **client/.env.local:**
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Initialize database**
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Start development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Default login: admin@example.com / password

## API Overview

### Key Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

**Customers**
- `GET /api/customers` - List customers (paginated)
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Inventory**
- `GET /api/inventory` - List games (paginated, filterable)
- `POST /api/inventory` - Add game manually
- `GET /api/inventory/search?q=<query>` - Search MobyGames API
- `POST /api/inventory/add-from-search` - Add game from search results
- `GET /api/inventory/:id` - Get game details with sales history
- `PATCH /api/inventory/:id` - Update game
- `DELETE /api/inventory/:id` - Delete game

**Sales**
- `GET /api/sales` - List sales (paginated)
- `POST /api/sales` - Create sale with line items
- `GET /api/sales/:id` - Get sale details
- `PATCH /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

**Reports**
- `GET /api/reports/sales-summary` - Sales metrics
- `GET /api/reports/revenue-by-customer` - Revenue breakdown by customer
- `GET /api/reports/top-selling-games` - Top games by quantity and revenue
- `GET /api/reports/user-performance` - Staff performance metrics

See [SPECIFICATIONS.md](SPECIFICATIONS.md) for complete API documentation.

## Database Schema

### Core Tables
- **User**: System users with roles (USER, MANAGER, ADMIN)
- **Customer**: Retail customers with loyalty tier tracking
- **Game**: Game inventory with platforms, pricing, and stock
- **Sale**: Sales transactions with status tracking
- **SaleLineItem**: Individual items within sales (normalized from sales)
- **Activity**: Audit trail for notes, tasks, calls, meetings

See `server/src/prisma/schema.prisma` for detailed schema.

## Key Features

### Inventory Management
- Support for 6 platforms: PC, PlayStation, Xbox, Nintendo, Mobile, Other
- MobyGames API integration for quick game addition
- Stock level tracking with low-stock alerts
- Genre and platform filtering

### Sales Processing
- Multi-item sales with automatic line item calculation
- Real-time inventory deduction (can be configured)
- Sales status tracking: Pending, Completed, Cancelled
- Automatic subtotal calculation based on game prices

### Customer Management
- Loyalty tier system: Standard, Gold, Platinum
- Total spend tracking per customer
- Sales history per customer
- Email and phone contact management

### Analytics & Reporting
- 4 comprehensive report views
- Sales summary metrics
- Revenue analysis by customer
- Top selling games ranking
- Staff performance metrics

## Development

### Build Frontend
```bash
cd client
npm run build
```

### Run Backend Tests
```bash
cd server
npm test
```

### Run Development Server
```bash
# Start both with npm run dev in each directory
```

### Database Management
```bash
# Create migration
cd server
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# View database GUI
npx prisma studio
```

## Testing

### Unit Tests
Backend tests are located in `server/tests/`:
- `accounts.test.ts` - Customer management tests
- `app.test.ts` - Application and auth tests
- Additional tests for routes and business logic

Run tests with:
```bash
cd server
npm test
```

### Manual Testing
1. Login with test user: admin@example.com
2. Navigate to Customers page and test add/edit/delete
3. Navigate to Inventory page and test:
   - Browsing games
   - Searching MobyGames API
   - Adding/editing games
   - Filtering by platform
4. Navigate to Sales page and test:
   - Creating sales with multiple line items
   - Updating sale status
   - Deleting sales
5. Check Reports for metrics accuracy

## Database Seeding

The seed script (`server/src/prisma/seed.ts`) creates:
- 3 test users with different roles
- 15 sample customers with loyalty tiers
- 23 games across various platforms and genres
- 8 sample sales transactions

Re-seed with:
```bash
npx prisma db seed
```

## Deployment

### Build for Production
```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

### Environment Variables (Production)
Update `.env` files with production database and API URLs.

### Deploy to Render
Configure through `render.yaml` for automatic deployments.