# Game Store Management System - API Specification

## Overview

This document describes all backend routes, data models, and API behaviors for the Game Store Management System.

All routes are prefixed with `/api/` and require JWT authentication (except register, login, and public registration).

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

  customers  Customer[]
  sales      Sale[]
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
  id          String   @id @default(cuid())
  name        String
  email       String?
  phone       String?
  loyaltyTier String?  @default("STANDARD")
  totalSpent  Float    @default(0)
  ownerId     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner      User?      @relation(fields: [ownerId], references: [id])
  sales      Sale[]
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `name`: Customer name
- `email`: Optional email address
- `phone`: Optional phone number
- `loyaltyTier`: Optional string field indicating customer loyalty level (standard values: `"STANDARD"`, `"GOLD"`, `"PLATINUM"`)
- `totalSpent`: Accumulated spending amount
- `ownerId`: Optional foreign key to User indicating assigned sales representative / owner
- `createdAt`, `updatedAt`: Timestamps

---

### 1.3 Game

```prisma
model Game {
  id          String    @id @default(cuid())
  mobyGameId  Int?
  name        String
  platform    Platform
  genre       String?
  description String?
  coverArtUrl String?
  releaseDate DateTime?
  price       Float
  stockLevel  Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  lineItems SaleLineItem[]
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
- `mobyGameId`: Optional reference to MobyGames database ID
- `name`: Game title
- `platform`: Target platform
- `genre`: Game genre (RPG, FPS, Strategy, etc.)
- `description`: Game description/synopsis
- `coverArtUrl`: Optional URL to game cover art (from MobyGames or custom)
- `releaseDate`: Optional game release date
- `price`: Retail price per unit
- `stockLevel`: Current inventory count
- `createdAt`, `updatedAt`: Timestamps

---

### 1.4 Sale

```prisma
model Sale {
  id          String     @id @default(cuid())
  customerId  String
  totalAmount Float
  status      SaleStatus @default(PENDING)
  saleDate    DateTime   @default(now())
  ownerId     String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  customer   Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  owner      User?          @relation(fields: [ownerId], references: [id])
  lineItems  SaleLineItem[]
}

enum SaleStatus {
  PENDING      // Not yet finalized
  COMPLETED    // Transaction complete, inventory reduced
  CANCELLED    // Sale cancelled, no inventory impact
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `customerId`: Reference to Customer (with cascade delete constraint)
- `totalAmount`: Total sale amount
- `status`: Sale status affecting inventory treatment
- `saleDate`: Date of sale
- `ownerId`: Optional reference to User representing the seller
- `createdAt`, `updatedAt`: Timestamps

---

### 1.5 SaleLineItem

```prisma
model SaleLineItem {
  id           String   @id @default(cuid())
  saleId       String
  gameId       String
  quantity     Int
  pricePerUnit Float
  subtotal     Float
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sale Sale @relation(fields: [saleId], references: [id], onDelete: Cascade)
  game Game @relation(fields: [gameId], references: [id], onDelete: Restrict)

  @@unique([saleId, gameId])
}
```

**Fields:**
- `id`: Unique identifier (cuid)
- `saleId`: Reference to Sale (cascade delete)
- `gameId`: Reference to Game (restrict delete)
- `quantity`: Number of units sold
- `pricePerUnit`: Price per unit at time of sale
- `subtotal`: quantity × pricePerUnit
- `createdAt`, `updatedAt`: Timestamps

---

## 2. API Endpoints

All endpoints return JSON with status codes:
- `200 OK` - Successful operation
- `201 Created` - Successful resource creation
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g. unique constraint violated)
- `500 Internal Server Error` - Server error

---

### 2.1 Authentication & Status

