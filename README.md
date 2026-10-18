# ATB ERP — ATB Software Enterprise Resource Planning System

A modern, high-performance, full-featured **Enterprise Resource Planning (ERP)** system built for **ATB Software** using **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Neon Serverless PostgreSQL** with **Drizzle ORM**.

---

## 🏛️ Legal & Entity Notice

- **System Owner / Legal Entity**: **ATB Software**
- **Commercial Identification**: `ATB-REG-2026-99`
- **Official Billing Domain**: `billing@atbsoftware.com`
- **Notice**: This software and its associated database architectures are proprietary to ATB Software. All sample client, partner, vendor, and transactional records provided in default seed sets are purely illustrative and fictional for testing and demonstration purposes.

---

## 🌟 Key Architecture & Capabilities

ATB ERP is architected as a modular enterprise platform designed for scale, high reliability, and speed:

- **Next.js 16 App Router & Turbopack**: Blazing-fast page loads, server components, and responsive client interactions.
- **Neon Serverless PostgreSQL**: Native HTTP driver integration (`@neondatabase/serverless` & `drizzle-orm/neon-http`) with zero connection pool exhaustion and instant scale-to-zero compute.
- **Dual-Mode Data Engine**: Out-of-the-box in-memory enterprise repository with realistic demo data, with instant 1-click schema migration and seeding to live Neon PostgreSQL.
- **Role-Based Workflows**: Pre-configured profiles for CEO/Admin, Chief Financial Officer, Supply Chain Director, Sales Lead, and People Operations.
- **Interactive Financial Visualizations**: Clean, responsive SVG-based charts for revenue, operational expenditures, profit margins, and warehouse inventory distribution.

---

## 🚀 ERP Core Modules

### 1. Executive Dashboard (`/`)
- Real-time financial KPIs (Total Revenue, Net Margin, Active Orders, Low Stock Alerts, Total Headcount, Receivables).
- 6-month Revenue vs. Expense trend interactive chart with hover breakdowns.
- Inventory distribution donut chart by category.
- Recent sales order pipeline and automated low-stock warnings with 1-click reorder shortcuts.
- Real-time system audit logs.

### 2. Sales & Client CRM (`/sales`)
- **Sales Orders**: Lifecycle management (Draft, Confirmed, Processing, Shipped, Delivered) with automatic inventory deduction upon order creation.
- **Customers & CRM**: Customer directory, company entities, credit limit tracking, and outstanding balances.
- **Invoices & Commercial Billing**: Automatic invoice generation with subtotal, tax (10%), and status tracking (Paid, Partial, Unpaid).
- **Printable Commercial Invoice**: Ready-to-print branded invoices with ATB Software letterhead, payment terms, and PDF export formatting.

### 3. Inventory & Warehousing (`/inventory`)
- Product catalog with SKU, categories, cost price, selling price, and profit margins.
- Stock health indicators (`Healthy Stock`, `Low Stock`, `Out of Stock`) based on minimum threshold safety buffers.
- Warehouse bin location tracking (e.g., *Zone A - Rack 04*).
- **Stock Adjustment Modal**: Audit-backed inventory adjustments (+ Stock In / - Stock Out with reasons).

### 4. Purchasing & Procurement (`/purchasing`)
- **Approved Suppliers**: Vendor registry, account contacts, payment terms (Net 30, Net 45), and star ratings.
- **Purchase Orders (PO)**: Creation and tracking.
- **Goods Receipt Automation**: Clicking **"Receive Goods"** automatically updates product stock and logs an expense into the General Ledger.

### 5. Finance & General Ledger (`/finance`)
- Double-entry-style transaction journal (Income, Operational Expenses).
- Category allocations (Product Sales, Cloud Infrastructure, Raw Materials, Payroll, Freight, Consulting).
- Real-time Net Operating Profit and Cash Flow margin calculation.
- **CSV Export**: 1-click download of the complete audited transaction ledger.

### 6. Human Resources & Payroll (`/hr`)
- Staff directory across Engineering, Finance, Operations, Sales, and People Ops.
- Compensation tracker with monthly payroll commitments and annual run-rate calculator.
- **Onboard Employee**: Fast modal to add team members with compensation and department allocations.

### 7. Manufacturing & Operations (`/operations`)
- Kanban-style Work Order pipeline (`Pending` → `In Progress` → `Quality Review` → `Completed`).
- Progress percentage trackers, priority levels (`Low`, `Medium`, `High`, `Urgent`), and lead engineer assignments.

### 8. Settings & Neon DB Studio (`/settings`)
- **Neon PostgreSQL Connection Center**:
  - Live status indicator and ping test (measures database roundtrip latency in ms).
  - Connection validator for custom Neon connection strings.
  - **1-Click Seed Neon Database**: Pushes all 12 Postgres tables (`users`, `customers`, `products`, `sales_orders`, `purchase_orders`, `invoices`, `financial_transactions`, `employees`, `work_orders`, `audit_logs`) and populates them with sample enterprise data.
- **Company Profile**: Legal entity name (**ATB Software**), Registration ID (`ATB-REG-2026-99`), accounting currency (`USD`, `EUR`, `GBP`, `INR`), and fiscal year.
- **RBAC Permissions Matrix**: Visual breakdown of module permissions.
- **System Audit Trail**: Complete activity journal with actor, action, and timestamp.

---

## 🛠️ Quick Start Guide

### 1. Installation

```bash
# Clone the repository
cd atb-erp

# Install dependencies (already installed)
npm install
```

### 2. Configure Neon PostgreSQL (Optional)

The system works **out of the box immediately** even without a database URL configured (using the built-in enterprise store). 

To connect your live Neon database:
1. Create a free account at [neon.tech](https://neon.tech).
2. Create a new PostgreSQL database.
3. Copy your connection string into `.env.local`:

```env
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Commands

- `npm run db:generate` — Generate Drizzle migrations from schema.
- `npm run db:push` — Push schema directly to Neon PostgreSQL.
- `npm run db:studio` — Open Drizzle Studio web GUI.
- `npm run db:seed` — Test database connection and seed Neon with enterprise data.
"# ATB-ERP" 
