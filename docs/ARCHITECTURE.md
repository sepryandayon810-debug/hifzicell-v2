# 🏛️ WebPOS Firebase Architecture

## Overview

WebPOS Firebase menggunakan **Modular Service-Based Architecture** dengan Firebase sebagai backend dan React sebagai frontend.

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│  (React Components, Pages, UI Elements)               │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────┴─────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                     │
│  (Services, Validation, Business Rules)             │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────┴─────────────────────────────────────┐
│              DATA ACCESS LAYER                       │
│  (Firebase Firestore, Auth, Storage)                │
└────────────────────────────────────────────────────────┘
```

---

## 🧩 Module Structure

### 1. **Authentication Module**
```
├── AuthContext.jsx       # Global auth state
├── authService.js        # Firebase auth operations
├── useAuth.js           # Custom hook
└── LoginForm.jsx        # Login UI component
```

**Responsibilities:**
- User login/logout
- Session management
- Token handling
- Role assignment

### 2. **Kasir (Transaction) Module**
```
├── transactionService.js  # Business logic
├── transactionSchema.js   # Data validation
├── TransactionForm.jsx   # UI component
└── PaymentMethod.jsx    # Payment selection
```

**Responsibilities:**
- Create transactions
- Calculate totals
- Update stock
- Record in Firestore

### 3. **Produk (Product) Module**
```
├── productService.js      # Business logic
├── productSchema.js      # Data validation
├── ProductList.jsx       # List view
└── ProductForm.jsx       # Create/Edit
```

**Responsibilities:**
- Manage products
- Stock tracking
- Price management
- Category handling

### 4. **Kas (Cash) Module**
```
├── cashService.js        # Business logic
├── cashSchema.js         # Data validation
└── CashManagement.jsx   # UI component
```

**Responsibilities:**
- Cash in/out tracking
- Balance calculation
- Daily reconciliation

### 5. **Hutang (Debt) Module**
```
├── debtService.js        # Business logic
├── debtSchema.js         # Data validation
├── DebtList.jsx          # List view
└── PaymentTracker.jsx   # Payment tracking
```

**Responsibilities:**
- Track customer debt
- Payment recording
- Debt status management

### 6. **Laporan (Report) Module**
```
├── reportService.js      # Business logic
├── reportGenerator.js    # Report generation
├── DailyReport.jsx       # Daily report
└── ReportExport.jsx      # Export functionality
```

**Responsibilities:**
- Generate reports
- Calculate analytics
- Export data

### 7. **Dashboard Module**
```
├── OwnerDashboard.jsx     # Owner specific
├── AdminDashboard.jsx     # Admin specific
├── DeveloperDashboard.jsx # Developer specific
└── KasirDashboard.jsx     # Kasir specific
```

**Responsibilities:**
- Display role-specific data
- Show analytics
- Real-time updates

---

## 🔄 Data Flow

### Transaction Flow
```
User Input
    ↓
Validate (transactionSchema)
    ↓
Process (transactionService)
    ├─ Update stock (productService)
    ├─ Update cash (cashService)
    ├─ Save to Firestore
    └─ Generate report (reportService)
    ↓
UI Update (React State)
```

### Authentication Flow
```
User Click Login
    ↓
Submit Credentials
    ↓
Firebase Auth Validate
    ↓
Get User Role & Permissions
    ↓
Store in AuthContext
    ↓
Set User Session
    ↓