#### GET `/api/status`
Check system status.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-06-14T20:49:16.000Z"
}
```

---

#### POST `/api/auth/register`
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
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

#### POST `/api/auth/login`
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
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

#### GET `/api/auth/me`
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
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

### 2.2 Users

#### GET `/api/users`
List all users (authenticated only).

**Response (200):**
```json
[
  {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "role": "USER|MANAGER|ADMIN",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
]
```

---

#### GET `/api/users/:id`
Get single user by ID.

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "role": "USER|MANAGER|ADMIN",
  "createdAt": "2026-06-14T20:49:16.000Z",
  "updatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### POST `/api/users`
Create new user. Public registration is allowed. If a role is specified, only admins can assign it.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "USER|MANAGER|ADMIN (optional)"
}
```

**Response (201):**
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "role": "USER|MANAGER|ADMIN",
  "createdAt": "2026-06-14T20:49:16.000Z",
  "updatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### PATCH `/api/users/:id`
Update user (Admin only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "role": "USER|MANAGER|ADMIN (optional)"
}
```

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "role": "USER|MANAGER|ADMIN",
  "createdAt": "2026-06-14T20:49:16.000Z",
  "updatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### DELETE `/api/users/:id`
Delete user (Admin only).

**Response (200):**
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "role": "USER|MANAGER|ADMIN",
  "createdAt": "2026-06-14T20:49:16.000Z",
  "updatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

### 2.3 Customers

#### GET `/api/customers`
List all customers (paginated).

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10, max 100)

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
      "ownerId": "cuid",
      "createdAt": "2026-06-14T20:49:16.000Z",
      "updatedAt": "2026-06-14T20:49:16.000Z",
      "owner": {
        "id": "cuid",
        "name": "string",
        "email": "string",
        "role": "USER"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

---

#### POST `/api/customers`
Create new customer.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "loyaltyTier": "string (optional, default STANDARD)",
  "ownerId": "string (optional)"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "loyaltyTier": "STANDARD",
    "totalSpent": 0,
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "owner": {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "role": "USER"
    }
  }
}
```

---

#### GET `/api/customers/:id`
Get customer details with sales history and owner info.

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "loyaltyTier": "STANDARD",
    "totalSpent": 1500.50,
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "owner": {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "role": "USER"
    },
    "sales": [
      {
        "id": "cuid",
        "customerId": "cuid",
        "totalAmount": 150.00,
        "status": "COMPLETED",
        "saleDate": "2026-06-14T20:49:16.000Z",
        "ownerId": "cuid",
        "createdAt": "2026-06-14T20:49:16.000Z",
        "updatedAt": "2026-06-14T20:49:16.000Z",
        "lineItems": [
          {
            "id": "cuid",
            "saleId": "cuid",
            "gameId": "cuid",
            "quantity": 2,
            "pricePerUnit": 75.00,
            "subtotal": 150.00,
            "createdAt": "2026-06-14T20:49:16.000Z",
            "updatedAt": "2026-06-14T20:49:16.000Z",
            "game": {
              "id": "cuid",
              "name": "string",
              "price": 75.00
            }
          }
        ],
        "owner": {
          "id": "cuid",
          "name": "string"
        }
      }
    ]
  }
}
```

---

#### GET `/api/customers/user/:userId`
Get all customers assigned to a specific user/owner.

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "loyaltyTier": "STANDARD",
      "totalSpent": 1500.50,
      "ownerId": "userId",
      "createdAt": "2026-06-14T20:49:16.000Z",
      "updatedAt": "2026-06-14T20:49:16.000Z",
      "owner": {
        "id": "userId",
        "name": "string"
      }
    }
  ]
}
```

---

