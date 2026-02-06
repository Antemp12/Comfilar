# Comfilar Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Public Site │  │   Dash      │  │   Admin Panel            │ │
│  │ • Catalog   │  │ • Quotes    │  │ • Material CRUD          │ │
│  │ • Products  │  │ • Orders    │  │ • Quote Approval        │ │
│  │ • Auth      │  │ • Meetings  │  │ • User Management       │ │
│  │ • Info      │  │ • Profile   │  │ • Analytics             │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/JSON
┌────────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS API LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│                     /api Routes                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ /materials   │  │ /quotes      │  │ /meetings            │   │
│  │ [GET/POST]   │  │ [GET/POST]   │  │ [GET/POST]           │   │
│  │ /{id}        │  │ /{id}        │  │ /{id}                │   │
│  │ [PUT/DELETE] │  │ [PATCH/POST] │  │ [PATCH/DELETE]       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────┬──────────────────────────────────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│  • Quote Calculations                                            │
│  • Stock Management                                             │
│  • Order Processing                                             │
│  • Validation & Rules                                           │
│  • Permission Checking                                          │
│  • Date/Time Handling                                           │
└──────────────┬──────────────────────────────────────────────────┘
               │ SQL (Drizzle ORM)
┌──────────────▼──────────────────────────────────────────────────┐
│              DATABASE LAYER (PostgreSQL)                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐   │
│  │ Materials  │ │ Categories │ │ Quote Requests & Items    │   │
│  │ • id       │ │ • id       │ │ • QuoteRequests           │   │
│  │ • name     │ │ • name     │ │ • QuoteItems             │   │
│  │ • price    │ │ • desc     │ │                            │   │
│  │ • stock    │ │            │ │ Orders                    │   │
│  │ • specs    │ │            │ │ • id, status, total       │   │
│  │ • image    │ │            │ │                            │   │
│  └────────────┘ └────────────┘ │ Meetings                  │   │
│                                  │ • id, user, date         │   │
│  Users (from Better Auth)        │ • title, notes           │   │
│  • id, email, name               └────────────────────────────┘   │
│  • role (client/emp/admin)                                       │
│  • timestamps                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationship Diagram

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ role        │
│ createdAt   │
└──────┬──────┘
       │
       ├──1:N─────────────┐
       │                  │
       │          ┌─────────────────┐
       │          │ QUOTE_REQUESTS  │
       │          ├─────────────────┤
       │          │ id (PK)         │
       │          │ userId (FK)─────┘
       │          │ status          │
       │          │ createdAt       │
       │          └────┬────────────┘
       │               │
       │               ├─1:N─┐
       │               │     │
       │        ┌──────▼──────────────┐
       │        │ QUOTE_ITEMS         │
       │        ├─────────────────────┤
       │        │ id (PK)             │
       │        │ quoteId (FK)────┐   │
       │        │ materialId (FK)─┼─┐ │
       │        │ quantity        │ │ │
       │        │ unitPrice       │ │ │
       │        └────────────────────┘ │
       │                              │
       │               ┌──────────────┘
       │               │
       │        ┌──────▼──────────┐
       │        │  MATERIALS      │
       │        ├─────────────────┤
       │        │ id (PK)         │
       │        │ name            │
       │        │ description     │
       │        │ price           │
       │        │ stock           │
       │        │ categoryId (FK) │
       │        │ image           │
       │        │ specifications  │
       │        └────┬────────────┘
       │             │
       │      ┌──────▼────────────┐
       │      │   CATEGORIES      │
       │      ├───────────────────┤
       │      │ id (PK)           │
       │      │ name              │
       │      │ description       │
       │      └───────────────────┘
       │
       ├──1:N─────────────┐
       │                  │
       │          ┌────────────────┐
       │          │ ORDERS         │
       │          ├────────────────┤
       │          │ id (PK)        │
       │          │ quoteId (FK)   │
       │          │ userId (FK)────┘
       │          │ status         │
       │          │ totalAmount    │
       │          │ transportCost  │
       │          │ estDelivery    │
       │          │ confirmedAt    │
       │          └────────────────┘
       │
       └──1:N─────────────┐
                          │
                 ┌────────▼──────────┐
                 │ MEETINGS          │
                 ├───────────────────┤
                 │ id (PK)           │
                 │ userId (FK)───┐   │
                 │ employeeId ───┼─┐ │
                 │ scheduledAt    │ │ │
                 │ title          │ │ │
                 │ description    │ │ │
                 │ notes          │ │ │
                 └─────────────────┘ │
                                     └─> References USERS table
