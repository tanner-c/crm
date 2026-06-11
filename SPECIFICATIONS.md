# Game Store Management System - API Specification

## Overview

This document describes all backend routes, data models, and API behaviors for the Game Store Management System.

All routes are prefixed with `/api/` and require JWT authentication (except login/register).

---

## 1. Data Models (Prisma)

### 1.1 User

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sales     Sale[]
  activities Activity[]
}

enum Role {
  USER      // Regular employee
  MANAGER   // Can view reports
  ADMIN     // Full system access
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `name`: Full name of user
- `email`: Email address (unique constraint)
- `password`: Hashed password
- `role`: User's role determining permissions
- `createdAt`, `updatedAt`: Timestamps

---

### 1.2 Customer

```prisma
model Customer {
  id           String       @id @default(cuid())
  name         String
  email        String?
  phone        String?
  loyaltyTier  LoyaltyTier  @default(STANDARD)
  totalSpent   Float        @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  sales        Sale[]
  activities   Activity[]
}

enum LoyaltyTier {
  STANDARD    // Base tier
  GOLD        // 5%+ discount eligible
  PLATINUM    // 10%+ discount eligible
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `name`: Customer name
- `email`: Optional email address
- `phone`: Optional phone number
- `loyaltyTier`: Loyalty tier affecting discounts
- `totalSpent`: Accumulated spending amount (auto-calculated)
- `createdAt`, `updatedAt`: Timestamps

---

### 1.3 Game

```prisma
model Game {
  id           String        @id @default(cuid())
  name         String
  platform     Platform
  genre        String?
  description  String?
  price        Float
  stockLevel   Int           @default(0)
  coverUrl     String?       // URL from MobyGames
  mobyGameId   Int?          // MobyGames unique ID
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  lineItems    SaleLineItem[]
}

enum Platform {
  PC            // Windows/Mac
  PLAYSTATION   // PS4, PS5
  XBOX          // Xbox One, Series X|S
  NINTENDO      // Switch, Wii U
  MOBILE        // iOS, Android
  OTHER         // Unspecified platform
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `name`: Game title
- `platform`: Target platform
- `genre`: Game genre (RPG, FPS, Strategy, etc.)
- `description`: Game description/synopsis
- `price`: Retail price per unit
- `stockLevel`: Current inventory count
- `coverUrl`: URL to game cover art (from MobyGames)
- `mobyGameId`: Reference to MobyGames database ID
- `createdAt`, `updatedAt`: Timestamps

---

### 1.4 Sale

```prisma
model Sale {
  id           String      @id @default(cuid())
  customerId   String
  totalAmount  Float       @default(0)
  status       SaleStatus  @default(PENDING)
  saleDate     DateTime    @default(now())
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  customer     Customer    @relation(fields: [customerId], references: [id])
  lineItems    SaleLineItem[]
}

enum SaleStatus {
  PENDING      // Not yet finalized
  COMPLETED    // Transaction complete, inventory reduced
  CANCELLED    // Sale cancelled, no inventory impact
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `customerId`: Reference to Customer
- `totalAmount`: Total sale amount (auto-calculated from line items)
- `status`: Sale status affecting inventory treatment
- `saleDate`: Date of sale
- `createdAt`, `updatedAt`: Timestamps

---

### 1.5 SaleLineItem

```prisma
model SaleLineItem {
  id           String    @id @default(cuid())
  saleId       String
  gameId       String
  quantity     Int
  pricePerUnit Float
  subtotal     Float     // quantity × pricePerUnit
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  sale         Sale      @relation(fields: [saleId], references: [id], onDelete: Cascade)
  game         Game      @relation(fields: [gameId], references: [id])
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `saleId`: Reference to Sale (cascade delete)
- `gameId`: Reference to Game
- `quantity`: Number of units sold
- `pricePerUnit`: Price per unit at time of sale
- `subtotal`: quantity × pricePerUnit (stored for historical accuracy)
- `createdAt`, `updatedAt`: Timestamps

---

### 1.6 Activity

```prisma
model Activity {
  id         String       @id @default(cuid())
  type       ActivityType
  subject    String
  body       String?
  ownerId    String?
  customerId String?
  saleId     String?
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  owner      User?        @relation(fields: [ownerId], references: [id])
  customer   Customer?    @relation(fields: [customerId], references: [id])
  sale       Sale?        @relation(fields: [saleId], references: [id])
}

enum ActivityType {
  NOTE       // General note
  TASK       // Task to complete
  CALL       // Phone call
  MEETING    // In-person meeting
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `type`: Activity type
- `subject`: Subject/title
- `body`: Details or description
- `ownerId`: Staff member who performed activity
- `customerId`: Related customer (optional)
- `saleId`: Related sale (optional)
- `createdAt`, `updatedAt`: Timestamps

---

## 2. API Endpoints

All endpoints return JSON with status codes:
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

### 2.1 Authentication

#### POST `/auth/register`
Register new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8 chars)"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET `/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "role": "USER|MANAGER|ADMIN",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2.2 Users

#### GET `/users`
List all users (Admin only).

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "role": "USER|MANAGER|ADMIN",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

---

#### GET `/users/:id`
Get single user by ID.

**Response (200):** Single user object

---

#### PATCH `/users/:id`
Update user (Admin only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "role": "USER|MANAGER|ADMIN (optional)"
}
```

**Response (200):** Updated user object

---

#### DELETE `/users/:id`
Delete user (Admin only).

**Response (204):** No content

---

### 2.3 Customers

#### GET `/customers`
List all customers (paginated, filterable).

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)
- `loyaltyTier`: Filter by tier (STANDARD, GOLD, PLATINUM)

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "loyaltyTier": "STANDARD|GOLD|PLATINUM",
      "totalSpent": 1500.50,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42
}
```

---

#### POST `/customers`
Create new customer.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "loyaltyTier": "STANDARD|GOLD|PLATINUM (optional)"
}
```

**Response (201):** Customer object with auto-generated `id`

---

#### GET `/customers/:id`
Get customer details with sales history.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "loyaltyTier": "STANDARD",
  "totalSpent": 1500.50,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "sales": [
    {
      "id": "cuid",
      "totalAmount": 150.00,
      "status": "COMPLETED",
      "saleDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### PATCH `/customers/:id`
Update customer.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "loyaltyTier": "STANDARD|GOLD|PLATINUM (optional)"
}
```

**Response (200):** Updated customer object

---

#### DELETE `/customers/:id`
Delete customer.

**Response (204):** No content

---

### 2.4 Inventory (Games)

#### GET `/inventory`
List all games with optional filtering.

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)
- `platform`: Filter by platform (PC, PLAYSTATION, XBOX, NINTENDO, MOBILE, OTHER)
- `genre`: Filter by genre (case-insensitive substring match)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "string",
      "platform": "PC|PLAYSTATION|XBOX|NINTENDO|MOBILE|OTHER",
      "genre": "string",
      "description": "string",
      "price": 49.99,
      "stockLevel": 25,
      "coverUrl": "https://...",
      "mobyGameId": 12345,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 156
}
```

---

#### POST `/inventory`
Manually add game to inventory.

**Request Body:**
```json
{
  "name": "string (required)",
  "platform": "PC|PLAYSTATION|... (required)",
  "genre": "string (optional)",
  "description": "string (optional)",
  "price": "number (required)",
  "stockLevel": "number (optional, default 0)",
  "coverUrl": "string (optional)",
  "mobyGameId": "number (optional)"
}
```

**Response (201):** Game object

---

#### GET `/inventory/search?q=<query>`
Search MobyGames API for games.

**Query Parameters:**
- `q`: Search query (game name)
- `timeout`: Optional timeout in ms (default 5000)

**Response (200):**
```json
{
  "results": [
    {
      "mobyGameId": 12345,
      "name": "string",
      "genres": ["string"],
      "platforms": ["string"],
      "description": "string",
      "coverUrl": "https://..."
    }
  ]
}
```

---

#### POST `/inventory/add-from-search`
Add game to inventory using MobyGames search results.

**Request Body:**
```json
{
  "name": "string",
  "platform": "PC|PLAYSTATION|...",
  "mobyGameId": 12345,
  "price": 49.99,
  "stockLevel": 10,
  "genre": "string (optional)",
  "description": "string (optional)",
  "coverUrl": "string (optional)"
}
```

**Response (201):** Game object

---

#### GET `/inventory/:id`
Get game details with sales history.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string",
  "platform": "PC",
  "genre": "string",
  "description": "string",
  "price": 49.99,
  "stockLevel": 25,
  "coverUrl": "https://...",
  "mobyGameId": 12345,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lineItems": [
    {
      "id": "cuid",
      "saleId": "cuid",
      "quantity": 2,
      "pricePerUnit": 49.99,
      "subtotal": 99.98,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### PATCH `/inventory/:id`
Update game.

**Request Body:**
```json
{
  "name": "string (optional)",
  "genre": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional)",
  "stockLevel": "number (optional)"
}
```

**Response (200):** Updated game object

---

#### DELETE `/inventory/:id`
Delete game from inventory.

**Response (204):** No content

---

### 2.5 Sales

#### GET `/sales`
List all sales (paginated).

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "customerId": "cuid",
      "totalAmount": 150.00,
      "status": "COMPLETED|PENDING|CANCELLED",
      "saleDate": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 248
}
```