Redirect to Dashboard
```

---

## 📊 Firebase Firestore Structure

### Collections

#### `products`
```javascript
{
  id: 'prod_001',
  name: 'Aqua 600ml',
  category: 'Minuman',
  price: 5000,
  stock: 100,
  sku: 'AQA-600',
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### `transactions`
```javascript
{
  id: 'trans_001',
  date: Timestamp,
  cashier_id: 'user_123',
  items: [
    {
      product_id: 'prod_001',
      name: 'Aqua 600ml',
      qty: 2,
      price: 5000,
      subtotal: 10000
    }
  ],
  total: 10000,
  payment_method: 'cash' | 'transfer' | 'credit',
  status: 'completed' | 'pending' | 'cancelled',
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### `cash`
```javascript
{
  id: 'cash_001',
  type: 'masuk' | 'keluar',
  amount: 10000,
  reference_type: 'transaction' | 'expense' | 'manual',
  reference_id: 'trans_001',
  description: 'Penjualan Aqua',
  created_at: Timestamp,
  created_by: 'user_123'
}
```

#### `debts`
```javascript
{
  id: 'debt_001',
  customer_id: 'cust_001',
  customer_name: 'Toko A',
  amount: 50000,
  transaction_id: 'trans_001',
  status: 'unpaid' | 'paid' | 'partial',
  due_date: Timestamp,
  paid_amount: 0,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### `customers`
```javascript
{
  id: 'cust_001',
  name: 'Toko A',
  phone: '08123456789',
  address: 'Jl. Merdeka No. 1',
  email: 'toko@email.com',
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### `users`
```javascript
{
  id: 'user_001',
  email: 'kasir@hifzicell.com',
  name: 'Kasir 1',
  role: 'KASIR' | 'ADMIN' | 'DEVELOPER' | 'OWNER',
  status: 'active' | 'inactive',
  created_at: Timestamp,
  updated_at: Timestamp
}
```

---

## 🔒 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'OWNER';
    }
    
    // Products - Read all, write admin+
    match /products/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['OWNER', 'ADMIN'];
    }
    
    // Transactions - Kasir can create own
    match /transactions/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                      request.auth.token.role in ['OWNER', 'ADMIN', 'KASIR'];
    }
  }
}
```

---

## 🔄 State Management

### Using React Context + Hooks
```
AuthContext (User, Role, Permissions)
    ├── useAuth() → Authentication state
    └── usePermission() → Permission checking

Local Component State (useState)
    ├── Form data
    └── UI state

Custom Hooks
    ├── useFirestore() → Firestore operations
    ├── useTransaction() → Transaction logic
    └── useForm() → Form handling
```

---

## 🚀 Deployment Architecture

```
┌─────────────┐
│   GitHub    │  (Source Code Repository)
└──────┬──────┘
       │
┌──────▼──────────┐
│  Vercel/Netlify │  (Build & Deploy)
└──────┬──────────┘
       │
┌──────▼────────────────┐
│   CDN                 │  (Static Files)
└──────┬────────────────┘
       │
┌──────▼────────────┐
│   React App       │  (Frontend)
└─────────┬─────────┘
          │
┌─────────▼──────────┐
│   Firebase         │
├───────────────────┤
│ ✅ Authentication  │
│ ✅ Firestore DB    │
│ ✅ Cloud Storage   │
│ ✅ Cloud Functions │
└───────────────────┘
```

---

## 📝 Best Practices

### ✅ DO
- ✅ All data changes through service layer
- ✅ Use validation schemas
- ✅ Check permissions before UI
- ✅ Use custom hooks for reusability
- ✅ Keep components focused
- ✅ Use TypeScript for type safety
- ✅ Implement error boundaries
- ✅ Cache data appropriately

### ❌ DON'T
- ❌ Access Firebase directly from components
- ❌ Store sensitive data in localStorage
- ❌ Mix business logic with UI
- ❌ Skip permission validation
- ❌ Create deeply nested components
- ❌ Forget error handling
- ❌ Use inline styles (use Tailwind)
- ❌ Ignore performance optimization

---

## 🔄 Development Workflow

```
1. Feature Request
   ↓
2. Create branch (feature/module-name)
   ↓
3. Implement service layer
   ↓
4. Add validation schema
   ↓
5. Create React components
   ↓
6. Test all flows
   ↓
7. Create PR for review
   ↓
8. Merge to main
   ↓
9. Deploy to production
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

