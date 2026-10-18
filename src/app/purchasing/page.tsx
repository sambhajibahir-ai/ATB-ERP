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
  Phone,
  Calendar,
  DollarSign,
  PackageCheck,
  Star,
  Clock,
} from 'lucide-react';
import { PurchaseOrder, Supplier, Product } from '@/lib/mock-data';

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

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
        loadData();
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
        loadData();
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
      phone: '+1 (555) 440-9988',
      address: 'Industrial Supply Corridor',
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

  const filteredOrders = purchaseOrders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Purchasing & Procurement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supplier contracts, Purchase Orders (PO), and automated inventory replenishment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'suppliers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Approved Suppliers ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO or supplier..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">PO Number</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Date Issued</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {po.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {po.itemsJson.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ${po.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'Received'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status !== 'Received' ? (
                          <button
                            onClick={() => handleReceivePO(po.id)}
                            className="flex items-center gap-1 ml-auto px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive Goods</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Stock Updated</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
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
                  <span>Terms: {sup.paymentTerms}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Issue Purchase Order */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title="Issue Purchase Order (PO)"
        description="Contract with approved supplier for parts replenishment."
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Supplier
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

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item to Reorder
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Cost: ${p.costPrice})
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
                required
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purchasing Notes & Instructions
            </label>
            <textarea
              rows={2}
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              placeholder="e.g. Ensure batch test inspection reports are enclosed."
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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Transmit Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Add Supplier */}
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
              placeholder="e.g. Precision Components Manufacturing"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Representative
              </label>
              <input
                type="text"
                required
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                placeholder="e.g. Kenji Tanaka"
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
                placeholder="e.g. orders@vendor.com"
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
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
    </DashboardLayout>
  );
}