---

#### POST `/sales`
Create new sale with line items.

**Request Body:**
```json
{
  "customerId": "string (required)",
  "lineItems": [
    {
      "gameId": "string (required)",
      "quantity": "number (required, >= 1)"
    }
  ],
  "status": "PENDING|COMPLETED|CANCELLED (optional, default PENDING)",
  "saleDate": "ISO string (optional, default now)"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "customerId": "cuid",
  "totalAmount": 150.00,
  "status": "PENDING",
  "saleDate": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lineItems": [
    {
      "id": "cuid",
      "saleId": "cuid",
      "gameId": "cuid",
      "quantity": 2,
      "pricePerUnit": 49.99,
      "subtotal": 99.98,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/sales/:id`
Get sale details with line items and customer info.

**Response (200):** Sale object with lineItems expanded

---

#### PATCH `/sales/:id`
Update sale.

**Request Body:**
```json
{
  "customerId": "string (optional)",
  "status": "PENDING|COMPLETED|CANCELLED (optional)",
  "lineItems": [
    {
      "gameId": "string",
      "quantity": "number"
    }
  ]
}
```

**Response (200):** Updated sale object

---

#### DELETE `/sales/:id`
Delete sale (reverses inventory if COMPLETED).

**Response (204):** No content

---

### 2.6 Reports

