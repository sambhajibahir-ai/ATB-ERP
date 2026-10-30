'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Modal } from '@/components/ui/modal';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Send,
  Building2,
  Mail,
  Phone,
  IndianRupee,
  UserPlus,
  FileSpreadsheet,
  ArrowRight,
  Tag,
  AlertCircle,
  Check,
  CheckCheck,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { SalesOrder, Customer, Product, Invoice, Quotation, Company } from '@/lib/mock-data';

function SalesContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'quotations' | 'orders' | 'customers' | 'invoices'>('quotations');

  useEffect(() => {
    if (tabParam && ['quotations', 'orders', 'customers', 'invoices'].includes(tabParam)) {
      setActiveTab(tabParam as 'quotations' | 'orders' | 'customers' | 'invoices');
    }
  }, [tabParam]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // New Quotation Form state
  const [quoteCustomer, setQuoteCustomer] = useState<number>(1);
  const [quoteProduct, setQuoteProduct] = useState<number>(1);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(1);
  const [quoteValidityDays, setQuoteValidityDays] = useState<number>(30);
  const [quoteDiscount, setQuoteDiscount] = useState<string>('0');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('');

  // New Order Form state
  const [orderCustomer, setOrderCustomer] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<number>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderDiscount, setOrderDiscount] = useState<string>('0');
  const [orderNotes, setOrderNotes] = useState('');

  // New Customer Form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91 98765 43210');
  const [newCustGstin, setNewCustGstin] = useState('27AABCS0000A1Z1');
  const [newCustAddress, setNewCustAddress] = useState('Corporate Headquarters, India');
  const [newCustCredit, setNewCustCredit] = useState('50000');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setQuoteProduct((prev) => (products.some((p) => p.id === prev) ? prev : products[0].id));
      setSelectedProduct((prev) => (products.some((p) => p.id === prev) ? prev : products[0].id));
    }
  }, [products]);

  useEffect(() => {
    if (customers.length > 0) {
      setQuoteCustomer((prev) => (customers.some((c) => c.id === prev) ? prev : customers[0].id));
      setOrderCustomer((prev) => (customers.some((c) => c.id === prev) ? prev : customers[0].id));
    }
  }, [customers]);

  async function loadData() {
    try {
      const [salesRes, quoteRes, invRes, finRes, compRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/quotations'),
        fetch('/api/inventory'),
        fetch('/api/finance'),
        fetch('/api/companies'),
      ]);

      const salesData = await salesRes.json();
      setOrders(salesData.orders || []);
      const loadedCustomers: Customer[] = salesData.customers || [];
      setCustomers(loadedCustomers);

      const quoteData = await quoteRes.json();
      setQuotations(Array.isArray(quoteData) ? quoteData : []);

      const invData = await invRes.json();
      const loadedProducts: Product[] = Array.isArray(invData) ? invData : [];
      setProducts(loadedProducts);

      if (loadedCustomers.length > 0) {
        setQuoteCustomer((prev) => (loadedCustomers.some((c) => c.id === prev) ? prev : loadedCustomers[0].id));
        setOrderCustomer((prev) => (loadedCustomers.some((c) => c.id === prev) ? prev : loadedCustomers[0].id));
      }
      if (loadedProducts.length > 0) {
        setQuoteProduct((prev) => (loadedProducts.some((p) => p.id === prev) ? prev : loadedProducts[0].id));
        setSelectedProduct((prev) => (loadedProducts.some((p) => p.id === prev) ? prev : loadedProducts[0].id));
      }

      const finData = await finRes.json();
      setInvoices(finData.invoices || []);

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.company) {
          setCurrentCompany(compData.company);
        } else if (compData.companies && compData.companies.length > 0) {
          setCurrentCompany(compData.companies[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateQuotation(e: React.FormEvent) {
    e.preventDefault();
    const activeCustId = customers.some((c) => c.id === quoteCustomer) ? quoteCustomer : (customers[0]?.id || 0);
    const activeProdId = products.some((p) => p.id === quoteProduct) ? quoteProduct : (products[0]?.id || 0);
    const cust = customers.find((c) => c.id === activeCustId);
    if (!cust) {
      alert('Please select or create a customer before generating a quotation.');
      return;
    }
    const prod = products.find((p) => p.id === activeProdId);
    if (!prod) {
      alert('Please add at least one product before generating a quotation.');
      return;
    }

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust.id,
          customerName: cust.company || cust.name,
          customerEmail: cust.email,
          items: [{ productId: activeProdId, quantity: Number(quoteQuantity || 1) }],
          validityDays: Number(quoteValidityDays),
          discountAmount: Number(quoteDiscount || 0),
          terms: quoteTerms,
          notes: quoteNotes,
        }),
      });

      if (res.ok) {
        setIsQuoteModalOpen(false);
        setQuoteNotes('');
        setQuoteTerms('');
        setQuoteDiscount('0');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendQuotationEmail(quote: Quotation) {
    try {
      // 1. Update quotation status to 'Sent' in the database
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', quotationId: quote.id, status: 'Sent' }),
      });

      if (res.ok) {
        loadData();
        if (selectedQuote && selectedQuote.id === quote.id) {
          setSelectedQuote({ ...selectedQuote, status: 'Sent' });
        }
      }

      const compName = currentCompany?.name || 'ATB Software';
      const compOps = currentCompany?.operationsName || `${compName} Enterprise Operations`;
      const compReg = currentCompany?.registrationNumber || currentCompany?.code || 'ATB-REG-2026-99';
      const compEmail = currentCompany?.email || 'billing@atbsoftware.com';
      const compAddr = currentCompany?.address || 'ATB Towers, Wagholi, Pune, Maharashtra 412207';
      const docType = currentCompany?.documentTypeNote || 'Official Commercial Price Quotation';

      // 2. Prepare professional corporate email draft
      const subject = encodeURIComponent(`${docType} - ${quote.quotationNumber} from ${compName}`);

      const itemsList = (quote.itemsJson || [])
        .map((i) => `  • ${i.productName} (Qty: ${i.quantity}) @ ₹${Number(i.unitPrice).toLocaleString('en-IN')} = ₹${Number(i.total).toLocaleString('en-IN')}`)
        .join('\n');

      const bodyText = [
        `Dear ${quote.customerName || 'Valued Client'},`,
        '',
        `Thank you for your interest in our products and solutions. Please find the formal price proposal details below:`,
        '',
        `==================================================`,
        `${docType.toUpperCase()}: ${quote.quotationNumber}`,
        `==================================================`,
        `Division / Entity: ${compOps}`,
        `Registration:      ${compReg} • ${compEmail}`,
        `Issue Date:        ${new Date(quote.issueDate).toLocaleDateString()}`,
        `Expiry Date:       ${new Date(quote.expiryDate).toLocaleDateString()}`,
        '',
        `ITEM DETAILS & PRICING:`,
        itemsList,
        '',
        `--------------------------------------------------`,
        `Calculated Subtotal:  ₹${Number(quote.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        quote.discountAmount > 0
          ? `Discount Applied:    -₹${Number(quote.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : null,
        `Taxable Amount:       ₹${Math.max(0, Number(quote.subtotal) - Number(quote.discountAmount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `Estimated GST (18%):  ₹${Number(quote.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `Grand Total:          ₹${Number(quote.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `--------------------------------------------------`,
        '',
        `COMMERCIAL TERMS:`,
        quote.terms || 'Standard enterprise 30-day quotation validity and manufacturer warranty applies.',
        '',
        quote.notes ? `PROJECT NOTES:\n${quote.notes}\n` : null,
        `To accept this proposal, please reply directly to this email or reach out to our enterprise team.`,
        '',
        `Best regards,`,
        `${compName} Commercial Sales & Solutions Team`,
        compAddr,
        `Email: ${compEmail}`,
      ]
        .filter((line) => line !== null)
        .join('\n');

      const recipient = quote.customerEmail || compEmail;
      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

      // 3. Trigger email client
      window.location.href = mailtoUrl;

      // 4. Show success banner
      setConvertSuccessMsg(`Email client draft opened for ${recipient}! Quotation ${quote.quotationNumber} marked as Sent.`);
      setTimeout(() => setConvertSuccessMsg(null), 7000);
    } catch (err) {
      console.error(err);
      alert('Error updating quotation status.');
    }
  }

  async function handleUpdateQuoteStatus(quotationId: number, status: Quotation['status']) {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', quotationId, status }),
      });
      if (res.ok) {
        loadData();
        if (selectedQuote && selectedQuote.id === quotationId) {
          setSelectedQuote({ ...selectedQuote, status });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConvertToSalesOrder(quotationId: number) {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert_to_order', quotationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConvertSuccessMsg(
          `Success! Quotation was converted into Sales Order ${data.salesOrder.orderNumber} (₹${data.salesOrder.totalAmount.toLocaleString('en-IN')}).`
        );
        loadData();
        if (selectedQuote && selectedQuote.id === quotationId) {
          setSelectedQuote(data.quotation);
        }
        setTimeout(() => setConvertSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    const activeCustId = customers.some((c) => c.id === orderCustomer) ? orderCustomer : (customers[0]?.id || 0);
    const activeProdId = products.some((p) => p.id === selectedProduct) ? selectedProduct : (products[0]?.id || 0);
    const cust = customers.find((c) => c.id === activeCustId);
    if (!cust) {
      alert('Please select or create a customer account before issuing an order.');
      return;
    }
    const prod = products.find((p) => p.id === activeProdId);
    if (!prod) {
      alert('Please add at least one product SKU to inventory before issuing an order.');
      return;
    }

    try {
      const discountNum = Math.max(0, Number(orderDiscount) || 0);
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust.id,
          customerName: cust.company || cust.name,
          customerEmail: cust.email,
          items: [{ productId: activeProdId, quantity: Number(orderQuantity || 1) }],
          discountAmount: discountNum,
          notes: orderNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const orderNum = data.orderNumber || data.order?.orderNumber || 'New Order';
        const invNum = data.invoice?.invoiceNumber || '';
        setIsOrderModalOpen(false);
        setOrderNotes('');
        setOrderDiscount('0');
        await loadData();
        setConvertSuccessMsg(
          `Success! Sales Order ${orderNum} was created and Commercial Tax Invoice ${invNum || ''} was generated.`
        );
        setTimeout(() => setConvertSuccessMsg(null), 8000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerateInvoiceForOrder(orderId: number) {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_invoice', orderId }),
      });
      if (res.ok) {
        const invoice = await res.json();
        await loadData();
        setSelectedInvoice(invoice);
        setConvertSuccessMsg(`Commercial Tax Invoice ${invoice.invoiceNumber} successfully generated!`);
        setTimeout(() => setConvertSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSavingCustomer(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          email: newCustEmail,
          company: newCustCompany,
          phone: newCustPhone || '+91 98765 43210',
          taxNumber: newCustGstin || '27AABCS0000A1Z1',
          address: newCustAddress || 'Corporate Headquarters, India',
          creditLimit: parseFloat(newCustCredit) || 25000,
          outstandingBalance: 0,
          status: 'Active',
        }),
      });

      if (res.ok) {
        setIsCustomerModalOpen(false);
        setNewCustName('');
        setNewCustEmail('');
        setNewCustCompany('');
        setNewCustCredit('50000');
        await loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save customer to database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving customer to database.');
    } finally {
      setIsSavingCustomer(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: number, status: SalesOrder['orderStatus']) {
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId, status }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkInvoicePaid(invoiceId: number) {
    try {
      await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', invoiceId }),
      });
      loadData();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'Paid', amountPaid: selectedInvoice.totalAmount });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.itemsJson.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuoteValue = quotations.reduce((acc, q) => acc + q.totalAmount, 0);
  const acceptedQuotesCount = quotations.filter((q) => q.status === 'Accepted').length;
  const convertedQuotesCount = quotations.filter((q) => q.status === 'Converted').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sales & Client Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End-to-end sales lifecycle: preliminary quotations, confirmed orders, and commercial tax invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-500/20 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* Conversion Banner Alert */}
      {convertSuccessMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{convertSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold underline hover:text-emerald-950 dark:hover:text-white shrink-0 ml-3"
          >
            View in Orders &rarr;
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap pb-px">
        <button
          onClick={() => {
            setActiveTab('quotations');
            setStatusFilter('ALL');
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'quotations'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Quotations & Estimates ({quotations.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('orders');
            setStatusFilter('ALL');
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Sales Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('customers');
            setStatusFilter('ALL');
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'customers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Customers & CRM ({customers.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('invoices');
            setStatusFilter('ALL');
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Billing & Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: Quotations & Price Estimates */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          {/* Overview KPI Cards for Quotations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Proposals</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {quotations.length} Tracked
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Pipeline Est. Value</span>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{totalQuoteValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Accepted Proposals</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {acceptedQuotesCount} Ready to Convert
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Orders Converted</span>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {convertedQuotesCount} Won Deals
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes, client, product..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
              >
                <option value="ALL">All Proposal Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Client</option>
                <option value="Accepted">Accepted</option>
                <option value="Converted">Converted to Order</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Quote #</th>
                    <th className="py-3 px-4 font-semibold">Client / Company</th>
                    <th className="py-3 px-4 font-semibold">Issued Date</th>
                    <th className="py-3 px-4 font-semibold">Valid Until</th>
                    <th className="py-3 px-4 font-semibold">Line Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Est.</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotations.map((quote) => {
                    const isExpired = new Date(quote.expiryDate).getTime() < Date.now() && quote.status !== 'Converted';
                    const daysLeft = Math.ceil(
                      (new Date(quote.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={quote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>{quote.quotationNumber}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {quote.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">{quote.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(quote.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-600 dark:text-slate-400">
                            {new Date(quote.expiryDate).toLocaleDateString()}
                          </div>
                          {isExpired ? (
                            <span className="text-[10px] font-semibold text-rose-500">Expired</span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Expires today'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {quote.itemsJson.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                          ₹{quote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              quote.status === 'Accepted'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : quote.status === 'Sent'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : quote.status === 'Converted'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                                : quote.status === 'Declined'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {quote.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedQuote(quote)}
                              title="Preview Commercial Quotation"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {quote.status === 'Draft' && (
                              <button
                                onClick={() => handleSendQuotationEmail(quote)}
                                title="Open email draft in default mail client and mark as Sent"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Send</span>
                              </button>
                            )}

                            {quote.status === 'Sent' && (
                              <>
                                <button
                                  onClick={() => handleSendQuotationEmail(quote)}
                                  title="Re-open email draft in mail client"
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Email</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateQuoteStatus(quote.id, 'Accepted')}
                                  title="Mark as Accepted by Client"
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateQuoteStatus(quote.id, 'Declined')}
                                  title="Mark as Declined"
                                  className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 text-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {quote.status === 'Accepted' && (
                              <button
                                onClick={() => handleConvertToSalesOrder(quote.id)}
                                title="1-Click Convert to Confirmed Sales Order"
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Convert to Order</span>
                              </button>
                            )}

                            {quote.status === 'Converted' && (
                              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                                ✓ SO Created
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredQuotations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-xs text-slate-400">
                        No quotations matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sales Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Overview KPI Cards for Sales Orders & Invoicing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Sales Orders</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {orders.length}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Invoices Generated</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {orders.filter((o) => invoices.some((i) => i.salesOrderId === o.id)).length} Invoices
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Settled Invoices</span>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {invoices.filter((i) => i.status === 'Paid').length} Paid
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Pipeline Value</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  ₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders or customer..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
              >
                <option value="ALL">All Order Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order #</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-center">Tax Invoice</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => {
                    const linkedInvoice = invoices.find((i) => i.salesOrderId === order.id);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {order.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {order.itemsJson.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                          {Boolean(order.discountAmount && order.discountAmount > 0) && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Saved ₹{order.discountAmount.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : order.orderStatus === 'Shipped'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {linkedInvoice ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedInvoice(linkedInvoice)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                                title="Click to view and print official tax invoice"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{linkedInvoice.invoiceNumber}</span>
                              </button>
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                                  linkedInvoice.status === 'Paid'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {linkedInvoice.status}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateInvoiceForOrder(order.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs cursor-pointer"
                              title="Click to generate tax invoice for this order"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Generate Invoice</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value as SalesOrder['orderStatus'])
                            }
                            className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Customers & CRM */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {cust.code}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {cust.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {cust.company}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {cust.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Credit Limit</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    ₹{cust.creditLimit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Balance</span>
                  <div className={`font-bold ${cust.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                    ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Invoices & Print Preview */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Due Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                    <th className="py-3 px-4 font-semibold text-right">GST (18%)</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {inv.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        ₹{inv.subtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        ₹{inv.taxAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : inv.status === 'Partial'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => handleMarkInvoicePaid(inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Sales Order */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create New Sales Order"
        description="Select client, configure items, and automatically trigger inventory reservation and invoice generation."
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client / Customer Account
            </label>
            <select
              value={customers.some((c) => c.id === orderCustomer) ? orderCustomer : (customers[0]?.id ?? '')}
              onChange={(e) => setOrderCustomer(Number(e.target.value))}
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Product SKU
              </label>
              <select
                value={products.some((p) => p.id === selectedProduct) ? selectedProduct : (products[0]?.id ?? '')}
                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.sellingPrice.toLocaleString('en-IN')} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Promotional / Partner Discount (INR - ₹)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={orderDiscount}
              onChange={(e) => setOrderDiscount(e.target.value)}
              placeholder="0"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Fulfillment Notes / Project Reference
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Expedited air shipment for enterprise expansion phase 1"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          {/* Order Live Calculation Box */}
          {(() => {
            const activeProductId = products.some((p) => p.id === selectedProduct)
              ? selectedProduct
              : (products[0]?.id || 0);
            const prod = products.find((p) => p.id === activeProductId);
            const unitPrice = prod ? Number(prod.sellingPrice || 0) : 0;
            const subtotal = unitPrice * Number(orderQuantity || 1);
            const discountNum = Math.max(0, Number(orderDiscount) || 0);
            const taxable = Math.max(0, subtotal - discountNum);
            const tax = Number((taxable * 0.18).toFixed(2));
            const grandTotal = Number((taxable + tax).toFixed(2));

            return (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Unit Price:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({orderQuantity} units):</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">
                      -₹{discountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Est. GST (18%):</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-blue-600 dark:text-blue-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Order Grand Total:</span>
                  <span className="font-mono">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              Confirm & Issue Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: New Customer */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Onboard New Corporate Client"
        description="Add customer details, company entity, and credit authorization."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Entity Name
            </label>
            <input
              type="text"
              required
              value={newCustCompany}
              onChange={(e) => setNewCustCompany(e.target.value)}
              placeholder="e.g. Bharat Dynamics Solutions Pvt Ltd"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Contact Person
              </label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Rohit Bansal"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="e.g. accounts@client.co.in"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={newCustGstin}
                onChange={(e) => setNewCustGstin(e.target.value)}
                placeholder="e.g. 27AABCS0000A1Z1"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={newCustGstin}
                onChange={(e) => setNewCustGstin(e.target.value)}
                placeholder="e.g. 27AABCS0000A1Z1"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credit Limit (INR - ₹)
              </label>
              <input
                type="number"
                value={newCustCredit}
                onChange={(e) => setNewCustCredit(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Corporate Address
            </label>
            <input
              type="text"
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              placeholder="e.g. Plot 42, Hinjewadi Phase 1, Pune, Maharashtra"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={isSavingCustomer}
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingCustomer}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSavingCustomer ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>Save Customer</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Printable Invoice Preview */}
      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={`Commercial Invoice • ${selectedInvoice?.invoiceNumber || ''}`}
        description="Official billing tax invoice document ready for client distribution or export."
        maxWidth="max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  {currentCompany?.name || 'ATB Software'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {currentCompany?.operationsName || `${currentCompany?.name || 'ATB Software'} Enterprise Operations`}
                  <br />
                  Registration: {currentCompany?.registrationNumber || currentCompany?.code || 'ATB-REG-2026-99'} • {currentCompany?.email || 'billing@atbsoftware.com'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                  Invoice Ref
                </span>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {selectedInvoice.invoiceNumber}
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedInvoice.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Billed To
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                  {selectedInvoice.customerName}
                </div>
                <p className="text-slate-500 mt-0.5">
                  Email: {selectedInvoice.customerEmail}
                  <br />
                  Terms: Net 30 Days
                </p>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <div>
                  <span className="text-slate-400">Issue Date: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Payment Due: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Item Rows Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.itemsJson.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {item.productName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {Boolean(selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0) && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-₹{selectedInvoice.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>GST ({selectedInvoice.taxRate}%):</span>
                  <span className="font-mono">₹{selectedInvoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total:</span>
                  <span className="font-mono">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 italic">
                {selectedInvoice.terms}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 w-full sm:w-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Create New Quotation */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Create Price Quotation / Estimate"
        description="Draft a formal enterprise proposal, configure SKU pricing margins, discounts, and validity period."
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Prospective Client / Customer
            </label>
            <select
              value={customers.some((c) => c.id === quoteCustomer) ? quoteCustomer : (customers[0]?.id ?? '')}
              onChange={(e) => setQuoteCustomer(Number(e.target.value))}
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name} • {c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Product SKU
              </label>
              <select
                value={products.some((p) => p.id === quoteProduct) ? quoteProduct : (products[0]?.id ?? '')}
                onChange={(e) => setQuoteProduct(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.sellingPrice.toLocaleString('en-IN')} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quoteQuantity}
                onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposal Validity Period
              </label>
              <select
                value={quoteValidityDays}
                onChange={(e) => setQuoteValidityDays(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value={15}>15 Days Validity</option>
                <option value={30}>30 Days (Standard Enterprise)</option>
                <option value={45}>45 Days Validity</option>
                <option value={60}>60 Days Validity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Promotional / Partner Discount (INR - ₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quoteDiscount}
                onChange={(e) => setQuoteDiscount(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Commercial Terms & Warranty Notes
            </label>
            <input
              type="text"
              value={quoteTerms}
              onChange={(e) => setQuoteTerms(e.target.value)}
              placeholder="e.g. Standard ATB Software 3-year warranty and Net 30 payment terms."
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Project Scope & Technical Notes
            </label>
            <textarea
              rows={2}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="e.g. Enterprise expansion phase 1; includes dedicated technical delivery manager."
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          {/* Live Calculation Box */}
          {(() => {
            const activeProductId = products.some((p) => p.id === quoteProduct)
              ? quoteProduct
              : (products[0]?.id || 0);
            const prod = products.find((p) => p.id === activeProductId);
            const unitPrice = prod ? Number(prod.sellingPrice || 0) : 0;
            const subtotal = unitPrice * Number(quoteQuantity || 1);
            const discount = parseFloat(quoteDiscount) || 0;
            const taxable = Math.max(0, subtotal - discount);
            const tax = taxable * 0.18;
            const grandTotal = taxable + tax;

            return (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Calculated Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Est. GST (18%):</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Quotation Grand Total:</span>
                  <span className="font-mono">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
            >
              Generate Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Printable Quotation Preview */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={`Commercial Price Quotation • ${selectedQuote?.quotationNumber || ''}`}
        description="Official formal proposal and price estimate document prepared for client approval."
        maxWidth="max-w-3xl"
      >
        {selectedQuote && (
          <div className="space-y-6 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>{currentCompany?.name || 'ATB Software'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {currentCompany?.operationsName || `${currentCompany?.name || 'ATB Software'} Enterprise Operations`}
                  <br />
                  Registration: {currentCompany?.registrationNumber || currentCompany?.code || 'ATB-REG-2026-99'} • {currentCompany?.email || 'billing@atbsoftware.com'}
                  <br />
                  Document Type: {currentCompany?.documentTypeNote || 'Official Commercial Price Quotation'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono text-xs font-bold text-slate-400 uppercase">
                  Quotation Ref
                </span>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {selectedQuote.quotationNumber}
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedQuote.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedQuote.status === 'Sent'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedQuote.status === 'Converted'
                        ? 'bg-purple-100 text-purple-800'
                        : selectedQuote.status === 'Declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    STATUS: {selectedQuote.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Info & Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Proposed To (Client)
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                  {selectedQuote.customerName}
                </div>
                <p className="text-slate-500 mt-0.5">
                  Official Contact: {selectedQuote.customerEmail}
                  <br />
                  Account Reference: Corporate Client
                </p>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <div>
                  <span className="text-slate-400">Issue Date: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedQuote.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Validity Expiration: </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {new Date(selectedQuote.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedQuote.convertedSalesOrderId && (
                  <div className="text-purple-600 font-semibold pt-1">
                    ✓ Converted into Order {orders.find((o) => o.id === selectedQuote.convertedSalesOrderId)?.orderNumber || `SO-ID-${selectedQuote.convertedSalesOrderId}`}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Estimated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedQuote.itemsJson.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {item.productName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedQuote.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedQuote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedQuote.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Est. GST ({selectedQuote.taxRate}%):</span>
                  <span className="font-mono">₹{selectedQuote.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Estimated Total:</span>
                  <span className="font-mono">₹{selectedQuote.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Commercial Proposal Terms</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedQuote.terms}
              </p>
              {selectedQuote.notes && (
                <p className="text-[11px] text-slate-400 italic mt-1">
                  Scope Note: {selectedQuote.notes}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {selectedQuote.status === 'Draft' && (
                  <button
                    onClick={() => handleSendQuotationEmail(selectedQuote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email to Client</span>
                  </button>
                )}
                {selectedQuote.status === 'Sent' && (
                  <>
                    <button
                      onClick={() => handleSendQuotationEmail(selectedQuote)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Re-open Email</span>
                    </button>
                    <button
                      onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'Accepted')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Accepted</span>
                    </button>
                  </>
                )}
                {selectedQuote.status !== 'Converted' && (
                  <button
                    onClick={() => {
                      handleConvertToSalesOrder(selectedQuote.id);
                      setSelectedQuote(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs shadow-indigo-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Convert to Sales Order</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Proposal / PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesContent />
    </Suspense>
  );
}

