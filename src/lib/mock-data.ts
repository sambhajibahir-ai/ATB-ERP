export interface Company {
  id: number;
  name: string;
  code: string;
  email: string;
  phone?: string;
  taxId?: string;
  gstin?: string;
  address?: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Expired';
  licenseTier: 'Trial' | 'Starter' | 'Growth' | 'Enterprise';
  licenseExpiresAt: string; // ISO date
  maxUsers: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface User {
  id: number;
  companyId: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Finance' | 'Inventory' | 'Sales' | 'HR' | 'Operations';
  department: string;
  avatar?: string;
  status: 'Active' | 'Suspended';
  isCompanyAdmin?: boolean; // Company CEO / primary admin
  isPlatformAdmin?: boolean; // ATB ERP Super Admin
  lastLogin?: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  companyId?: number;
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
  companyId?: number;
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
  companyId?: number;
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

export interface Quotation {
  id: number;
  companyId?: number;
  quotationNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Converted';
  convertedSalesOrderId?: number;
  itemsJson: OrderItem[];
  terms: string;
  notes?: string;
  createdAt: string;
}

export interface SalesOrder {
  id: number;
  companyId?: number;
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
  companyId?: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  itemsJson: OrderItem[];
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  companyId?: number;
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
  companyId?: number;
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
  companyId?: number;
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
  companyId?: number;
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
  companyId?: number;
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
  companyId?: number;
  actor: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}

// -------------------------------------------------------------
// Tenant Companies (Multi-Tenant Organization Directory)
// -------------------------------------------------------------
export const initialCompanies: Company[] = [
  {
    id: 1,
    name: 'ATB Software Solutions Private Limited',
    code: 'ATB-HQ',
    email: 'contact@atbsoftware.com',
    phone: '+91 80 4129 9000',
    taxId: 'CIN: U72200KA2026PTC098765',
    gstin: '29AABCU9603R1Z7',
    address: 'ATB Tech Towers, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
    status: 'Active',
    licenseTier: 'Enterprise',
    licenseExpiresAt: '2027-12-31T23:59:59Z',
    maxUsers: 50,
    approvedBy: 'Platform Founding Authority',
    approvedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Tata Advanced Robotics & Automation Ltd',
    code: 'TATA-ROBOTICS',
    email: 'operations@tatarobotics.com',
    phone: '+91 22 6665 8282',
    taxId: 'CIN: L29100MH2026PLC012345',
    gstin: '27AAACT2727Q1ZW',
    address: 'Bombay House, 24 Homi Mody Street, Fort, Mumbai, Maharashtra 400001',
    status: 'Active',
    licenseTier: 'Growth',
    licenseExpiresAt: '2027-06-30T23:59:59Z',
    maxUsers: 15,
    approvedBy: 'Aarav Mehta (Platform Admin)',
    approvedAt: '2026-02-01T10:00:00Z',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 3,
    name: 'Nexus Quantum Sensor Systems Pvt Ltd',
    code: 'NEXUS-QUANTUM',
    email: 'partners@nexusquantum.in',
    phone: '+91 40 2311 4455',
    taxId: 'CIN: U31900TG2026PTC054321',
    gstin: '36AABCN8899K1Z4',
    address: 'HITEC City, Madhapur, Hyderabad, Telangana 500081',
    status: 'Pending',
    licenseTier: 'Trial',
    licenseExpiresAt: '2026-11-26T23:59:59Z',
    maxUsers: 5,
    createdAt: '2026-10-20T14:30:00Z',
  },
];

// -------------------------------------------------------------
// Seed Data (ATB Software Enterprise - Indian Customers & Partners)
// -------------------------------------------------------------
export const initialCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUST-001',
    name: 'Rajesh Sharma',
    email: 'rajesh.s@sharmainfotech.co.in',
    phone: '+91 98201 44521',
    company: 'Sharma Infotech Solutions Pvt Ltd',
    taxNumber: 'GSTIN-27AABCS1429B1Z8',
    address: 'Plot 42, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
    creditLimit: 50000,
    outstandingBalance: 12450,
    status: 'Active',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 2,
    code: 'CUST-002',
    name: 'Priya Nair',
    email: 'priya.nair@nairlogistics.in',
    phone: '+91 98450 11234',
    company: 'Nair Logistics & Supply Chain Ltd',
    taxNumber: 'GSTIN-29AAACN8821M1ZC',
    address: 'Tower B, Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra 400051',
    creditLimit: 75000,
    outstandingBalance: 3200,
    status: 'Active',
    createdAt: '2026-01-15T11:30:00Z',
  },
  {
    id: 3,
    code: 'CUST-003',
    name: 'Amitav Sengupta',
    email: 'amitav@sengupta-eng.in',
    phone: '+91 97110 33890',
    company: 'Sengupta Precision Engineering Works',
    taxNumber: 'GSTIN-19AABCS7744K1ZF',
    address: 'Sector V, Salt Lake City, Bidhannagar, Kolkata, West Bengal 700091',
    creditLimit: 120000,
    outstandingBalance: 0,
    status: 'Active',
    createdAt: '2026-02-01T14:15:00Z',
  },
  {
    id: 4,
    code: 'CUST-004',
    name: 'Deepika Rao',
    email: 'deepika.rao@raobiotech.co.in',
    phone: '+91 94480 77120',
    company: 'Rao Advanced BioTech Innovations Pvt Ltd',
    taxNumber: 'GSTIN-36AABCR9912H1Z5',
    address: 'Genome Valley, Shameerpet, Hyderabad, Telangana 500078',
    creditLimit: 40000,
    outstandingBalance: 8900,
    status: 'Active',
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 5,
    code: 'CUST-005',
    name: 'Vikramaditya Deshmukh',
    email: 'v.deshmukh@deshmukhindustries.in',
    phone: '+91 98220 55678',
    company: 'Deshmukh Industrial Infrastructure Corp',
    taxNumber: 'GSTIN-27AABCD6633P1ZR',
    address: 'MIDC Industrial Area, Bhosari, Pune, Maharashtra 411026',
    creditLimit: 90000,
    outstandingBalance: 4120,
    status: 'Active',
    createdAt: '2026-03-01T08:45:00Z',
  },
  // Company 2: Tata Advanced Robotics & Automation Ltd
  {
    id: 6,
    companyId: 2,
    code: 'CUST-TATA-001',
    name: 'Defence Research & Development Organisation (DRDO)',
    email: 'procurement@drdo.gov.in',
    phone: '+91 11 2301 2244',
    company: 'DRDO Directorate of Systems',
    taxNumber: 'GSTIN-07AAAGD0101A1Z9',
    address: 'DRDO Bhawan, Rajaji Marg, New Delhi 110011',
    creditLimit: 5000000,
    outstandingBalance: 1200000,
    status: 'Active',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 7,
    companyId: 2,
    code: 'CUST-TATA-002',
    name: 'Bharat Heavy Electricals Limited (BHEL)',
    email: 'automation@bhel.in',
    phone: '+91 755 250 0100',
    company: 'BHEL Heavy Plant Division',
    taxNumber: 'GSTIN-23AAACB2500P1Z6',
    address: 'BHEL Industrial Complex, Piplani, Bhopal, Madhya Pradesh 462022',
    creditLimit: 3000000,
    outstandingBalance: 450000,
    status: 'Active',
    createdAt: '2026-02-15T11:00:00Z',
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 1,
    code: 'SUP-001',
    name: 'Varma Precision Micro-Electronics Pvt Ltd',
    contactPerson: 'Aditya Varma',
    email: 'orders@varmamicro.co.in',
    phone: '+91 80 2839 4410',
    address: 'Peenya Industrial Area 3rd Phase, Bengaluru, Karnataka 560058',
    paymentTerms: 'Net 30',
    rating: 5,
    status: 'Active',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 2,
    code: 'SUP-002',
    name: 'Sundaram Industrial Hardware & Fasteners Ltd',
    contactPerson: 'Kavita Sundaram',
    email: 'b2b@sundaramhardware.in',
    phone: '+91 44 2250 8890',
    address: 'Guindy Industrial Estate, Chennai, Tamil Nadu 600032',
    paymentTerms: 'Net 45',
    rating: 5,
    status: 'Active',
    createdAt: '2026-01-12T10:15:00Z',
  },
  {
    id: 3,
    code: 'SUP-003',
    name: 'Bharat Alloys & Metal Forgings Corp',
    contactPerson: 'Manpreet Singh',
    email: 'sales@bharatalloys.in',
    phone: '+91 161 501 2280',
    address: 'Focal Point Phase V, Ludhiana, Punjab 141010',
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
    name: 'ATB HyperCluster Server Node X9',
    description: 'High-performance computing rackmount unit with dual 64-core accelerators and 512GB ECC DDR5.',
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
    name: 'ATB Industrial IoT Telemetry Sensor Suite',
    description: 'High-precision vibration, acoustic, and thermal telemetry sensor for automated facilities.',
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
    name: 'Industrial Grade Structural Alloy Billet 7075',
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
    name: 'ATB 32-Port 100GbE Managed Core Switch',
    description: 'Ultra-low latency spine-leaf high-bandwidth network switch with dual hot-swap PSUs.',
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
    name: 'Armored High-Speed Fiber Optical Cable (50m)',
    description: 'OM4 duplex LC-LC high-performance armored optical cable with protective caps.',
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
    name: 'ATB Hardware Cryptographic Security Module (HSM)',
    description: 'FIPS compliant physical root-of-trust hardware security module for enterprise encryption.',
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
  // Company 2: Tata Advanced Robotics Products
  {
    id: 7,
    companyId: 2,
    sku: 'TATA-ROB-6AXIS',
    name: 'Tata Heavy Duty 6-Axis Industrial Robotic Arm (500kg payload)',
    description: 'Precision articulated robotic arm for automotive welding, foundry and heavy handling.',
    category: 'Industrial Hardware',
    unit: 'unit',
    costPrice: 1850000,
    sellingPrice: 2650000,
    currentStock: 12,
    minStock: 2,
    maxStock: 50,
    warehouseLocation: 'Pune Assembly Hangar B',
    barcode: '890123490001',
    status: 'Active',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 8,
    companyId: 2,
    sku: 'TATA-AGV-1000',
    name: 'Autonomous Guided Transport Vehicle (1-Ton LiDAR AGV)',
    description: 'Self-navigating heavy factory warehouse transport vehicle with SLAM LiDAR navigation.',
    category: 'Industrial Hardware',
    unit: 'unit',
    costPrice: 620000,
    sellingPrice: 940000,
    currentStock: 8,
    minStock: 2,
    maxStock: 30,
    warehouseLocation: 'Pune Assembly Hangar C',
    barcode: '890123490002',
    status: 'Active',
    createdAt: '2026-02-05T00:00:00Z',
  },
];

export const initialQuotations: Quotation[] = [
  {
    id: 1,
    quotationNumber: 'QT-2026-0041',
    customerId: 1,
    customerName: 'Sharma Infotech Solutions Pvt Ltd',
    customerEmail: 'aarav.mehta@sharmainfotech.in',
    issueDate: '2026-03-10T11:00:00Z',
    expiryDate: '2026-04-10T23:59:59Z',
    subtotal: 22900.0,
    taxRate: 18.0,
    taxAmount: 4032.0,
    discountAmount: 500.0,
    totalAmount: 26432.0,
    status: 'Accepted',
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
      { productId: 4, productName: 'ATB 32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 2, unitPrice: 4600.0, total: 9200.0 },
    ],
    terms: 'Proposal valid for 30 calendar days from issue. Delivery within 10 business days of purchase order confirmation. Standard ATB Software 3-year warranty included.',
    notes: 'Enterprise discount applied per strategic vendor framework agreement.',
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    id: 2,
    quotationNumber: 'QT-2026-0042',
    customerId: 4,
    customerName: 'Rao Advanced BioTech Innovations Pvt Ltd',
    customerEmail: 'deepika.rao@raobiotech.co.in',
    issueDate: '2026-03-12T09:30:00Z',
    expiryDate: '2026-04-12T23:59:59Z',
    subtotal: 7350.0,
    taxRate: 18.0,
    taxAmount: 1323.0,
    discountAmount: 0.0,
    totalAmount: 8673.0,
    status: 'Sent',
    itemsJson: [
      { productId: 2, productName: 'ATB Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 10, unitPrice: 395.0, total: 3950.0 },
      { productId: 6, productName: 'ATB Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 1, unitPrice: 3400.0, total: 3400.0 },
    ],
    terms: 'All hardware calibration certificates and ISO testing reports are enclosed with delivery. Net 30 payment terms.',
    notes: 'Laboratory cleanroom environmental telemetry monitoring project.',
    createdAt: '2026-03-12T09:30:00Z',
  },
  {
    id: 3,
    quotationNumber: 'QT-2026-0043',
    customerId: 5,
    customerName: 'Deshmukh Industrial Infrastructure Corp',
    customerEmail: 'v.deshmukh@deshmukhindustries.in',
    issueDate: '2026-03-14T14:15:00Z',
    expiryDate: '2026-04-14T23:59:59Z',
    subtotal: 4725.0,
    taxRate: 18.0,
    taxAmount: 814.5,
    discountAmount: 200.0,
    totalAmount: 5339.5,
    status: 'Draft',
    itemsJson: [
      { productId: 3, productName: 'Industrial Grade Structural Alloy Billet 7075', sku: 'RAW-ALU-7075', quantity: 20, unitPrice: 165.0, total: 3300.0 },
      { productId: 5, productName: 'Armored High-Speed Fiber Optical Cable (50m)', sku: 'OPT-FBR-50M', quantity: 15, unitPrice: 95.0, total: 1425.0 },
    ],
    terms: 'Direct mill shipment terms. Validity 30 days subject to raw material commodities index.',
    notes: 'Draft estimate prepared by regional account team.',
    createdAt: '2026-03-14T14:15:00Z',
  },
  {
    id: 4,
    quotationNumber: 'QT-2026-0040',
    customerId: 2,
    customerName: 'Nair Logistics & Supply Chain Ltd',
    customerEmail: 'priya.nair@nairlogistics.co.in',
    issueDate: '2026-02-20T10:00:00Z',
    expiryDate: '2026-03-22T23:59:59Z',
    subtotal: 13700.0,
    taxRate: 18.0,
    taxAmount: 2376.0,
    discountAmount: 500.0,
    totalAmount: 15576.0,
    status: 'Converted',
    convertedSalesOrderId: 2,
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
    ],
    terms: 'Official estimate converted to sales order SO-2026-0090.',
    notes: 'Successfully approved by client board and converted to order.',
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 5,
    quotationNumber: 'QT-2026-0038',
    customerId: 3,
    customerName: 'Sengupta Precision Engineering Works',
    customerEmail: 'amitav@sengupta-eng.in',
    issueDate: '2026-02-10T12:00:00Z',
    expiryDate: '2026-02-25T23:59:59Z',
    subtotal: 13800.0,
    taxRate: 18.0,
    taxAmount: 2484.0,
    discountAmount: 0.0,
    totalAmount: 16284.0,
    status: 'Declined',
    itemsJson: [
      { productId: 4, productName: 'ATB 32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 3, unitPrice: 4600.0, total: 13800.0 },
    ],
    terms: 'Proposal superseded by custom fiber optic configuration request.',
    notes: 'Customer opted for alternative fiber optics solution.',
    createdAt: '2026-02-10T12:00:00Z',
  },
  // Company 2: Tata Advanced Robotics Quotation
  {
    id: 6,
    companyId: 2,
    quotationNumber: 'QTN-TATA-2026-001',
    customerId: 6,
    customerName: 'Defence Research & Development Organisation (DRDO)',
    customerEmail: 'procurement@drdo.gov.in',
    issueDate: '2026-02-20T10:00:00Z',
    expiryDate: '2026-04-20T10:00:00Z',
    subtotal: 5300000,
    taxRate: 18,
    taxAmount: 954000,
    discountAmount: 200000,
    totalAmount: 6054000,
    status: 'Sent',
    itemsJson: [
      {
        productId: 7,
        productName: 'Tata Heavy Duty 6-Axis Industrial Robotic Arm (500kg payload)',
        sku: 'TATA-ROB-6AXIS',
        quantity: 2,
        unitPrice: 2650000,
        total: 5300000,
      },
    ],
    terms: 'Delivery within 45 days. 3-Year Onsite Comprehensive Maintenance included.',
    notes: 'Defence heavy manufacturing specification.',
    createdAt: '2026-02-20T10:00:00Z',
  },
];

export const initialSalesOrders: SalesOrder[] = [
  {
    id: 1,
    orderNumber: 'SO-2026-0089',
    customerId: 1,
    customerName: 'Sharma Infotech Solutions Pvt Ltd',
    orderDate: '2026-03-01T10:00:00Z',
    deliveryDate: '2026-03-08T18:00:00Z',
    subtotal: 31000.0,
    taxAmount: 5580.0,
    discountAmount: 0.0,
    totalAmount: 36580.0,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 4, unitPrice: 6850.0, total: 27400.0 },
      { productId: 4, productName: 'ATB 32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 1, unitPrice: 4600.0, total: 4600.0 },
    ],
    notes: 'Priority delivery for primary infrastructure expansion project.',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    orderNumber: 'SO-2026-0090',
    customerId: 2,
    customerName: 'Nair Logistics & Supply Chain Ltd',
    orderDate: '2026-03-04T14:30:00Z',
    deliveryDate: '2026-03-12T18:00:00Z',
    subtotal: 13700.0,
    taxAmount: 2466.0,
    discountAmount: 0.0,
    totalAmount: 16166.0,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
    ],
    notes: 'Dispatched via express freight tracking #EXP-CARRIER-981240982',
    createdAt: '2026-03-04T14:30:00Z',
  },
  {
    id: 3,
    orderNumber: 'SO-2026-0091',
    customerId: 3,
    customerName: 'Sengupta Precision Engineering Works',
    orderDate: '2026-03-08T09:15:00Z',
    deliveryDate: '2026-03-20T18:00:00Z',
    subtotal: 20600.0,
    taxAmount: 3708.0,
    discountAmount: 0.0,
    totalAmount: 24308.0,
    paymentStatus: 'Partial',
    orderStatus: 'Processing',
    itemsJson: [
      { productId: 6, productName: 'ATB Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 3400.0, total: 17000.0 },
      { productId: 5, productName: 'Armored High-Speed Fiber Optical Cable (50m)', sku: 'OPT-FBR-50M', quantity: 38, unitPrice: 95.0, total: 3610.0 },
    ],
    notes: 'Clearance documents and quality inspection sheets attached.',
    createdAt: '2026-03-08T09:15:00Z',
  },
  {
    id: 4,
    orderNumber: 'SO-2026-0092',
    customerId: 4,
    customerName: 'Rao Advanced BioTech Innovations Pvt Ltd',
    orderDate: '2026-03-12T16:00:00Z',
    deliveryDate: '2026-03-22T18:00:00Z',
    subtotal: 7900.0,
    taxAmount: 1422.0,
    discountAmount: 0.0,
    totalAmount: 9322.0,
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    itemsJson: [
      { productId: 2, productName: 'ATB Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 20, unitPrice: 395.0, total: 7900.0 },
    ],
    notes: 'Awaiting manufacturing confirmation on sensor allocation.',
    createdAt: '2026-03-12T16:00:00Z',
  },
  // Company 2: Tata Advanced Robotics Sales Order
  {
    id: 5,
    companyId: 2,
    orderNumber: 'SO-TATA-2026-001',
    customerId: 7,
    customerName: 'Bharat Heavy Electricals Limited (BHEL)',
    orderDate: '2026-02-25T11:00:00Z',
    deliveryDate: '2026-03-30T11:00:00Z',
    subtotal: 2650000,
    taxAmount: 477000,
    discountAmount: 50000,
    totalAmount: 3077000,
    paymentStatus: 'Partial',
    orderStatus: 'Processing',
    itemsJson: [
      {
        productId: 7,
        productName: 'Tata Heavy Duty 6-Axis Industrial Robotic Arm (500kg payload)',
        sku: 'TATA-ROB-6AXIS',
        quantity: 1,
        unitPrice: 2650000,
        total: 2650000,
      },
    ],
    notes: 'BHEL Plant Automation Phase 1 Project',
    createdAt: '2026-02-25T11:00:00Z',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-0045',
    salesOrderId: 1,
    customerId: 1,
    customerName: 'Sharma Infotech Solutions Pvt Ltd',
    customerEmail: 'billing@sharmainfotech.co.in',
    issueDate: '2026-03-01T11:00:00Z',
    dueDate: '2026-03-31T18:00:00Z',
    subtotal: 31000.0,
    taxRate: 18.0,
    taxAmount: 5580.0,
    totalAmount: 36580.0,
    amountPaid: 36580.0,
    status: 'Paid',
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 4, unitPrice: 6850.0, total: 27400.0 },
      { productId: 4, productName: 'ATB 32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 1, unitPrice: 4600.0, total: 4600.0 },
    ],
    terms: 'Payment received via RTGS Transfer ref #RTGS-882910.',
    createdAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-0046',
    salesOrderId: 2,
    customerId: 2,
    customerName: 'Nair Logistics & Supply Chain Ltd',
    customerEmail: 'accounts@nairlogistics.in',
    issueDate: '2026-03-04T15:00:00Z',
    dueDate: '2026-04-03T18:00:00Z',
    subtotal: 13700.0,
    taxRate: 18.0,
    taxAmount: 2466.0,
    totalAmount: 16166.0,
    amountPaid: 16166.0,
    status: 'Paid',
    itemsJson: [
      { productId: 1, productName: 'ATB HyperCluster Server Node X9', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 6850.0, total: 13700.0 },
    ],
    terms: 'Payment settled in full via NEFT.',
    createdAt: '2026-03-04T15:00:00Z',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-0047',
    salesOrderId: 3,
    customerId: 3,
    customerName: 'Sengupta Precision Engineering Works',
    customerEmail: 'finance@sengupta-eng.in',
    issueDate: '2026-03-08T10:00:00Z',
    dueDate: '2026-04-07T18:00:00Z',
    subtotal: 20600.0,
    taxRate: 18.0,
    taxAmount: 3708.0,
    totalAmount: 24308.0,
    amountPaid: 10000.0,
    status: 'Partial',
    itemsJson: [
      { productId: 6, productName: 'ATB Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 3400.0, total: 17000.0 },
      { productId: 5, productName: 'Armored High-Speed Fiber Optical Cable (50m)', sku: 'OPT-FBR-50M', quantity: 38, unitPrice: 95.0, total: 3610.0 },
    ],
    terms: '50% advance received via IMPS, balance payable upon final delivery.',
    createdAt: '2026-03-08T10:00:00Z',
  },
  {
    id: 4,
    invoiceNumber: 'INV-2026-0048',
    salesOrderId: 4,
    customerId: 4,
    customerName: 'Rao Advanced BioTech Innovations Pvt Ltd',
    customerEmail: 'billing@raobiotech.co.in',
    issueDate: '2026-03-12T17:00:00Z',
    dueDate: '2026-03-26T18:00:00Z',
    subtotal: 7900.0,
    taxRate: 18.0,
    taxAmount: 1422.0,
    totalAmount: 9322.0,
    amountPaid: 0.0,
    status: 'Unpaid',
    itemsJson: [
      { productId: 2, productName: 'ATB Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 20, unitPrice: 395.0, total: 7900.0 },
    ],
    terms: 'Net 14 payment terms apply.',
    createdAt: '2026-03-12T17:00:00Z',
  },
  // Company 2: Tata Advanced Robotics Invoice
  {
    id: 5,
    companyId: 2,
    invoiceNumber: 'INV-TATA-2026-001',
    salesOrderId: 5,
    customerId: 7,
    customerName: 'Bharat Heavy Electricals Limited (BHEL)',
    customerEmail: 'automation@bhel.in',
    issueDate: '2026-02-25T12:00:00Z',
    dueDate: '2026-03-27T18:00:00Z',
    subtotal: 2650000,
    taxRate: 18,
    taxAmount: 477000,
    totalAmount: 3077000,
    amountPaid: 1500000,
    status: 'Partial',
    itemsJson: [
      {
        productId: 7,
        productName: 'Tata Heavy Duty 6-Axis Industrial Robotic Arm (500kg payload)',
        sku: 'TATA-ROB-6AXIS',
        quantity: 1,
        unitPrice: 2650000,
        total: 2650000,
      },
    ],
    terms: '50% advance received via RTGS, balance on commissioning.',
    createdAt: '2026-02-25T12:00:00Z',
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2026-0021',
    supplierId: 1,
    supplierName: 'Varma Precision Micro-Electronics Pvt Ltd',
    orderDate: '2026-02-25T08:30:00Z',
    expectedDelivery: '2026-03-15T18:00:00Z',
    totalAmount: 18500.0,
    status: 'Received',
    approvedBy: 'Sneha Kulkarni (Director of Supply Chain)',
    approvedAt: '2026-02-26T10:00:00Z',
    itemsJson: [
      { productId: 2, productName: 'ATB Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 50, unitPrice: 180.0, total: 9000.0 },
      { productId: 6, productName: 'ATB Hardware Cryptographic Security Module (HSM)', sku: 'SEC-MOD-PRO', quantity: 5, unitPrice: 1900.0, total: 9500.0 },
    ],
    notes: 'Batch inspection report signed off by QA team and stocked in Zone B.',
    createdAt: '2026-02-25T08:30:00Z',
  },
  {
    id: 2,
    poNumber: 'PO-2026-0022',
    supplierId: 2,
    supplierName: 'Sundaram Industrial Hardware & Fasteners Ltd',
    orderDate: '2026-03-05T11:00:00Z',
    expectedDelivery: '2026-03-28T18:00:00Z',
    totalAmount: 22800.0,
    status: 'Ordered',
    approvedBy: 'Ananya Iyer (Chief Financial Officer)',
    approvedAt: '2026-03-06T14:30:00Z',
    itemsJson: [
      { productId: 4, productName: 'ATB 32-Port 100GbE Managed Core Switch', sku: 'NET-SW-100G', quantity: 8, unitPrice: 2850.0, total: 22800.0 },
    ],
    notes: 'Air freight express shipment from Chennai logistics terminal dispatched.',
    createdAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 3,
    poNumber: 'PO-2026-0023',
    supplierId: 1,
    supplierName: 'Varma Precision Micro-Electronics Pvt Ltd',
    orderDate: '2026-03-14T09:15:00Z',
    expectedDelivery: '2026-03-31T18:00:00Z',
    totalAmount: 18000.0,
    status: 'Pending Review',
    itemsJson: [
      { productId: 2, productName: 'ATB Industrial IoT Telemetry Sensor Suite', sku: 'ELC-SEN-401', quantity: 100, unitPrice: 180.0, total: 18000.0 },
    ],
    notes: 'Urgent restocking: inventory below safety buffer threshold. Awaiting executive budget approval.',
    createdAt: '2026-03-14T09:15:00Z',
  },
  {
    id: 4,
    poNumber: 'PO-2026-0024',
    supplierId: 3,
    supplierName: 'Hindusthan Precision Tooling Pvt Ltd',
    orderDate: '2026-03-15T14:00:00Z',
    expectedDelivery: '2026-04-05T18:00:00Z',
    totalAmount: 2550.0,
    status: 'Approved',
    approvedBy: 'Sneha Kulkarni (Director of Supply Chain)',
    approvedAt: '2026-03-16T11:30:00Z',
    itemsJson: [
      { productId: 3, productName: 'Industrial Grade Structural Alloy Billet 7075', sku: 'RAW-ALU-7075', quantity: 30, unitPrice: 85.0, total: 2550.0 },
    ],
    notes: 'Approved by Supply Chain Lead. Ready to transmit official purchase order to vendor.',
    createdAt: '2026-03-15T14:00:00Z',
  },
  {
    id: 5,
    poNumber: 'PO-2026-0020',
    supplierId: 4,
    supplierName: 'Radiant Opto-Electronics Components Corp',
    orderDate: '2026-02-18T16:45:00Z',
    expectedDelivery: '2026-03-05T18:00:00Z',
    totalAmount: 5700.0,
    status: 'Rejected',
    approvedBy: 'Ananya Iyer (Chief Financial Officer)',
    approvedAt: '2026-02-19T13:00:00Z',
    rejectionReason: 'Exceeds Q1 departmental logistics buffer; vendor must re-quote with volume discount.',
    itemsJson: [
      { productId: 5, productName: 'Armored High-Speed Fiber Optical Cable (50m)', sku: 'OPT-FBR-50M', quantity: 60, unitPrice: 95.0, total: 5700.0 },
    ],
    notes: 'Proposal rejected during weekly finance audit review.',
    createdAt: '2026-02-18T16:45:00Z',
  },
];

export const initialFinancialTransactions: FinancialTransaction[] = [
  {
    id: 1,
    txNumber: 'TX-2026-0101',
    date: '2026-03-01T12:00:00Z',
    type: 'Income',
    category: 'Product Sales',
    amount: 36580.0,
    paymentMethod: 'RTGS / Bank Transfer',
    reference: 'INV-2026-0045 / Sharma Infotech',
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
    reference: 'CLOUD-INFRA-772910',
    status: 'Completed',
    description: 'Monthly dedicated cloud cluster and serverless Neon Postgres compute resources.',
    createdAt: '2026-03-03T15:30:00Z',
  },
  {
    id: 3,
    txNumber: 'TX-2026-0103',
    date: '2026-03-05T10:00:00Z',
    type: 'Income',
    category: 'Product Sales',
    amount: 14570.0,
    paymentMethod: 'NEFT Transfer',
    reference: 'INV-2026-0046 / Nair Logistics',
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
    paymentMethod: 'Bank Transfer',
    reference: 'PO-2026-0021 / Varma Micro',
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
    paymentMethod: 'RTGS Transfer',
    reference: 'SRV-ENG-09',
    status: 'Completed',
    description: 'On-site enterprise architecture review and deployment service retainer.',
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
    reference: 'FREIGHT-EXP-192',
    status: 'Completed',
    description: 'Customs clearing, port logistics, and air cargo handling.',
    createdAt: '2026-03-12T14:20:00Z',
  },
  // Company 2: Tata Advanced Robotics Financial Transaction
  {
    id: 7,
    companyId: 2,
    txNumber: 'TX-TATA-2026-001',
    date: '2026-02-25T14:00:00Z',
    type: 'Income',
    category: 'Product Sales',
    amount: 1500000.0,
    paymentMethod: 'RTGS / Wire',
    reference: 'RTGS-BHEL-88910 / BHEL Plant Division',
    status: 'Completed',
    description: 'Advance payment 50% for 6-Axis Industrial Robotic Arm order.',
    createdAt: '2026-02-25T14:00:00Z',
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 1,
    employeeCode: 'EMP-001',
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'a.mehta@atbsoftware.com',
    phone: '+91 98200 11001',
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
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'a.iyer@atbsoftware.com',
    phone: '+91 98450 22002',
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
    email: 'r.patel@atbsoftware.com',
    phone: '+91 97110 33003',
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
    firstName: 'Sneha',
    lastName: 'Kulkarni',
    email: 's.kulkarni@atbsoftware.com',
    phone: '+91 98220 44004',
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
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'a.verma@atbsoftware.com',
    phone: '+91 94480 55005',
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
    firstName: 'Pooja',
    lastName: 'Reddy',
    email: 'p.reddy@atbsoftware.com',
    phone: '+91 99000 66006',
    department: 'Human Resources',
    position: 'People Operations Lead',
    salary: 110000,
    joinDate: '2024-02-15T09:00:00Z',
    status: 'Active',
    createdAt: '2024-02-15T09:00:00Z',
  },
  // Company 2: Tata Advanced Robotics Employees
  {
    id: 7,
    companyId: 2,
    employeeCode: 'TATA-EMP-001',
    firstName: 'Kabir',
    lastName: 'Singhania',
    email: 'kabir.singhania@tatarobotics.com',
    phone: '+91 22 6665 8201',
    department: 'Chief Executive Office',
    position: 'Chief Executive Officer & MD',
    salary: 450000,
    joinDate: '2026-02-01T00:00:00Z',
    status: 'Active',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 8,
    companyId: 2,
    employeeCode: 'TATA-EMP-002',
    firstName: 'Riya',
    lastName: 'Sen',
    email: 'riya.sen@tatarobotics.com',
    phone: '+91 22 6665 8202',
    department: 'Defence & Industrial Sales',
    position: 'Director of Business Development',
    salary: 190000,
    joinDate: '2026-02-05T00:00:00Z',
    status: 'Active',
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 9,
    companyId: 2,
    employeeCode: 'TATA-EMP-003',
    firstName: 'Arjun',
    lastName: 'Patel',
    email: 'arjun.patel@tatarobotics.com',
    phone: '+91 22 6665 8203',
    department: 'Finance & Accounts',
    position: 'Chief Financial Officer',
    salary: 210000,
    joinDate: '2026-02-10T00:00:00Z',
    status: 'Active',
    createdAt: '2026-02-10T00:00:00Z',
  },
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 1,
    orderNumber: 'WO-2026-0301',
    title: 'Precision Assembly: 10x Server Node X9 Units',
    productName: 'ATB HyperCluster Server Node X9',
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
    productName: 'ATB Industrial IoT Telemetry Sensor Suite',
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
    productName: 'ATB Hardware Cryptographic Security Module (HSM)',
    quantity: 15,
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'CNC Operations',
    progress: 25,
    startDate: '2026-03-15T08:00:00Z',
    dueDate: '2026-04-02T17:00:00Z',
    notes: 'Awaiting structural alloy billet cutting approval.',
    createdAt: '2026-03-15T08:00:00Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 1,
    actor: 'Aarav Mehta (CEO)',
    action: 'Approved Sales Order',
    module: 'Sales & CRM',
    details: 'Approved SO-2026-0089 for Sharma Infotech Solutions (₹36,580.00)',
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 2,
    actor: 'Ananya Iyer (CFO)',
    action: 'Recorded Payment',
    module: 'Finance & Accounts',
    details: 'Reconciled RTGS transfer WT-882910 of ₹36,580.00 against INV-2026-0045',
    createdAt: '2026-03-01T12:05:00Z',
  },
  {
    id: 3,
    actor: 'Sneha Kulkarni (Supply Chain)',
    action: 'Dispatched Goods',
    module: 'Inventory',
    details: 'Marked 4x ELC-SRV-900 and 1x NET-SW-100G as dispatched via express freight',
    createdAt: '2026-03-04T15:20:00Z',
  },
  {
    id: 4,
    actor: 'System Automation',
    action: 'Low Stock Alert Triggered',
    module: 'Inventory',
    details: 'ATB Telemetry Sensor Suite (ELC-SEN-401) reached 6 units (below min 15)',
    createdAt: '2026-03-12T16:05:00Z',
  },
];

export const initialUsers: User[] = [
  // Company 1: ATB Software Solutions (Super Admin & Company 1 staff)
  {
    id: 1,
    companyId: 1,
    name: 'Aarav Mehta',
    email: 'aarav.mehta@atbsoftware.com',
    passwordHash: 'atb_enterprise_salt:810994b9a120f32beacf710b423445cdee1b248281a217953f5a988ecddf30bfeabd15684121214a6b8e11d699b2b1b48e63632ae09b8c6f0ba849f43a3aa9ad',
    role: 'Admin',
    department: 'Executive Administration',
    avatar: 'AM',
    status: 'Active',
    isCompanyAdmin: true,
    isPlatformAdmin: true,
    lastLogin: '2026-03-19T08:30:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    companyId: 1,
    name: 'Ananya Iyer',
    email: 'ananya.iyer@atbsoftware.com',
    passwordHash: 'atb_enterprise_salt:2d98a9762b329378ab34dc667b3ca93b8ca05ed5501e6c5b21f02da6da94990304b8aa8c7acd712d0f03af27cdcbe67f53b6a34f7c8a40e6a9d2981437780803',
    role: 'Finance',
    department: 'Finance & Accounts',
    avatar: 'AI',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-19T09:15:00Z',
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 3,
    companyId: 1,
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@atbsoftware.com',
    passwordHash: 'atb_enterprise_salt:0129fc8af983a9cecd43afb8dfb76bd342971e9bb97e756aec11fcc8c1dddfa5e4064fa76eef8de256f80bfd9be81980d11a955259342eb94b70a268efb30d0b',
    role: 'Inventory',
    department: 'Supply Chain & Procurement',
    avatar: 'SK',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-18T14:40:00Z',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 4,
    companyId: 1,
    name: 'Pooja Reddy',
    email: 'pooja.reddy@atbsoftware.com',
    passwordHash: 'atb_enterprise_salt:a59e98c8605b2a5a2148d9c0dc281630f85f34c8a92139e03c6a01444141f3378ab5a29363c53ba58633c751af2db692b818b3bacc5f1962192487bdce254ef4',
    role: 'HR',
    department: 'Human Resources',
    avatar: 'PR',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-17T11:20:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 5,
    companyId: 1,
    name: 'Vikram Sharma',
    email: 'vikram.sharma@atbsoftware.com',
    passwordHash: 'atb_enterprise_salt:bc545c452fc0e2c9cb07e332fe5161d6f1742cae1272a629f580334065c000304199ecc83b5d6fd8db148f6a9511d7963c77043a77abffe8d775d99b35e0b51f',
    role: 'Sales',
    department: 'Commercial Sales & CRM',
    avatar: 'VS',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-19T07:45:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
  // Company 2: Tata Advanced Robotics & Automation Ltd (Company CEO & Sub-Accounts)
  {
    id: 6,
    companyId: 2,
    name: 'Kabir Singhania',
    email: 'kabir.singhania@tatarobotics.com',
    passwordHash: 'atb_enterprise_salt:5de901524cf8364d83e0de11d805ea27986b95a301ba7139f4f0916185cfe740bec57d4da108403c407d4ba4038fe06056ac9c7d1e4e46fed4ac523f8a6a23eb',
    role: 'Admin',
    department: 'Chief Executive Office',
    avatar: 'KS',
    status: 'Active',
    isCompanyAdmin: true,
    isPlatformAdmin: false,
    lastLogin: '2026-03-19T10:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 7,
    companyId: 2,
    name: 'Riya Sen',
    email: 'riya.sen@tatarobotics.com',
    passwordHash: 'atb_enterprise_salt:5de901524cf8364d83e0de11d805ea27986b95a301ba7139f4f0916185cfe740bec57d4da108403c407d4ba4038fe06056ac9c7d1e4e46fed4ac523f8a6a23eb',
    role: 'Sales',
    department: 'Defence & Industrial Sales',
    avatar: 'RS',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-18T16:20:00Z',
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 8,
    companyId: 2,
    name: 'Arjun Patel',
    email: 'arjun.patel@tatarobotics.com',
    passwordHash: 'atb_enterprise_salt:5de901524cf8364d83e0de11d805ea27986b95a301ba7139f4f0916185cfe740bec57d4da108403c407d4ba4038fe06056ac9c7d1e4e46fed4ac523f8a6a23eb',
    role: 'Finance',
    department: 'Treasury & Accounts',
    avatar: 'AP',
    status: 'Active',
    isCompanyAdmin: false,
    isPlatformAdmin: false,
    lastLogin: '2026-03-18T12:00:00Z',
    createdAt: '2026-02-10T00:00:00Z',
  },
  // Company 3: Nexus Quantum (Pending Approval Demo CEO)
  {
    id: 9,
    companyId: 3,
    name: 'Rohan Deshmukh',
    email: 'rohan@nexusquantum.in',
    passwordHash: 'atb_enterprise_salt:4c36160c2361d1a33a8034b046e062c5e867fa704e49a787d596ea85e2f4a739be641039a276ddc20e6b9b568ce79c1d674dc187c257e959fcef3baf85193adf',
    role: 'Admin',
    department: 'Founding Leadership',
    avatar: 'RD',
    status: 'Active',
    isCompanyAdmin: true,
    isPlatformAdmin: false,
    lastLogin: undefined,
    createdAt: '2026-10-20T14:30:00Z',
  },
];