#### GET `/reports/sales-summary`
Get sales metrics and summary statistics.

**Response (200):**
```json
{
  "totalSales": 248,
  "totalRevenue": 12500.00,
  "averageOrderValue": 50.40,
  "completedSales": 200,
  "pendingSales": 48,
  "cancelledSales": 0
}
```

---

#### GET `/reports/revenue-by-customer`
Get total revenue grouped by customer (top 20).

**Response (200):**
```json
{
  "data": [
    {
      "customerId": "cuid",
      "customerName": "string",
      "totalRevenue": 1500.50,
      "purchaseCount": 12
    }
  ]
}
```

---

#### GET `/reports/top-selling-games`
Get top selling games by quantity and revenue.

**Response (200):**
```json
{
  "byQuantity": [
    {
      "gameId": "cuid",
      "gameName": "string",
      "totalQuantity": 150,
      "platform": "PC"
    }
  ],
  "byRevenue": [
    {
      "gameId": "cuid",
      "gameName": "string",
      "totalRevenue": 5000.00,
      "totalQuantity": 100,
      "platform": "PC"
    }
  ]
}
```

---

#### GET `/reports/user-performance`
Get sales performance metrics per user.

**Response (200):**
```json
{
  "data": [
    {
      "userId": "cuid",
      "userName": "string",
      "totalSales": 45,
      "totalRevenue": 2250.00,
      "averageOrderValue": 50.00
    }
  ]
}
```

---

### 2.7 Activities

#### GET `/activities`
List activities (filter by customerId or saleId).

**Query Parameters:**
- `customerId`: Filter by customer
- `saleId`: Filter by sale

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "type": "NOTE|TASK|CALL|MEETING",
      "subject": "string",
      "body": "string",
      "ownerId": "cuid",
      "customerId": "cuid",
      "saleId": "cuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/activities`
Create activity.

**Request Body:**
```json
{
  "type": "NOTE|TASK|CALL|MEETING (required)",
  "subject": "string (required)",
  "body": "string (optional)",
  "customerId": "string (optional)",
  "saleId": "string (optional)"
}
```

**Response (201):** Activity object

---

#### PATCH `/activities/:id`
Update activity.

**Request Body:**
```json
{
  "subject": "string (optional)",
  "body": "string (optional)",
  "type": "NOTE|TASK|CALL|MEETING (optional)"
}
```

**Response (200):** Updated activity object

---

#### DELETE `/activities/:id`
Delete activity.

**Response (204):** No content

---

## 3. Error Handling

All errors return JSON with the following format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

**Common Errors:**
- `Missing required field: name` - Validation failed
- `Customer not found` - Resource not found
- `Unauthorized` - Missing/invalid JWT
- `Insufficient permissions` - User lacks required role
- `MobyGames API unavailable` - External service timeout

---

## 4. Authentication & Authorization

All endpoints except `/auth/register` and `/auth/login` require JWT token.

**Permissions by Role:**
- `USER`: Can view/create sales, view inventory, manage own activities
- `MANAGER`: All USER permissions + view reports
- `ADMIN`: Full system access + user management

**Token Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Rate Limiting & Performance

- MobyGames API search: 5 second timeout per request
- Pagination limit: Max 100 items per page
- Search queries: Case-insensitive substring matching on game names
- Database indexes on: customerId, gameId, saleId, email, platform

---

## 6. Seed Data

Default seed creates:
- 3 users: admin, manager, user (see prisma/seed.ts for credentials)
- 15 customers with varied loyalty tiers
- 23 games across 5 platforms
- 8 sample sales transactions
- Activity log entries for audit trail

Reset with: `npx prisma db seed`