```

---

## API Request/Response Flow

```
CLIENT REQUEST
    │
    ▼
┌───────────────────────────────────┐
│  API Route Handler                │
│  /api/[resource]/[id]/route.ts    │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  Request Validation               │
│  • Check parameters               │
│  • Verify body content            │
│  • Validate data types            │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  Business Logic                   │
│  • Stock verification             │
│  • Price calculations             │
│  • Status validation              │
│  • Permission checks              │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  Database Query (Drizzle ORM)     │
│  • Prepared statements            │
│  • Transaction handling           │
│  • Error handling                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  PostgreSQL                       │
│  • Execute query                  │
│  • Apply constraints              │
│  • Return results                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  Response Processing              │
│  • Format data                    │
│  • Include relations              │
│  • Error handling                 │
└───────────┬───────────────────────┘
            │
            ▼
SERVER RESPONSE (JSON)
```

---

## User Journey Workflows

### Quote Request Workflow
```
┌─────────────────────────────────────────────────────┐
│  CLIENT WORKFLOW: CREATE QUOTE REQUEST              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Browse Catalog                                 │
│     ├─ GET /api/materials                          │
│     └─ Filter by category/search                   │
│                                                     │
│  2. View Product Details                           │
│     ├─ GET /api/materials/[id]                     │
│     └─ Display specs, price, stock                 │
│                                                     │
│  3. Add to Quote                                   │
│     ├─ Add item to client-side cart                │
│     └─ Show running total                          │
│                                                     │
│  4. Submit Quote Request                           │
│     ├─ POST /api/quotes                            │
│     │  {userId, items[{materialId, quantity}]}     │
│     └─ Status: "pending"                           │
│                                                     │
│  5. View Quote in Dashboard                        │
│     ├─ GET /api/quotes?userId=[id]                │
│     └─ Display with status, dates, total           │
│                                                     │
│  6. Receive Approval                               │
│     ├─ Employee: PATCH /api/quotes/[id]            │
│     │  {status: "approved"}                        │
│     └─ Client sees "approved" status               │
│                                                     │
│  7. Convert to Order                               │
│     ├─ POST /api/quotes/[id]                       │
│     │  (convert approved quote)                    │
│     └─ Creates order with calculations             │
│                                                     │
│  8. Track Order                                    │
│     ├─ GET /api/orders?userId=[id]                │
│     └─ See status, delivery date, costs            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Admin Management Workflow
```
┌─────────────────────────────────────────────────────┐
│  ADMIN WORKFLOW: MATERIAL MANAGEMENT                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. List All Materials                             │
│     └─ GET /api/materials                          │
│                                                     │
│  2. Create New Material                            │
│     └─ POST /api/materials                         │
│        {name, price, stock, categoryId, ...}       │
│                                                     │
│  3. Edit Material                                  │
│     ├─ GET /api/materials/[id]                     │
│     └─ PUT /api/materials/[id]                     │
│        {updated fields}                            │
│                                                     │
│  4. Update Stock                                   │
│     └─ PUT /api/materials/[id]                     │
│        {stock: newValue}                           │
│                                                     │
│  5. Delete Material                                │
│     └─ DELETE /api/materials/[id]                  │
│                                                     │
│  6. Review Quote Requests                          │
│     ├─ GET /api/quotes                             │
│     └─ Filter by status: "pending"                 │
│                                                     │
│  7. Approve/Reject Quote                           │
│     └─ PATCH /api/quotes/[id]                      │
│        {status: "approved" | "rejected"}           │
│                                                     │
│  8. Manage Orders                                  │
│     ├─ GET /api/orders                             │
│     └─ PATCH /api/orders/[id]                      │
│        {status: "processing|preparation|sent|..."}│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Quote Request Submission

```
STEP 1: User adds items to quote (client-side)
  Items: [
    { materialId: "mat-123", quantity: 5 },
    { materialId: "mat-456", quantity: 3 }
  ]

