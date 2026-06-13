# Software Design Diagrams

This document outlines the software design and architecture for the Game Store Management CRM system.

---

## 1. System Architecture

The CRM application is built on a decoupled client-server architecture:
- **Client (Frontend)**: React Single-Page Application (SPA) built with Vite and TailwindCSS.
- **Server (Backend)**: Node.js Express REST API using TypeScript.
- **Database**: PostgreSQL accessed via Prisma ORM.
- **External Integration**: MobyGames API (used to search cover art, release dates, and platforms for games).

```mermaid
graph TD
    subgraph Client ["Client (Vite + React)"]
        UI["React SPA (Components & Router)"]
        API_Client["API Wrapper (Axios / Fetch)"]
    end

    subgraph Server ["Server (Node.js + Express + TS)"]
        MW["Auth & Role Middlewares"]
        Router["Express Routers (/api/*)"]
        PrismaClient["Prisma Client ORM"]
        MobyService["MobyGames Service"]
    end

    subgraph Database ["Database Layer"]
        PostgreSQL[("PostgreSQL Database")]
    end

    subgraph External ["External Services"]
        MobyGames["MobyGames API"]
    end

    UI -->|"User Interactions"| API_Client
    API_Client -->|"HTTPS REST API / JWT"| MW
    MW -->|"Authenticated Req"| Router
    Router -->|"DB Operations"| PrismaClient
    Router -->|"Search / Info Fetch"| MobyService
    PrismaClient -->|"SQL Queries"| PostgreSQL
    MobyService -->|"External HTTP API Keys"| MobyGames

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style Server fill:#bbf,stroke:#333,stroke-width:2px
    style Database fill:#dfd,stroke:#333,stroke-width:2px
    style External fill:#fdd,stroke:#333,stroke-width:2px
```

## 2. Logical Components

This diagrams show how backend logical components are modularized.

```mermaid
graph LR
    Index["index.ts (Server Entry)"]
    Middlewares["middleware/auth.ts"]
    Routes["routes/*.ts (Express Routes)"]
    MobyService["services/mobygames.ts"]
    PrismaClient["prisma/client.ts"]
    Validation["utils/validation.ts"]

    Index --> Routes
    Index --> Middlewares
    Routes --> Middlewares
    Routes --> PrismaClient
    Routes --> MobyService
    Routes --> Validation
```
