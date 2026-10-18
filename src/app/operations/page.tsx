'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Modal } from '@/components/ui/modal';
import {
  Cog,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Calendar,
  User,
  Sliders,
} from 'lucide-react';
import { WorkOrder } from '@/lib/mock-data';

export default function OperationsPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Work Order Form
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('Apex HyperCluster Server Node X9');
  const [quantity, setQuantity] = useState('10');
  const [priority, setPriority] = useState<WorkOrder['priority']>('High');
  const [assignedTo, setAssignedTo] = useState('Hardware Test Lab Team');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  async function loadWorkOrders() {
    try {
      const res = await fetch('/api/sales'); // or initial state
      // Provide work orders
      const list: WorkOrder[] = [
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
      setWorkOrders(list);
    } catch (e) {
      console.error(e);
    }
  }

  function handleCreateWorkOrder(e: React.FormEvent) {
    e.preventDefault();
    const newWO: WorkOrder = {
      id: workOrders.length + 1,
      orderNumber: `WO-2026-${String(workOrders.length + 304).padStart(4, '0')}`,
      title,
      productName,
      quantity: Number(quantity),
      priority,
      status: 'Pending',
      assignedTo,
      progress: 0,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setWorkOrders([newWO, ...workOrders]);
    setIsModalOpen(false);
    setTitle('');
  }

  function handleUpdateStatus(orderId: number, newStatus: WorkOrder['status']) {
    setWorkOrders(
      workOrders.map((wo) =>
        wo.id === orderId
          ? {
              ...wo,
              status: newStatus,
              progress: newStatus === 'Completed' ? 100 : newStatus === 'Pending' ? 10 : wo.progress,
            }
          : wo
      )
    );
  }

  const columns: Array<{ title: string; status: WorkOrder['status']; color: string }> = [
    { title: 'Queue / Pending', status: 'Pending', color: 'border-slate-300 dark:border-slate-700' },
    { title: 'In Production', status: 'In Progress', color: 'border-blue-500' },
    { title: 'QA & Testing', status: 'Quality Review', color: 'border-amber-500' },
    { title: 'Completed', status: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manufacturing & Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Work order assembly pipelines, quality assurance milestones, and engineering resource allocation
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const itemsInCol = workOrders.filter((w) => w.status === col.status);
          return (
            <div
              key={col.status}
              className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${col.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {col.title}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {itemsInCol.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
                {itemsInCol.map((wo) => (
                  <div
                    key={wo.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                        {wo.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          wo.priority === 'Urgent'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                            : wo.priority === 'High'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {wo.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {wo.quantity}x {wo.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wo.assignedTo}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>Assembly Progress</span>
                        <span>{wo.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${wo.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stage Shift Action */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Move state:</span>
                      <select
                        value={wo.status}
                        onChange={(e) =>
                          handleUpdateStatus(wo.id, e.target.value as WorkOrder['status'])
                        }
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-0.5 font-semibold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Quality Review">QA Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {itemsInCol.length === 0 && (
                  <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                    No orders in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: New Work Order */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Manufacturing Work Order"
        description="Allocate technical staff and queue precision hardware manufacturing."
      >
        <form onSubmit={handleCreateWorkOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Order Objective
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Precision CNC Milling of 20x Chassis Brackets"
              className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Product
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Units to Produce
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkOrder['priority'])}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Engineer / Team
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Queue Order
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