STEP 2: User clicks "Submit Quote"
  POST /api/quotes
  Body: {
    userId: "user-abc",
    items: [...]
  }

STEP 3: Server validates
  ✓ User exists
  ✓ All materials exist
  ✓ Stock available for each item
  ✓ Quantities are positive

STEP 4: Server creates quote
  INSERT INTO quote_requests
  VALUES (id, userId, 'pending', now())
  
  FOR EACH item:
    INSERT INTO quote_items
    VALUES (id, quoteId, materialId, quantity, unitPrice)

STEP 5: Calculate totals
  subtotal = 5 × 100 + 3 × 50 = 650
  transport = 25 + (650 × 0.02) = 38.00
  total = 650 + 38 = 688.00

STEP 6: Return response
  {
    id: "quote-xyz",
    userId: "user-abc",
    status: "pending",
    items: [
      { materialId, quantity, unitPrice },
      ...
    ],
    subtotal: 650.00,
    transport: 38.00,
    total: 688.00,
    createdAt: "2025-12-26T10:00:00Z"
  }

STEP 7: Client displays quote
  Shows items, costs, total
  Button to "Send for Approval"

STEP 8: Employee approves
  PATCH /api/quotes/quote-xyz
  Body: { status: "approved" }
  
STEP 9: Client converts to order
  POST /api/quotes/quote-xyz
  Creates order with delivery estimate
  
STEP 10: Order tracking
  GET /api/orders?userId=user-abc
  Shows order status and tracking info
```

---

## Technology Stack Visualization

```
┌──────────────────────────────────┐
│      PRESENTATION LAYER          │
│  • React.js                      │
│  • Next.js (App Router)          │
│  • TailwindCSS / Shadcn          │
│  • Framer Motion (animations)    │
└────────────┬─────────────────────┘
             │ TypeScript + API calls
┌────────────▼─────────────────────┐
│     APPLICATION LAYER            │
│  • Next.js API Routes            │
│  • Business Logic Functions      │
│  • Validation & Calculations     │
│  • Role-based Access Control     │
└────────────┬─────────────────────┘
             │ SQL (Drizzle ORM)
┌────────────▼─────────────────────┐
│      DATA LAYER                  │
│  • Drizzle ORM                   │
│  • PostgreSQL                    │
│  • CUID for IDs                  │
│  • Relationships & Constraints   │
└──────────────────────────────────┘
```

---

## Performance Considerations

```
Optimization Strategy:
  
  ┌─ Database Level
  │  ├─ Indexes on foreign keys
  │  ├─ Indexes on status fields
  │  ├─ Query optimization
  │  └─ Connection pooling
  │
  ├─ Application Level
  │  ├─ Input validation
  │  ├─ Business logic optimization
  │  ├─ Error handling
  │  └─ Logging
  │
  ├─ API Level
  │  ├─ Pagination
  │  ├─ Filtering
  │  ├─ Caching headers
  │  └─ Compression
  │
  └─ Frontend Level
     ├─ Code splitting
     ├─ Image optimization
     ├─ Lazy loading
     └─ State management
```

---

## Deployment Architecture

```
Development (Local)
  └─ localhost:3000
       ├─ Frontend
       ├─ API Routes
       └─ PostgreSQL (local)

Staging/Production
  ┌─ CDN (Static assets)
  │  
  ├─ Application Server
  │  └─ Next.js on Vercel/Docker
  │     ├─ API Routes
  │     └─ Server-side rendering
  │
  └─ Database
     └─ PostgreSQL (managed service)
```

---

**Last Updated**: December 26, 2025  
**Version**: 1.0.0
