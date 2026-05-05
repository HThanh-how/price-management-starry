'use client';

import React, { useState } from 'react';
import { Form } from 'antd';
import { useSupplierListQuery, useCreateSupplierMutation } from '@/features/suppliers/hooks/useSupplierQueries';
import { SupplierGrid } from '@/features/suppliers/components/SupplierGrid';
import { CreateSupplierModal } from '@/features/suppliers/components/CreateSupplierModal';

/**
 * Master Supplier List — Page Container.
 * Orchestrates data fetching, modal state, and child components.
 * All business logic is delegated to custom hooks.
 */
export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: suppliersData, isLoading } = useSupplierListQuery(search);
  const createMutation = useCreateSupplierMutation();

  const suppliers = suppliersData ?? [];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(
        {
          supplierCode: values.supplierCode,
          supplierName: values.supplierName,
          contactPerson: values.contactPerson,
          email: values.email,
          phone: values.phone,
          address: values.address,
        },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            form.resetFields();
          },
        },
      );
    } catch (error: unknown) {
      // Ant Design form validation error — user needs to fix fields
      if (error && typeof error === 'object' && 'errorFields' in error) return;
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      {/* Page Header — Figma design tokens */}
      <div className="flex justify-between items-end bg-surface-container-lowest p-md rounded-lg border border-surface-container-high">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-xs">Master Supplier List</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and update supplier details, contacts, and operational status.</p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-56 transition-colors"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md flex items-center gap-2 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Supplier
          </button>
        </div>
      </div>

      {/* AG Grid */}
      <SupplierGrid suppliers={suppliers} isLoading={isLoading} />

      {/* Create Modal */}
      <CreateSupplierModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreate}
        form={form}
        isPending={createMutation.isPending}
      />
    </>
  );
}
