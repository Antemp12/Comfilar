# Comfilar - Platform Configuration Guide

## 📋 Project Overview

**Comfilar** is a web platform for managing and visualizing construction materials. It provides:
- **E-commerce Catalog**: Browse and filter materials by category
- **Quote Request System**: Create and manage quote requests instead of direct purchases
- **Order Management**: Track orders from processing to delivery
- **Meeting Scheduling**: Book consultations with specialists
- **Admin Dashboard**: Manage materials, stock, users, and orders

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React.js with Next.js 15
- **Backend**: Node.js (Next.js API Routes)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth

### Database Schema

#### Core Tables

**Materials** (`materials`)
- `id`: Text (Primary Key)
- `name`: String (required)
- `description`: Text
- `price`: Decimal (10,2)
- `stock`: Integer
- `categoryId`: Foreign Key → `categories`
- `image`: Text
- `specifications`: JSON (technical specs)
- `createdAt`, `updatedAt`: Timestamps

**Categories** (`categories`)
- `id`: Text (Primary Key)
- `name`: String (unique, required)
- `description`: Text
- `createdAt`, `updatedAt`: Timestamps

**Quote Requests** (`quote_requests`)
- `id`: Text (Primary Key)
- `userId`: Foreign Key → `user` (required)
- `status`: Enum (pending, analyzing, approved, rejected, converted)
- `createdAt`, `updatedAt`: Timestamps

**Quote Items** (`quote_items`)
- `id`: Text (Primary Key)
- `quoteId`: Foreign Key → `quote_requests` (required)
- `materialId`: Foreign Key → `materials` (required)
- `quantity`: Integer
- `unitPrice`: Decimal (10,2)
- `createdAt`: Timestamp

**Orders** (`orders`)
- `id`: Text (Primary Key)
- `quoteId`: Foreign Key → `quote_requests` (unique)
- `userId`: Foreign Key → `user`
- `status`: Enum (processing, preparation, sent, delivered)
- `totalAmount`: Decimal (12,2)
- `transportCost`: Decimal (10,2)
- `estimatedDeliveryDate`: Timestamp
- `confirmedAt`: Timestamp
- `createdAt`, `updatedAt`: Timestamps

**Meetings** (`meetings`)
- `id`: Text (Primary Key)
- `userId`: Foreign Key → `user` (client)
- `employeeId`: Foreign Key → `user` (specialist, optional)
- `scheduledAt`: Timestamp
- `title`: String
- `description`: Text
- `notes`: Text
- `createdAt`, `updatedAt`: Timestamps

## 🔧 Environment Setup

### Required Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_SERVER_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Comfilar"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/comfilar"

# Authentication
AUTH_SECRET="your-secret-key-here"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."

# Uploads
UPLOADTHING_TOKEN="..."
UPLOADTHING_SECRET_KEY="..."

# Comfilar Specific
NEXT_PUBLIC_TRANSPORT_COST_BASE="25"        # Base transport cost in EUR
NEXT_PUBLIC_DELIVERY_DAYS="3"               # Estimated delivery time
NEXT_PUBLIC_SUPPORT_EMAIL="suporte@comfilar.pt"
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── materials/         # Material CRUD endpoints
│   │   ├── quotes/            # Quote request endpoints
│   │   ├── meetings/          # Meeting scheduling endpoints
│   │   └── orders/            # Order management endpoints
│   ├── admin/                 # Admin dashboard pages
│   ├── dashboard/             # Client dashboard pages
│   └── products/              # Product catalog pages
├── db/
│   └── schema/
│       ├── materials/         # Material and category tables
│       ├── comfilar/          # Quote, order, meeting tables
│       └── users/             # User authentication tables
├── lib/
│   ├── queries/
│   │   └── comfilar.ts       # Database query functions
│   └── comfilar-utils.ts     # Business logic utilities
└── config/
    └── comfilar.ts           # Application configuration
```

## 🔌 API Endpoints

### Materials
- `GET /api/materials` - List all materials (with filters)
- `POST /api/materials` - Create new material (admin/employee)
- `GET /api/materials/[id]` - Get material details
- `PUT /api/materials/[id]` - Update material (admin/employee)
- `DELETE /api/materials/[id]` - Delete material (admin)

### Quote Requests
- `POST /api/quotes` - Create quote request
- `GET /api/quotes` - List quotes (filters by userId, status)
- `GET /api/quotes/[id]` - Get quote details
- `PATCH /api/quotes/[id]` - Update quote status (employee/admin)
- `POST /api/quotes/[id]` - Convert approved quote to order

### Orders
- `GET /api/orders` - List orders (filters by userId)
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status (employee/admin)

### Meetings
- `POST /api/meetings` - Schedule meeting
- `GET /api/meetings` - List meetings (filters by userId, employeeId)
- `GET /api/meetings/[id]` - Get meeting details
- `PATCH /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Cancel meeting

## 💼 Business Rules

1. **Quote Requirements**
   - Only approved quotes can be converted to orders
   - Materials must have stock > 0 to be added to quote
   - Quote items auto-capture unit price at quote creation

2. **Order Calculations**
   - Transport cost = Base cost + (Order total × 2%)
   - Total = Subtotal + Transport cost
   - Estimated delivery date = Current date + 3 days

3. **User Permissions**
   - **Client**: Browse catalog, create quotes, schedule meetings, view own orders
   - **Employee**: Manage materials, approve quotes, update order status, recommend materials
   - **Admin**: All permissions + user management + system configuration

4. **Stock Management**
   - Cannot add items with 0 stock to quotes
   - Stock updates require employee/admin authorization
   - Materials are restricted from deletion if in active quotes/orders

## 🚀 Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Database
```bash
# Push schema to database
bun db:push

# Open Drizzle Studio to manage data
bun db:studio
```

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Run Development Server
```bash
bun dev
```

Visit `http://localhost:3000`

## 📊 Key Features Implementation

### Quote Calculation
```typescript
import { calculateQuoteWithTransport } from "@/lib/comfilar-utils";

const result = calculateQuoteWithTransport(quoteItems, baseCost);
// Returns: { subtotal, transport, total }
```

### Date Management
```typescript
import { getEstimatedDeliveryDate } from "@/lib/comfilar-utils";

const { date, days } = getEstimatedDeliveryDate(3);
// Returns delivery date 3 days from now
```

### Quote Validation
```typescript
import { validateQuoteItems } from "@/lib/comfilar-utils";

const { isValid, errors } = validateQuoteItems(items);
```

## 🔐 Authentication & Authorization

The platform uses Better Auth with role-based access control:
- Roles stored in user metadata
- Check role before allowing operations
- API routes validate permissions

## 📝 Next Steps

1. **Create component library**
   - Product catalog views
   - Quote builder
   - Order tracker
   - Admin panels

2. **Implement notifications**
   - Quote status updates
   - Order shipment tracking
   - Meeting reminders

3. **Add payment integration**
   - Stripe/Polar integration for quote confirmation
   - Invoice generation

4. **Setup email service**
   - Quote confirmations
   - Order updates
   - Meeting reminders

## 📞 Support

For configuration issues or questions:
- Email: `suporte@comfilar.pt`
- Check documentation: `/docs`

---

**Version**: 1.0.0  
**Last Updated**: December 2025
