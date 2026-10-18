export interface Customer {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  taxNumber: string;
  address: string;
  creditLimit: number;
  outstandingBalance: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  rating: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  warehouseLocation: string;
  barcode: string;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Refunded';
  orderStatus: 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  itemsJson: OrderItem[];
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
  status: 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
  itemsJson: OrderItem[];
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  salesOrderId?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue' | 'Cancelled';
  itemsJson: OrderItem[];
  terms: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  reference: string;
  notes: string;
  performedBy: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: number;
  txNumber: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer';
  category: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: 'Completed' | 'Pending' | 'Reconciled';
  description: string;
  createdAt: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  createdAt: string;
}

export interface WorkOrder {
  id: number;
  orderNumber: string;
  title: string;
  productName: string;
  quantity: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Quality Review' | 'Completed';
  assignedTo: string;
  progress: number;
  startDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------
export const initialCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUST-001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@techcorp.io',
    phone: '+1 (555) 234-8901',
    company: 'TechCorp Solutions LLC',
    taxNumber: 'US-TX-998821',
    address: '450 Innovation Parkway, Suite 800, Austin, TX 78701',
    creditLimit: 50000,
    outstandingBalance: 12450,
    status: 'Active',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 2,
    code: 'CUST-002',
    name: 'Marcus Vance',
    email: 'marcus@nexussystems.com',
    phone: '+1 (555) 789-4321',
    company: 'Nexus Systems International',
    taxNumber: 'US-CA-445512',
    address: '100 Silicon Blvd, Floor 12, San Jose, CA 95113',
    creditLimit: 75000,
    outstandingBalance: 3200,
    status: 'Active',
    createdAt: '2026-01-15T11:30:00Z',
  },
  {
    id: 3,
    code: 'CUST-003',
    name: 'Elena Rostova',
    email: 'elena@quantumdynamics.de',
    phone: '+49 89 2020 4490',
    company: 'Quantum Dynamics GmbH',
    taxNumber: 'DE-812345678',
    address: 'Maximilianstrasse 35, 80539 Munich, Germany',
    creditLimit: 120000,
    outstandingBalance: 0,
    status: 'Active',
    createdAt: '2026-02-01T14:15:00Z',
  },
  {
    id: 4,
    code: 'CUST-004',
    name: 'David Chen',
    email: 'dchen@pacificbio.com',
    phone: '+1 (555) 612-8800',
    company: 'Pacific BioTech Labs',
    taxNumber: 'US-WA-773322',
    address: '2200 Westlake Ave, Seattle, WA 98121',
    creditLimit: 40000,
    outstandingBalance: 8900,
    status: 'Active',
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 5,
    code: 'CUST-005',
    name: 'Aisha Al-Mansoor',
    email: 'aisha@horizonlogistics.ae',
    phone: '+971 4 332 9901',
    company: 'Horizon Logistics FZCO',
    taxNumber: 'AE-99228833',
    address: 'DIFC Gate Precinct 4, Dubai, UAE',
    creditLimit: 90000,
    outstandingBalance: 4120,
    status: 'Active',
    createdAt: '2026-03-01T08:45:00Z',
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 1,
    code: 'SUP-001',
    name: 'Silicon Precision Components',
    contactPerson: 'Kenji Sato',
    email: 'orders@siliconprec.jp',
    phone: '+81 3 5555 0192',
    address: '2-11-1 Shiba-Daimon, Minato-ku, Tokyo 105-0012',
    paymentTerms: 'Net 30',
    rating: 5,
    status: 'Active',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 2,
    code: 'SUP-002',
    name: 'Nordic Industrial Hardware AB',
    contactPerson: 'Freja Lindqvist',
    email: 'b2b@nordichw.se',
    phone: '+46 8 123 4567',
    address: 'Hammarby Fabriksväg 25, 120 33 Stockholm, Sweden',
    paymentTerms: 'Net 45',
    rating: 5,
    status: 'Active',
    createdAt: '2026-01-12T10:15:00Z',
  },
  {
    id: 3,
    code: 'SUP-003',
    name: 'Global Poly & Raw Materials Corp',
    contactPerson: 'Carlos Mendez',
    email: 'sales@globalpoly.mx',
    phone: '+52 55 4160 8820',
    address: 'Av. Insurgentes Sur 1602, Mexico City 03920',
    paymentTerms: 'Net 30',
    rating: 4,
    status: 'Active',
    createdAt: '2026-01-20T13:40:00Z',
  },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    sku: 'ELC-SRV-900',
    name: 'Apex HyperCluster Server Node X9',
    description: 'Enterprise rackmount computing module with dual 64-core accelerators and 512GB ECC DDR5.',
    category: 'Electronics & Hardware',
    unit: 'unit',
    costPrice: 4200.0,
    sellingPrice: 6850.0,
    currentStock: 18,
    minStock: 5,
    maxStock: 50,
    warehouseLocation: 'Zone A - Rack 04',
    barcode: '890123450011',
    status: 'Active',
    createdAt: '2026-01-08T09:00:00Z',
  },
  {
    id: 2,
    sku: 'ELC-SEN-401',
    name: 'Industrial IoT Telemetry Sensor Suite',
    description: 'High-precision vibration, acoustic, and thermal monitoring sensor for manufacturing lines.',
    category: 'Electronics & Hardware',
    unit: 'kit',
    costPrice: 180.0,
    sellingPrice: 395.0,
    currentStock: 6, // Low stock!
    minStock: 15,
    maxStock: 200,
    warehouseLocation: 'Zone B - Bin 12',
    barcode: '890123450028',
    status: 'Low Stock',
    createdAt: '2026-01-08T09:30:00Z',
  },
  {
    id: 3,
    sku: 'RAW-ALU-7075',
    name: 'Aerospace Grade Aluminum Alloy 7075-T6',
    description: 'High-strength structural aluminum extruded billet (100mm x 1000mm).',
    category: 'Raw Materials',
    unit: 'bar',
    costPrice: 85.0,
    sellingPrice: 165.0,
    currentStock: 145,
    minStock: 30,
    maxStock: 500,
    warehouseLocation: 'Zone C - Bay 02',
    barcode: '890123450035',
    status: 'Active',
    createdAt: '2026-01-14T11:00:00Z',
  },
  {
    id: 4,
    sku: 'NET-SW-100G',
    name: '32-Port 100GbE Managed Core Switch',
    description: 'Ultra-low latency data center spine-leaf network switch with redundant hot-swap PSUs.',
    category: 'Networking Solutions',
    unit: 'unit',
    costPrice: 2850.0,
    sellingPrice: 4600.0,
    currentStock: 4, // Low stock!
    minStock: 8,
    maxStock: 40,
    warehouseLocation: 'Zone A - Rack 08',
    barcode: '890123450042',
    status: 'Low Stock',
    createdAt: '2026-01-18T14:20:00Z',
  },
  {
    id: 5,
    sku: 'OPT-FBR-50M',
    name: 'Armored Multi-Mode Fiber Patch Cable (50m)',
    description: 'OM4 duplex LC-LC laser-optimized armored fiber optic cable with dust caps.',
    category: 'Networking Solutions',
    unit: 'spool',
    costPrice: 42.0,
    sellingPrice: 95.0,
    currentStock: 82,
    minStock: 20,
    maxStock: 300,
    warehouseLocation: 'Zone B - Bin 07',
    barcode: '890123450059',
    status: 'Active',
    createdAt: '2026-01-22T16:00:00Z',
  },
  {
    id: 6,
    sku: 'SEC-MOD-PRO',
    name: 'Hardware Cryptographic Security Module (HSM)',
    description: 'FIPS 140-3 Level 4 certified physical root-of-trust hardware security module.',
    category: 'Electronics & Hardware',
    unit: 'unit',
    costPrice: 1950.0,
    sellingPrice: 3400.0,
    currentStock: 12,
    minStock: 5,
    maxStock: 30,
    warehouseLocation: 'Zone A - Safe Vault',
    barcode: '890123450066',
    status: 'Active',
    createdAt: '2026-02-05T10:00:00Z',
  },
];

