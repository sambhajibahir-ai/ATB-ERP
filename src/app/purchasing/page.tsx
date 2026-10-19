'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Modal } from '@/components/ui/modal';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  Building,
  Mail,
  IndianRupee,
  PackageCheck,
  Star,
  Clock,
  ShieldCheck,
  XCircle,
  FileText,
  Printer,
  Send,
  Eye,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { PurchaseOrder, Supplier, Product } from '@/lib/mock-data';

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [previewPO, setPreviewPO] = useState<PurchaseOrder | null>(null);
  const [rejectingPO, setRejectingPO] = useState<PurchaseOrder | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [reviewerName, setReviewerName] = useState('Sneha Kulkarni (Director of Supply Chain)');

  // New PO State
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [orderQuantity, setOrderQuantity] = useState<number>(10);
  const [poNotes, setPoNotes] = useState('');

  // New Supplier State
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supTerms, setSupTerms] = useState('Net 30');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/purchasing');
      const data = await res.json();
      setPurchaseOrders(data.purchaseOrders || []);
      setSuppliers(data.suppliers || []);

      const prodRes = await fetch('/api/inventory');
      const prodData = await prodRes.json();
      setProducts(prodData || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreatePO(e: React.FormEvent) {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplier.id,
          supplierName: supplier.name,
          items: [{ productId: selectedProductId, quantity: Number(orderQuantity) }],
          notes: poNotes,
        }),
      });

      if (res.ok) {
        setIsPOModalOpen(false);
        setPoNotes('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleApprovePO(poId: number, reviewer?: string) {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          poId,
          reviewer: reviewer || reviewerName,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (previewPO && previewPO.id === poId) {
          setPreviewPO(updated);
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRejectPO(poId: number, reason: string) {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          poId,
          reason,
          reviewer: reviewerName,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRejectingPO(null);
        setRejectionReasonInput('');
        if (previewPO && previewPO.id === poId) {
          setPreviewPO(updated);
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTransmitPO(poId: number) {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transmit', poId }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (previewPO && previewPO.id === poId) {
          setPreviewPO(updated);
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleReceivePO(poId: number) {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive', poId }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (previewPO && previewPO.id === poId) {
          setPreviewPO(updated);
        }
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    const newSup: Supplier = {
      id: suppliers.length + 1,
      code: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      name: supName,
      contactPerson: supContact,
      email: supEmail,
      phone: '+91 (080) 2839-4411',
      address: 'Phase II Industrial Area, Bengaluru, Karnataka',
      paymentTerms: supTerms,
      rating: 5,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setSuppliers([newSup, ...suppliers]);
    setIsSupplierModalOpen(false);
    setSupName('');
    setSupContact('');
    setSupEmail('');
  }

  // Filter logic
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.itemsJson.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalSpend = purchaseOrders
    .filter((po) => po.status !== 'Rejected' && po.status !== 'Cancelled')
    .reduce((sum, po) => sum + Number(po.totalAmount), 0);

  const pendingReviewOrders = purchaseOrders.filter((po) => po.status === 'Pending Review');
  const pendingReviewAmount = pendingReviewOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);

  const approvedOrInTransit = purchaseOrders.filter(
    (po) => po.status === 'Approved' || po.status === 'Ordered' || po.status === 'Partially Received'
  ).length;

  const receivedCount = purchaseOrders.filter((po) => po.status === 'Received').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Purchasing & Procurement
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              ATB Software Supply Chain
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supplier directory, Purchase Orders (PO), approval & rejection review workflows, and inventory replenishment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Building className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>

          <button
            onClick={() => setIsPOModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Request</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Authorized Procurement Spend</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total active & completed purchase contracts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Review & Approval</span>
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-2">
            {pendingReviewOrders.length} Orders
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">
            ₹{pendingReviewAmount.toLocaleString('en-IN')} awaiting manager sign-off
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Approved / In Transit</span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {approvedOrInTransit} Orders
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Cleared for vendor dispatch & logistics</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Received & Stocked</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {receivedCount} Fulfilled
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Inventory replenished & verified</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap pb-px">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Purchase Orders</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {purchaseOrders.length}
          </span>
          {pendingReviewOrders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
              {pendingReviewOrders.length} review required
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'suppliers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Approved Suppliers</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {suppliers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PO #, supplier, or product..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
              {['All', 'Pending Review', 'Approved', 'Ordered', 'Received', 'Rejected'].map((status) => {
                const count =
                  status === 'All'
                    ? purchaseOrders.length
                    : purchaseOrders.filter((po) => po.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === status
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* PO Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">PO Number</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Issue Date</th>
                    <th className="py-3 px-4 font-semibold">Line Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold">Review / Audit Trail</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No purchase orders matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          <button
                            onClick={() => setPreviewPO(po)}
                            className="hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>{po.poNumber}</span>
                            <Eye className="w-3 h-3 opacity-60" />
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{po.supplierName}</div>
                          <div className="text-[10px] text-slate-400">Supplier ID: #{po.supplierId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>{new Date(po.orderDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">
                            Due: {new Date(po.expectedDelivery).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {po.itemsJson.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ₹{po.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              po.status === 'Pending Review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                                : po.status === 'Approved'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : po.status === 'Ordered'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                : po.status === 'Received'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {po.status === 'Pending Review' && <Clock className="w-3 h-3" />}
                            {po.status === 'Approved' && <ShieldCheck className="w-3 h-3" />}
                            {po.status === 'Ordered' && <Truck className="w-3 h-3" />}
                            {po.status === 'Received' && <PackageCheck className="w-3 h-3" />}
                            {po.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                            <span>{po.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          {po.status === 'Pending Review' && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Needs executive authorization</span>
                            </span>
                          )}
                          {po.status === 'Approved' && (
                            <div className="text-indigo-700 dark:text-indigo-400">
                              <span className="font-semibold">✓ {po.approvedBy?.split('(')[0] || 'Approved'}</span>
                              <div className="text-[10px] text-slate-400">
                                {po.approvedAt ? new Date(po.approvedAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                          )}
                          {po.status === 'Rejected' && (
                            <div className="text-rose-600 dark:text-rose-400 max-w-xs">
                              <span className="font-semibold">✕ {po.approvedBy?.split('(')[0] || 'Rejected'}</span>
                              <p className="text-[10px] text-rose-500/90 truncate" title={po.rejectionReason}>
                                {po.rejectionReason}
                              </p>
                            </div>
                          )}
                          {po.status === 'Ordered' && (
                            <span className="text-sky-600 dark:text-sky-400 font-medium">
                              Dispatched to vendor
                            </span>
                          )}
                          {po.status === 'Received' && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Replenished in inventory</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Actions for Pending Review */}
                            {po.status === 'Pending Review' && (
                              <>
                                <button
                                  onClick={() => setPreviewPO(po)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                                  title="Review full PO details"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleApprovePO(po.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                                  title="Approve Purchase Order"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingPO(po);
                                    setRejectionReasonInput('');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[11px] font-semibold transition-colors"
                                  title="Reject Purchase Order"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* Actions for Approved PO: Transmit to Supplier */}
                            {po.status === 'Approved' && (
                              <button
                                onClick={() => handleTransmitPO(po.id)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
                                title="Transmit official PO to supplier"
                              >
                                <Send className="w-3 h-3" />
                                <span>Transmit PO</span>
                              </button>
                            )}

                            {/* Actions for Ordered PO: Receive Goods */}
                            {po.status === 'Ordered' && (
                              <button
                                onClick={() => handleReceivePO(po.id)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
                                title="Confirm receipt of physical goods and update inventory"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Receive Goods</span>
                              </button>
                            )}

                            {/* Actions for Received PO */}
                            {po.status === 'Received' && (
                              <button
                                onClick={() => setPreviewPO(po)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View PO & Receiving Record"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}

                            {/* Actions for Rejected PO */}
                            {po.status === 'Rejected' && (
                              <button
                                onClick={() => setPreviewPO(po)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Rejection Details"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {sup.code}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {sup.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: {sup.contactPerson}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{sup.rating}.0</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment Terms: {sup.paymentTerms}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Location: {sup.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Create Purchase Request (Issue PO) */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title="Create Purchase Request / PO"
        description="Initiate a procurement contract with an approved supplier. Requires managerial review."
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-bold">Workflow Notice:</span> Newly initiated purchase orders will enter{' '}
            <span className="font-semibold underline">Pending Review</span> status for Supply Chain / Financial authorization before transmission to vendors.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Approved Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.paymentTerms})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item to Reorder / Replenish
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Unit Cost: ₹{p.costPrice})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Procurement Justification & Instructions
            </label>
            <textarea
              rows={2}
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              placeholder="e.g. Critical stock replenishments for Q2 production. Ensure inspection test certificates are included."
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPOModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs shadow-blue-500/20"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Approved Supplier */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Add Approved Supplier"
        description="Register a new component vendor and agreed payment terms."
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Supplier Company Name
            </label>
            <input
              type="text"
              required
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              placeholder="e.g. Sundaram Industrial Hardware Pvt Ltd"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Representative
              </label>
              <input
                type="text"
                required
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                placeholder="e.g. Rakesh Sundaram"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Email
              </label>
              <input
                type="email"
                required
                value={supEmail}
                onChange={(e) => setSupEmail(e.target.value)}
                placeholder="e.g. orders@sundaram-industrial.com"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Terms
            </label>
            <select
              value={supTerms}
              onChange={(e) => setSupTerms(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="Net 15">Net 15 days</option>
              <option value="Net 30">Net 30 days</option>
              <option value="Net 45">Net 45 days</option>
              <option value="Net 60">Net 60 days</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Reject Purchase Order Reason */}
      <Modal
        isOpen={Boolean(rejectingPO)}
        onClose={() => setRejectingPO(null)}
        title="Reject Purchase Order"
        description="Provide a justification for rejecting this procurement request."
      >
        {rejectingPO && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              You are rejecting purchase order <span className="font-bold">{rejectingPO.poNumber}</span> for{' '}
              <span className="font-semibold">{rejectingPO.supplierName}</span> (₹{rejectingPO.totalAmount.toLocaleString('en-IN')}).
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Reviewer
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Budget exceeded for Q1 hardware procurement; volume discount must be negotiated before re-submission."
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingPO(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectPO(rejectingPO.id, rejectionReasonInput)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: PO Review & Printable Document Preview */}
      <Modal
        isOpen={Boolean(previewPO)}
        onClose={() => setPreviewPO(null)}
        title="Purchase Order Review & Official Document"
        description="Formal enterprise purchase order specification and authorization status."
      >
        {previewPO && (
          <div className="space-y-6">
            {/* Action Bar inside Review Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    previewPO.status === 'Pending Review'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : previewPO.status === 'Approved'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : previewPO.status === 'Ordered'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : previewPO.status === 'Received'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {previewPO.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PO</span>
                </button>

                {previewPO.status === 'Pending Review' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprovePO(previewPO.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve PO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingPO(previewPO);
                        setRejectionReasonInput('');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject PO</span>
                    </button>
                  </>
                )}

                {previewPO.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={() => handleTransmitPO(previewPO.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit to Vendor</span>
                  </button>
                )}

                {previewPO.status === 'Ordered' && (
                  <button
                    type="button"
                    onClick={() => handleReceivePO(previewPO.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Receive Goods</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Sheet */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                      A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      ATB Software Solutions
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Procurement & Supply Chain Operations
                  </p>
                  <p className="text-[11px] text-slate-400">
                    CIN: ATB-REG-2026-99 | GSTIN: 29AABCU9603R1Z7
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Electronics City, Phase 1, Hosur Road, Bengaluru, Karnataka 560100
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">
                    PURCHASE ORDER
                  </span>
                  <div className="font-mono text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {previewPO.poNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {new Date(previewPO.orderDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    Expected: {new Date(previewPO.expectedDelivery).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Vendor & Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vendor / Supplier</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {previewPO.supplierName}
                  </p>
                  <p className="text-slate-500">Approved Vendor ID: #{previewPO.supplierId}</p>
                  <p className="text-slate-500">Logistics Destination: ATB Central Warehouse Bangalore</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Payment & Delivery Terms</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Standard Commercial Net 30
                  </p>
                  <p className="text-slate-500">Freight: Free on Board (FOB) Destination</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-2">Item Description</th>
                      <th className="py-2">SKU</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {previewPO.itemsJson.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-medium">{item.quantity}</td>
                        <td className="py-2.5 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total & Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 dark:border-slate-800 gap-4">
                <div className="text-xs text-slate-500 max-w-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Procurement Notes:</span>
                  <p className="mt-0.5">{previewPO.notes || 'No specific notes recorded for this purchase order.'}</p>
                </div>

                <div className="w-full sm:w-60 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{previewPO.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Shipping & Duty:</span>
                    <span>₹0.00 (Included)</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">
                      ₹{previewPO.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Approval & Audit Sign-Off Box */}
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Executive Authorization</span>
                    {previewPO.status === 'Approved' || previewPO.status === 'Ordered' || previewPO.status === 'Received' ? (
                      <div className="mt-1">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Digitally Approved & Signed by {previewPO.approvedBy}</span>
                        </div>
                        {previewPO.approvedAt && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Timestamp: {new Date(previewPO.approvedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : previewPO.status === 'Rejected' ? (
                      <div className="mt-1">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Rejected by {previewPO.approvedBy}</span>
                        </div>
                        <p className="text-xs text-rose-600 mt-1 font-medium">
                          Reason: {previewPO.rejectionReason}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Status: Pending Supply Chain Review & Approval</span>
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Requires verification of budgetary allotment and unit quotation terms.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 sm:text-right font-mono">
                    <div>Authorized Entity: ATB Software Solutions</div>
                    <div>Digital Trace ID: ATB-PO-{previewPO.id}-SEC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