#### PATCH `/api/customers/:id`
Update customer.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "loyaltyTier": "string (optional)",
  "totalSpent": "number (optional)",
  "ownerId": "string (optional)"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "loyaltyTier": "STANDARD",
    "totalSpent": 1500.50,
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "owner": {
      "id": "cuid",
      "name": "string"
    }
  }
}
```

---

#### DELETE `/api/customers/:id`
Delete customer.

**Response (200):**
```json
{
  "message": "Customer deleted successfully"
}
```

---

### 2.4 Inventory (Games)

#### GET `/api/inventory`
List all games with optional filtering.

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10, max 100)
- `platform`: Filter by platform (PC, PLAYSTATION, XBOX, NINTENDO, MOBILE, OTHER - case insensitive)
- `genre`: Filter by genre (case-insensitive substring match)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "mobyGameId": 12345,
      "name": "string",
      "platform": "PC",
      "genre": "string",
      "description": "string",
      "coverArtUrl": "https://...",
      "releaseDate": "2026-06-14T20:49:16.000Z",
      "price": 49.99,
      "stockLevel": 25,
      "createdAt": "2026-06-14T20:49:16.000Z",
      "updatedAt": "2026-06-14T20:49:16.000Z"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

---

#### POST `/api/inventory`
Manually add game to inventory (Admin only).

**Request Body:**
```json
{
  "name": "string (required)",
  "platform": "PC|PLAYSTATION|... (required)",
  "genre": "string (optional)",
  "description": "string (optional)",
  "coverArtUrl": "string (optional)",
  "releaseDate": "ISO string (optional)",
  "price": "number (required)",
  "stockLevel": "number (optional, default 0)"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "cuid",
    "mobyGameId": null,
    "name": "string",
    "platform": "PC",
    "genre": "string",
    "description": "string",
    "coverArtUrl": "https://...",
    "releaseDate": "2026-06-14T20:49:16.000Z",
    "price": 49.99,
    "stockLevel": 25,
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

#### GET `/api/inventory/search?q=<query>`
Search MobyGames API for games.

**Query Parameters:**
- `q`: Search query (game name, minimum 2 characters)

**Response (200):**
```json
{
  "data": [
    {
      "mobyGameId": 12345,
      "name": "string",
      "description": "string",
      "platforms": ["string"],
      "genres": ["string"],
      "coverUrl": "https://...",
      "releaseDate": "2026-06-14T20:49:16.000Z"
    }
  ],
  "query": "string",
  "count": 1
}
```

---

#### POST `/api/inventory/add-from-search`
Add game to inventory using MobyGames search results (Admin only).

**Request Body:**
```json
{
  "mobyGameId": 12345 (optional),
  "name": "string (required)",
  "platform": "PC|PLAYSTATION|... (required)",
  "genre": "string (optional)",
  "description": "string (optional)",
  "coverArtUrl": "string (optional)",
  "releaseDate": "ISO string (optional)",
  "price": "number (optional, default 29.99)",
  "stockLevel": "number (optional, default 0)"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "cuid",
    "mobyGameId": 12345,
    "name": "string",
    "platform": "PC",
    "genre": "string",
    "description": "string",
    "coverArtUrl": "https://...",
    "releaseDate": "2026-06-14T20:49:16.000Z",
    "price": 29.99,
    "stockLevel": 10,
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

#### GET `/api/inventory/:id`
Get game details with sales line items history.

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "mobyGameId": 12345,
    "name": "string",
    "platform": "PC",
    "genre": "string",
    "description": "string",
    "coverArtUrl": "https://...",
    "releaseDate": "2026-06-14T20:49:16.000Z",
    "price": 49.99,
    "stockLevel": 25,
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "lineItems": [
      {
        "id": "cuid",
        "saleId": "cuid",
        "gameId": "cuid",
        "quantity": 2,
        "pricePerUnit": 49.99,
        "subtotal": 99.98,
        "createdAt": "2026-06-14T20:49:16.000Z",
        "updatedAt": "2026-06-14T20:49:16.000Z",
        "sale": {
          "id": "cuid",
          "customerId": "cuid",
          "totalAmount": 99.98,
          "status": "COMPLETED",
          "saleDate": "2026-06-14T20:49:16.000Z"
        }
      }
    ]
  }
}
```

---

#### PATCH `/api/inventory/:id`
Update game details (Admin only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "platform": "PC|PLAYSTATION|... (optional)",
  "genre": "string (optional)",
  "description": "string (optional)",
  "coverArtUrl": "string (optional)",
  "releaseDate": "ISO string (optional)",
  "price": "number (optional)",
  "stockLevel": "number (optional)"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "mobyGameId": 12345,
    "name": "string",
    "platform": "PC",
    "genre": "string",
    "description": "string",
    "coverArtUrl": "https://...",
    "releaseDate": "2026-06-14T20:49:16.000Z",
    "price": 49.99,
    "stockLevel": 30,
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z"
  }
}
```

---

#### DELETE `/api/inventory/:id`
Delete game from inventory (Admin only). If the game has existing sales line items, the deletion will fail with a `400 Bad Request`.

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "name": "string"
  },
  "message": "Game removed from inventory"
}
```

