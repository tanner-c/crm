# Simple CRM Backend Specification

## Overview

This document describes all backend routes, data models, and API behaviors for the Simple CRM project.  

All routes are prefixed with `/api/`.

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

  accounts  Account[]
  contacts  Contact[]
  deals     Deal[]
  activities Activity[]
}

enum Role {
  USER
  MANAGER
  ADMIN
}
````

---

### 1.2 Contact

```prisma
model Contact {
  id         String   @id @default(cuid())
  firstName  String
  lastName   String
  email      String?
  phone      String?
  title      String?
  accountId  String?
  ownerId    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  account Account? @relation(fields: [accountId], references: [id])
  owner   User?    @relation(fields: [ownerId], references: [id])
  activities Activity[]
}
```

---

### 1.3 Deal

```prisma
model Deal {
  id         String   @id @default(cuid())
  name       String
  amount     Float
  stage      String
  closeDate  DateTime?
  accountId  String?
  ownerId    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  account Account? @relation(fields: [accountId], references: [id])
  owner   User?    @relation(fields: [ownerId], references: [id])
  activities Activity[]
}
```

---

### 1.4 Activity

```prisma
model Activity {
  id         String   @id @default(cuid())
  type       ActivityType
  subject    String
  body       String?
  dueAt      DateTime?
  completed  Boolean   @default(false)
  ownerId    String?
  dealId     String?
  contactId  String?
  accountId  String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  owner   User?    @relation(fields: [ownerId], references: [id])
  deal    Deal?    @relation(fields: [dealId], references: [id])
  contact Contact? @relation(fields: [contactId], references: [id])
  account Account? @relation(fields: [accountId], references: [id])
}

enum ActivityType {
  NOTE
  TASK
  CALL
  MEETING
}
```

---


### 1.5 Account

```prisma
model Account {
  id         String     @id @default(cuid())
  name       String
  website    String?
  industry   String?
  ownerId    String?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  deals      Deal[]
  activities Activity[]
  contacts   Contact[]
}
```

---

## 2. API Endpoints

All routes return JSON and use RESTful patterns.
Use `async/await` with Express and Prisma for each controller.

---

### 2.1 Auth

| Method | Endpoint         | Description                        | Body                        | Response                      |
| :----- | :--------------- | :--------------------------------- | :-------------------------- | :---------------------------- |
| `POST` | `/auth/register` | Create new user                    | `{ name, email, password }` | `201` with user (no password) |
| `POST` | `/auth/login`    | Authenticate user, issue JWT       | `{ email, password }`       | `{ token, user }`             |
| `GET`  | `/auth/me`       | Return current user (JWT required) | —                           | `{ user }`                    |

---

### 2.2 Users

| Method   | Endpoint     | Description                 |
| :------- | :----------- | :-------------------------- |
| `GET`    | `/users`     | List all users (admin only) |
| `GET`    | `/users/:id` | Get one user                |
| `PATCH`  | `/users/:id` | Update name/role (admin)    |
| `DELETE` | `/users/:id` | Remove user (admin)         |

---

### 2.3 Accounts

| Method   | Endpoint        | Description                                    |
| :------- | :-------------- | :--------------------------------------------- |
| `GET`    | `/api/accounts` | Get all accounts                               |
| `POST`   | `/api/accounts` | Create new account                             |  
| `GET`    | `/api/accounts/user/:userId` | Get accounts belonging to a specific user |
| `GET`    | `/accounts/:id` | Get single account with related contacts/deals |
| `PATCH`  | `/accounts/:id` | Update account info                            |
| `DELETE` | `/accounts/:id` | Delete account                                 |

---

### 2.4 Contacts

| Method   | Endpoint        | Description                             | Body Example                                              |
| :------- | :-------------- | :-------------------------------------- | :-------------------------------------------------------- |
| `GET`    | `/contacts`     | List all contacts                       | —                                                         |
| `POST`   | `/contacts`     | Create new contact                      | `{ firstName, lastName, email, phone, title, accountId }` |
| `GET`    | `/contacts/:id` | Get one contact with related activities | —                                                         |
| `PATCH`  | `/contacts/:id` | Update contact fields                   | `{ phone, title }`                                        |
| `DELETE` | `/contacts/:id` | Delete contact                          | —                                                         |

---

### 2.5 Deals

| Method   | Endpoint     | Description                                              | Body Example                         |
| :------- | :----------- | :------------------------------------------------------- | :----------------------------------- |
| `GET`    | `/deals`     | List all deals (optionally filter by stage or accountId) | —                                    |
| `POST`   | `/deals`     | Create a deal                                            | `{ name, amount, stage, accountId }` |
| `GET`    | `/deals/:id` | Get deal details + activities                            | —                                    |
| `PATCH`  | `/deals/:id` | Update deal fields                                       | `{ stage, amount }`                  |
| `DELETE` | `/deals/:id` | Delete deal                                              | —                                    |

---

### 2.6 Activities

| Method   | Endpoint          | Description                                      | Body Example                                                   |
| :------- | :---------------- | :----------------------------------------------- | :------------------------------------------------------------- |
| `GET`    | `/activities`     | List all activities (filter by dealId/contactId) | —                                                              |
| `POST`   | `/activities`     | Create activity                                  | `{ type, subject, body, dueAt, accountId, contactId, dealId }` |
| `PATCH`  | `/activities/:id` | Update or mark complete                          | `{ completed: true }`                                          |
| `DELETE` | `/activities/:id` | Delete                                           | —                                                              |