export const initialSalesOrders: SalesOrder[] = [
  {
    id: 1,
    orderNumber: 'SO-2026-0089',
    customerId: 1,
    customerName: 'TechCorp Solutions LLC',
    orderDate: '2026-03-01T10:00:00Z',
    deliveryDate: '2026-03-08T18:00:00Z',
    subtotal: 31000.0,
    taxAmount: 3100.0,
    discountAmount: 1000.0,
    totalAmount: 33100.0,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    itemsJson: [
      { productId: 1, productName: 'Apex HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 4, unitPrice: 6850.0, total: 27400.0 },
      { productId: 4, productName: '32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 1, unitPrice: 4600.0, total: 4600.0 },
    ],
    notes: 'Priority delivery for primary data center expansion project.',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    orderNumber: 'SO-2026-0090',
    customerId: 2,
    customerName: 'Nexus Systems International',
    orderDate: '2026-03-04T14:30:00Z',
    deliveryDate: '2026-03-12T18:00:00Z',
    subtotal: 13700.0,
    taxAmount: 1370.0,
    discountAmount: 500.0,
    totalAmount: 14570.0,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    itemsJson: [
      { productId: 1, productName: 'Apex HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
    ],
    notes: 'Tracking # FEDEX-981240982',
    createdAt: '2026-03-04T14:30:00Z',
  },
  {
    id: 3,
    orderNumber: 'SO-2026-0091',
    customerId: 3,
    customerName: 'Quantum Dynamics GmbH',
    orderDate: '2026-03-08T09:15:00Z',
    deliveryDate: '2026-03-20T18:00:00Z',
    subtotal: 20600.0,
    taxAmount: 2060.0,
    discountAmount: 0.0,
    totalAmount: 22660.0,
    paymentStatus: 'Partial',
    orderStatus: 'Processing',
    itemsJson: [
      { productId: 6, productName: 'Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 3400.0, total: 17000.0 },
      { productId: 5, productName: 'Armored Multi-Mode Fiber Patch Cable (50m)', sku: 'OPT-FBR-50M', quantity: 38, unitPrice: 95.0, total: 3610.0 },
    ],
    notes: 'European customs pre-clearance documents attached.',
    createdAt: '2026-03-08T09:15:00Z',
  },
  {
    id: 4,
    orderNumber: 'SO-2026-0092',
    customerId: 4,
    customerName: 'Pacific BioTech Labs',
    orderDate: '2026-03-12T16:00:00Z',
    deliveryDate: '2026-03-22T18:00:00Z',
    subtotal: 7900.0,
    taxAmount: 790.0,
    discountAmount: 200.0,
    totalAmount: 8490.0,
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    itemsJson: [
      { productId: 2, productName: 'Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 20, unitPrice: 395.0, total: 7900.0 },
    ],
    notes: 'Awaiting manufacturing confirmation on sensor allocation.',
    createdAt: '2026-03-12T16:00:00Z',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0045',
    salesOrderId: 1,
    customerId: 1,
    customerName: 'TechCorp Solutions LLC',
    customerEmail: 'billing@techcorp.io',
    issueDate: '2026-03-01T11:00:00Z',
    dueDate: '2026-03-31T18:00:00Z',
    subtotal: 31000.0,
    taxRate: 10.0,
    taxAmount: 3100.0,
    totalAmount: 33100.0,
    amountPaid: 33100.0,
    status: 'Paid',
    itemsJson: [
      { productId: 1, productName: 'Apex HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 4, unitPrice: 6850.0, total: 27400.0 },
      { productId: 4, productName: '32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 1, unitPrice: 4600.0, total: 4600.0 },
    ],
    terms: 'Payment received via Wire Transfer ref #WT-882910.',
    createdAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0046',
    salesOrderId: 2,
    customerId: 2,
    customerName: 'Nexus Systems International',
    customerEmail: 'finance@nexussystems.com',
    issueDate: '2026-03-04T15:00:00Z',
    dueDate: '2026-04-03T18:00:00Z',
    subtotal: 13700.0,
    taxRate: 10.0,
    taxAmount: 1370.0,
    totalAmount: 14570.0,
    amountPaid: 14570.0,
    status: 'Paid',
    itemsJson: [
      { productId: 1, productName: 'Apex HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
    ],
    terms: 'Payment settled in full.',
    createdAt: '2026-03-04T15:00:00Z',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-0047',
    salesOrderId: 3,
    customerId: 3,
    customerName: 'Quantum Dynamics GmbH',
    customerEmail: 'accounts@quantumdynamics.de',
    issueDate: '2026-03-08T10:00:00Z',
    dueDate: '2026-04-07T18:00:00Z',
    subtotal: 20600.0,
    taxRate: 10.0,
    taxAmount: 2060.0,
    totalAmount: 22660.0,
    amountPaid: 10000.0,
    status: 'Partial',
    itemsJson: [
      { productId: 6, productName: 'Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 3400.0, total: 17000.0 },
      { productId: 5, productName: 'Armored Multi-Mode Fiber Patch Cable (50m)', sku: 'OPT-FBR-50M', quantity: 38, unitPrice: 95.0, total: 3610.0 },
    ],
    terms: '50% advance received, balance payable upon final port delivery.',
    createdAt: '2026-03-08T10:00:00Z',
  },
  {
    id: 4,
    invoiceNumber: 'INV-2026-0048',
    salesOrderId: 4,
    customerId: 4,
    customerName: 'Pacific BioTech Labs',
    customerEmail: 'ap@pacificbio.com',
    issueDate: '2026-03-12T17:00:00Z',
    dueDate: '2026-03-26T18:00:00Z',
    subtotal: 7900.0,
    taxRate: 10.0,
    taxAmount: 790.0,
    totalAmount: 8490.0,
    amountPaid: 0.0,
    status: 'Unpaid',
    itemsJson: [
      { productId: 2, productName: 'Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 20, unitPrice: 395.0, total: 7900.0 },
    ],
    terms: 'Net 14 payment terms apply.',
    createdAt: '2026-03-12T17:00:00Z',
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2026-0021',
    supplierId: 1,
    supplierName: 'Silicon Precision Components',
    orderDate: '2026-02-25T08:30:00Z',
    expectedDelivery: '2026-03-15T18:00:00Z',
    totalAmount: 18500.0,
    status: 'Received',
    itemsJson: [
      { productId: 2, productName: 'Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 50, unitPrice: 180.0, total: 9000.0 },
      { productId: 6, productName: 'Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 1900.0, total: 9500.0 },
    ],
    notes: 'Batch inspection report signed off by QA team.',
    createdAt: '2026-02-25T08:30:00Z',
  },
  {
    id: 2,
    poNumber: 'PO-2026-0022',
    supplierId: 2,
    supplierName: 'Nordic Industrial Hardware AB',
    orderDate: '2026-03-05T11:00:00Z',
    expectedDelivery: '2026-03-28T18:00:00Z',
    totalAmount: 22800.0,
    status: 'Ordered',
    itemsJson: [
      { productId: 4, productName: '32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 8, unitPrice: 2850.0, total: 22800.0 },
    ],
    notes: 'Air freight express shipment from Gothenburg.',
    createdAt: '2026-03-05T11:00:00Z',
  },
];

export const initialFinancialTransactions: FinancialTransaction[] = [
  {
    id: 1,
    txNumber: 'TX-2026-0101',
    date: '2026-03-01T12:00:00Z',
    type: 'Income',
    category: 'Product Sales',
    amount: 33100.0,
    paymentMethod: 'Wire Transfer',
    reference: 'INV-2026-0045 / TechCorp',
    status: 'Completed',
    description: 'Payment settlement for Server Nodes & Switch infrastructure.',
    createdAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 2,
    txNumber: 'TX-2026-0102',
    date: '2026-03-03T15:30:00Z',
    type: 'Expense',
    category: 'Cloud Infrastructure & Hosting',
    amount: 2840.5,
    paymentMethod: 'Corporate Card',
    reference: 'AWS-INV-772910',
    status: 'Completed',
    description: 'Monthly AWS production cluster and Neon Postgres compute resources.',
    createdAt: '2026-03-03T15:30:00Z',
  },
  {
    id: 3,
    txNumber: 'TX-2026-0103',
    date: '2026-03-05T10:00:00Z',
    type: 'Income',
    category: 'Product Sales',
    amount: 14570.0,
    paymentMethod: 'ACH Direct Deposit',
    reference: 'INV-2026-0046 / Nexus Systems',
    status: 'Completed',
    description: 'Full payment for server order.',
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 4,
    txNumber: 'TX-2026-0104',
    date: '2026-03-07T16:45:00Z',
    type: 'Expense',
    category: 'Procurement & Raw Materials',
    amount: 18500.0,
    paymentMethod: 'Wire Transfer',
    reference: 'PO-2026-0021 / Silicon Prec',
    status: 'Completed',
    description: 'Supplier payment for IoT sensors and HSM security modules.',
    createdAt: '2026-03-07T16:45:00Z',
  },
  {
    id: 5,
    txNumber: 'TX-2026-0105',
    date: '2026-03-10T09:00:00Z',
    type: 'Income',
    category: 'Consulting & Engineering Services',
    amount: 8500.0,
    paymentMethod: 'Wire Transfer',
    reference: 'SRV-ENG-09',
    status: 'Completed',
    description: 'On-site architecture review and deployment service retainer.',
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 6,
    txNumber: 'TX-2026-0106',
    date: '2026-03-12T14:20:00Z',
    type: 'Expense',
    category: 'Logistics & Global Freight',
    amount: 1950.0,
    paymentMethod: 'Bank Transfer',
    reference: 'DHL-EXPRESS-192',
    status: 'Completed',
    description: 'International customs clearing and air cargo handling.',
    createdAt: '2026-03-12T14:20:00Z',
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 1,
    employeeCode: 'EMP-001',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'a.wright@apextowers.com',
    phone: '+1 (555) 111-2233',
    department: 'Executive Leadership',
    position: 'Chief Executive Officer',
    salary: 195000,
    joinDate: '2022-01-15T09:00:00Z',
    status: 'Active',
    createdAt: '2022-01-15T09:00:00Z',
  },
  {
    id: 2,
    employeeCode: 'EMP-002',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 's.martinez@apextowers.com',
    phone: '+1 (555) 222-3344',
    department: 'Finance & Accounts',
    position: 'Chief Financial Officer',
    salary: 165000,
    joinDate: '2022-03-01T09:00:00Z',
    status: 'Active',
    createdAt: '2022-03-01T09:00:00Z',
  },
  {
    id: 3,
    employeeCode: 'EMP-003',
    firstName: 'Rohan',
    lastName: 'Patel',
    email: 'r.patel@apextowers.com',
    phone: '+1 (555) 333-4455',
    department: 'Engineering & Hardware',
    position: 'VP of Hardware Architecture',
    salary: 172000,
    joinDate: '2022-06-15T09:00:00Z',
    status: 'Active',
    createdAt: '2022-06-15T09:00:00Z',
  },
  {
    id: 4,
    employeeCode: 'EMP-004',
    firstName: 'Jessica',
    lastName: 'Taylor',
    email: 'j.taylor@apextowers.com',
    phone: '+1 (555) 444-5566',
    department: 'Operations & Supply Chain',
    position: 'Director of Global Supply Chain',
    salary: 140000,
    joinDate: '2023-01-10T09:00:00Z',
    status: 'Active',
    createdAt: '2023-01-10T09:00:00Z',
  },
  {
    id: 5,
    employeeCode: 'EMP-005',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    email: 'l.oconnor@apextowers.com',
    phone: '+1 (555) 555-6677',
    department: 'Sales & Client Strategy',
    position: 'Senior Enterprise Account Director',
    salary: 135000,
    joinDate: '2023-08-01T09:00:00Z',
    status: 'Active',
    createdAt: '2023-08-01T09:00:00Z',
  },
  {
    id: 6,
    employeeCode: 'EMP-006',
    firstName: 'Maya',
    lastName: 'Lin',
    email: 'm.lin@apextowers.com',
    phone: '+1 (555) 666-7788',
    department: 'Human Resources',
    position: 'People Operations Lead',
    salary: 110000,
    joinDate: '2024-02-15T09:00:00Z',
    status: 'Active',
    createdAt: '2024-02-15T09:00:00Z',
  },
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 1,
    orderNumber: 'WO-2026-0301',
    title: 'Precision Assembly: 10x Server Node X9 Units',
    productName: 'Apex HyperCluster Server Node X9',
    quantity: 10,
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Rohan Patel (Lead Tech)',
    progress: 70,
    startDate: '2026-03-10T08:00:00Z',
    dueDate: '2026-03-24T17:00:00Z',
    notes: 'Thermal paste application and stress testing running in Bay 3.',
    createdAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 2,
    orderNumber: 'WO-2026-0302',
    title: 'Firmware Flash & Quality Calibration for IoT Sensors',
    productName: 'Industrial IoT Telemetry Sensor Suite',
    quantity: 50,
    priority: 'Urgent',
    status: 'Quality Review',
    assignedTo: 'Hardware Test Lab Team',
    progress: 90,
    startDate: '2026-03-12T09:00:00Z',
    dueDate: '2026-03-18T17:00:00Z',
    notes: 'All 50 units pass initial telemetry handshake.',
    createdAt: '2026-03-12T09:00:00Z',
  },
  {
    id: 3,
    orderNumber: 'WO-2026-0303',
    title: 'Custom Laser Etching & Housing Mill for HSM Enclosures',
    productName: 'Hardware Cryptographic Security Module (HSM)',
    quantity: 15,
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'CNC Operations',
    progress: 25,
    startDate: '2026-03-15T08:00:00Z',
    dueDate: '2026-04-02T17:00:00Z',
    notes: 'Awaiting aluminum alloy 7075 billet cutting approval.',
    createdAt: '2026-03-15T08:00:00Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 1,
    actor: 'Alexander Wright (CEO)',
    action: 'Approved Sales Order',
    module: 'Sales & CRM',
    details: 'Approved SO-2026-0089 for TechCorp Solutions ($33,100.00)',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 2,
    actor: 'Sophia Martinez (CFO)',
    action: 'Recorded Payment',
    module: 'Finance & Accounts',
    details: 'Reconciled wire transfer WT-882910 of $33,100.00 against INV-2026-0045',
    createdAt: '2026-03-01T12:05:00Z',
  },
  {
    id: 3,
    actor: 'Jessica Taylor (Supply Chain)',
    action: 'Dispatched Goods',
    module: 'Inventory',
    details: 'Marked 4x ELC-SRV-900 and 1x NET-SW-100G as dispatched via FedEx',
    createdAt: '2026-03-04T15:20:00Z',
  },
  {
    id: 4,
    actor: 'System Automation',
    action: 'Low Stock Alert Triggered',
    module: 'Inventory',
    details: 'Telemetry Sensor Suite (ELC-SEN-401) reached 6 units (below min 15)',
    createdAt: '2026-03-12T16:05:00Z',
  },
];