---

### 2.5 Sales

#### GET `/api/sales`
List all sales (paginated).

**Query Parameters:**
- `page`: Page number (default 1)
- `limit`: Results per page (default 10, max 100)

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "customerId": "cuid",
      "totalAmount": 150.00,
      "status": "COMPLETED|PENDING|CANCELLED",
      "saleDate": "2026-06-14T20:49:16.000Z",
      "ownerId": "cuid",
      "createdAt": "2026-06-14T20:49:16.000Z",
      "updatedAt": "2026-06-14T20:49:16.000Z",
      "customer": {
        "id": "cuid",
        "name": "string"
      },
      "owner": {
        "id": "cuid",
        "name": "string"
      },
      "lineItems": [
        {
          "id": "cuid",
          "saleId": "cuid",
          "gameId": "cuid",
          "quantity": 2,
          "pricePerUnit": 75.00,
          "subtotal": 150.00,
          "game": {
            "id": "cuid",
            "name": "string"
          }
        }
      ]
    }
  ],
  "total": 248,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

---

#### POST `/api/sales`
Create new sale with line items. Deducts stock level automatically when the status is `COMPLETED`.

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
  "ownerId": "string (optional)",
  "status": "PENDING|COMPLETED|CANCELLED (optional, default PENDING)",
  "saleDate": "ISO string (optional, default now)"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "totalAmount": 150.00,
    "status": "PENDING",
    "saleDate": "2026-06-14T20:49:16.000Z",
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "customer": {
      "id": "cuid",
      "name": "string"
    },
    "owner": {
      "id": "cuid",
      "name": "string"
    },
    "lineItems": [
      {
        "id": "cuid",
        "saleId": "cuid",
        "gameId": "cuid",
        "quantity": 2,
        "pricePerUnit": 75.00,
        "subtotal": 150.00,
        "createdAt": "2026-06-14T20:49:16.000Z",
        "updatedAt": "2026-06-14T20:49:16.000Z",
        "game": {
          "id": "cuid",
          "name": "string"
        }
      }
    ]
  }
}
```

---

#### GET `/api/sales/:id`
Get sale details with line items and customer/owner details.

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "totalAmount": 150.00,
    "status": "COMPLETED",
    "saleDate": "2026-06-14T20:49:16.000Z",
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "customer": {
      "id": "cuid",
      "name": "string"
    },
    "owner": {
      "id": "cuid",
      "name": "string"
    },
    "lineItems": [
      {
        "id": "cuid",
        "saleId": "cuid",
        "gameId": "cuid",
        "quantity": 2,
        "pricePerUnit": 75.00,
        "subtotal": 150.00,
        "game": {
          "id": "cuid",
          "name": "string"
        }
      }
    ]
  }
}
```

---

#### GET `/api/sales/user/:userId`
Get all sales transactions belonging to a specific user.

**Response (200):**
```json
{
  "data": [
    {
      "id": "cuid",
      "customerId": "cuid",
      "totalAmount": 150.00,
      "status": "COMPLETED",
      "saleDate": "2026-06-14T20:49:16.000Z",
      "ownerId": "userId",
      "createdAt": "2026-06-14T20:49:16.000Z",
      "updatedAt": "2026-06-14T20:49:16.000Z",
      "customer": {
        "id": "cuid",
        "name": "string"
      },
      "owner": {
        "id": "userId",
        "name": "string"
      },
      "lineItems": [
        {
          "id": "cuid",
          "saleId": "cuid",
          "gameId": "cuid",
          "quantity": 2,
          "pricePerUnit": 75.00,
          "subtotal": 150.00,
          "game": {
            "id": "cuid",
            "name": "string"
          }
        }
      ]
    }
  ]
}
```

