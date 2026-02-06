# 🚀 Comfilar Quick Start Guide

## Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database
- Git

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/comfilar"
AUTH_SECRET="generate-a-random-secret-key"
NEXT_PUBLIC_TRANSPORT_COST_BASE="25"
NEXT_PUBLIC_DELIVERY_DAYS="3"
NEXT_PUBLIC_SUPPORT_EMAIL="suporte@comfilar.pt"
```

### 3. Initialize Database
```bash
# Push schema to PostgreSQL
bun db:push

# (Optional) Open Drizzle Studio to manage data
bun db:studio
```

### 4. Seed Sample Data
```bash
# Add categories and sample materials
bun src/db/seed.ts
```

### 5. Start Development Server
```bash
bun dev
```

Visit `http://localhost:3000` 🎉

---

## 📁 Project Structure Quick Reference

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── materials/     # Material CRUD
│   │   ├── quotes/        # Quote request API
│   │   └── meetings/      # Meeting scheduling API
│   ├── dashboard/         # User dashboard pages
│   ├── admin/             # Admin pages
│   └── products/          # Public product pages
│
├── db/                    # Database
│   ├── schema/
│   │   ├── materials/     # Material & category tables
│   │   ├── comfilar/      # Quote, order, meeting tables
│   │   └── users/         # User & auth tables
│   └── seed.ts            # Sample data
│
├── lib/                   # Utilities
│   ├── comfilar-utils.ts # Business logic (calculations, validation)
│   ├── roles-permissions.ts # Role-based access control
│   └── queries/           # Database queries
│
└── config/
    └── comfilar.ts        # Configuration constants
```

---

## 🔌 API Quick Reference

### Create a Quote Request
```typescript
const response = await fetch('/api/quotes', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-id',
    items: [
      {
        materialId: 'material-id',
        quantity: 10
      }
    ]
  })
});
```

### Get User's Quotes
```typescript
const quotes = await fetch('/api/quotes?userId=user-id');
const data = await quotes.json();
```

### Approve a Quote
```typescript
const response = await fetch('/api/quotes/quote-id', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'approved' })
});
```

### Convert Quote to Order
```typescript
const response = await fetch('/api/quotes/quote-id', {
  method: 'POST'
});
```

### Schedule a Meeting
```typescript
const response = await fetch('/api/meetings', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-id',
    employeeId: 'employee-id',
    scheduledAt: new Date('2025-12-31T14:00:00'),
    title: 'Consulta Especializada'
  })
});
```

---

## 💡 Key Features to Build

### For Users (Client Dashboard)
- [ ] Browse product catalog
- [ ] Search and filter materials
- [ ] Add items to quote
- [ ] Submit quote requests
- [ ] View quote history and status
- [ ] Schedule meetings with specialists
- [ ] Track orders in real-time
- [ ] Download invoices

### For Admin (Admin Dashboard)
- [ ] Manage materials (CRUD)
- [ ] Manage categories
- [ ] Review quote requests
- [ ] Approve/reject quotes
- [ ] Manage orders and shipments
- [ ] Manage users (add/remove)
- [ ] View analytics

---

## 🔐 User Roles & Permissions

### Client
- View product catalog
- Create quote requests
- Schedule meetings
- View own quotes and orders

### Employee
- All client permissions +
- Manage materials
- Approve quotes
- Update order status
- Recommend materials
- Access admin panel

### Admin
- All employee permissions +
- Manage users (add/remove/edit)
- System configuration
- View all quotes and orders
- Full admin access

---

## 📊 Calculation Examples

### Quote Total Calculation
```typescript
import { calculateQuoteWithTransport } from '@/lib/comfilar-utils';

// Items in quote with price data
const result = calculateQuoteWithTransport(quoteItems);

// Result:
// {
//   subtotal: 1000.00,
//   transport: 45.00,     // €25 + (€1000 × 2%)
//   total: 1045.00
// }
```

### Estimated Delivery Date
```typescript
import { getEstimatedDeliveryDate } from '@/lib/comfilar-utils';

const { date, days } = getEstimatedDeliveryDate(3);
// Returns: Today + 3 days
```

---

## 🧪 Testing the API

### Using cURL
```bash
# Get all materials
curl http://localhost:3000/api/materials

# Get material by ID
curl http://localhost:3000/api/materials/material-id

# Create quote request
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "items": [{
      "materialId": "material-id",
      "quantity": 5
    }]
  }'
```

### Using REST Client (VS Code Extension)
Create `test.http`:
```
### Get all materials
GET http://localhost:3000/api/materials

### Create quote
POST http://localhost:3000/api/quotes
Content-Type: application/json

{
  "userId": "test-user",
  "items": [
    {
      "materialId": "material-123",
      "quantity": 10
    }
  ]
}
```

---

## 🐛 Common Issues & Solutions

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL is correct
# Format: postgresql://username:password@localhost:5432/dbname
```

### Auth Errors
```bash
# Generate new AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Port Already in Use
```bash
# Use different port
bun dev --port 3001
```

---

## 📚 Next Resources

- **Drizzle Docs**: https://orm.drizzle.team/docs
- **Next.js Guide**: https://nextjs.org/docs/app
- **Better Auth**: https://better-auth.js.org
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 📞 Need Help?

Check these files:
1. `COMFILAR_CONFIG.md` - Full configuration guide
2. `SETUP_COMPLETE.md` - What was set up
3. `src/config/comfilar.ts` - Configuration constants
4. `src/lib/comfilar-utils.ts` - Business logic examples

---

**Happy coding! 🎊**

For detailed information, see `COMFILAR_CONFIG.md`