---

#### PATCH `/api/sales/:id`
Update sale info (status, saleDate, ownerId). Updates inventory stock level dynamically if sale status transitions.

**Request Body:**
```json
{
  "status": "PENDING|COMPLETED|CANCELLED (optional)",
  "saleDate": "ISO string (optional)",
  "ownerId": "string (optional)"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "totalAmount": 150.00,
    "status": "COMPLETED",
    "saleDate": "2026-06-14T20:49:16.000Z",
    "ownerId": "cuid",
    "createdAt": "2026-06-14T20:49:16.000Z",
    "updatedAt": "2026-06-14T20:49:16.000Z",
    "customer": {
      "id": "cuid",
      "name": "string"
    },
    "owner": {
      "id": "cuid",
      "name": "string"
    },
    "lineItems": [
      {
        "id": "cuid",
        "saleId": "cuid",
        "gameId": "cuid",
        "quantity": 2,
        "pricePerUnit": 75.00,
        "subtotal": 150.00,
        "game": {
          "id": "cuid",
          "name": "string"
        }
      }
    ]
  }
}
```

---

#### DELETE `/api/sales/:id`
Delete sale (automatically deletes all associated line items). Reverses inventory stock counts if the sale status was `COMPLETED`.

**Response (200):**
```json
{
  "message": "Sale deleted successfully"
}
```

---

### 2.6 Reports

#### GET `/api/reports/sales-summary`
Get overall sales metrics and summary statistics.

**Response (200):**
```json
{
  "data": {
    "totalSales": 248,
    "totalRevenue": 12500.00,
    "averageSaleValue": 50.40,
    "totalCustomers": 15,
    "totalGamiesSold": 300
  },
  "generatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### GET `/api/reports/revenue-by-customer`
Get total revenue grouped by customer (ordered by total revenue descending).

**Query Parameters:**
- `userId`: Optional user ID to filter sales owner
- `limit`: Optional maximum customers to return (default 50, max 100)

**Response (200):**
```json
{
  "data": [
    {
      "customerId": "cuid",
      "customerName": "string",
      "totalRevenue": 1500.50,
      "saleCount": 12,
      "averageSaleValue": 125.04
    }
  ],
  "total": 1500.50,
  "generatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### GET `/api/reports/top-selling-games`
Get top selling games by quantity and revenue (ordered by total revenue descending).

**Query Parameters:**
- `limit`: Optional maximum games to return (default 20, max 100)

**Response (200):**
```json
{
  "data": [
    {
      "gameId": "cuid",
      "gameName": "string",
      "platform": "PC",
      "quantitySold": 150,
      "totalRevenue": 5000.00,
      "averagePricePerUnit": 33.33
    }
  ],
  "count": 1,
  "generatedAt": "2026-06-14T20:49:16.000Z"
}
```

---

#### GET `/api/reports/user-performance`
Get sales performance metrics per user/staff (Admin only).

**Query Parameters:**
- `limit`: Optional maximum users to return (default 50, max 100)

**Response (200):**
```json
{
  "data": [
    {
      "userId": "cuid",
      "userName": "string",
      "saleCount": 45,
      "totalRevenue": 2250.00,
      "averageSaleValue": 50.00,
      "gamesSold": 90
    }
  ],
  "generatedAt": "2026-06-14T20:49:16.000Z"
}
```

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
- `Customer name is required` - Validation failed (400)
- `Customer not found` - Resource not found (404)
- `Not authenticated` - Missing/invalid JWT (401)
- `Forbidden` - User lacks required role (403)
- `Email already in use` - Conflict error (409)

---

## 4. Authentication & Authorization

All endpoints except `/api/auth/register`, `/api/auth/login`, and public registration require JWT token.

**Permissions by Role:**
- `USER`: Can view/create sales, view inventory
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

Reset with: `npx prisma db seed`