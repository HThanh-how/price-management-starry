import React, { useState, useCallback } from 'react';
import { message, Modal, Form } from 'antd';
import { type CellValueChangedEvent } from 'ag-grid-community';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { itemService } from '@/services/api';
import type { ItemDto, CreateItemRequest } from '@/types';
import { ItemGrid } from './ItemGrid';
import { CreateItemModal } from './CreateItemModal';

export function ItemsFeature() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  // ========== React Query: Items List ==========
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await itemService.getAll(1, 100);
      if (response.success) return response.data.items;
      throw new Error(response.message);
    },
  });
  const items = itemsData ?? [];

  // ========== Mutations ==========
  const createMutation = useMutation({
    mutationFn: (request: CreateItemRequest) => itemService.create(request),
    onSuccess: () => {
      message.success('Item created successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: (error: Error) => message.error(error.message || 'Failed to create item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof itemService.update>[1] }) =>
      itemService.update(id, data),
    onSuccess: () => {
      message.success('Item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Failed to update item');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemService.delete(id),
    onSuccess: () => {
      message.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: Error) => message.error(error.message || 'Failed to delete item'),
  });

  // ========== Handlers ==========
  const onCellValueChanged = useCallback((event: CellValueChangedEvent<ItemDto>) => {
    const { data } = event;
    if (!data) return;
    updateMutation.mutate({
      id: data.id,
      data: {
        itemName: data.itemName,
        description: data.description || undefined,
        unit: data.unit,
        category: data.category || undefined,
        status: data.status,
        rowVersion: data.rowVersion,
      },
    });
  }, [updateMutation]);

  const handleViewDetail = useCallback((id: string) => {
    router.push(`/items/${id}`);
  }, [router]);

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this item?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        itemCode: values.itemCode,
        itemName: values.itemName,
        description: values.description,
        unit: values.unit,
        category: values.category,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-end bg-surface-container-lowest p-md rounded-lg border border-surface-container-high">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-xs">Master Item List</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage inventory items, specifications, and linked supplier pricing.</p>
        </div>
        <div className="flex gap-sm">
          <button
            className="px-4 py-2 border border-outline-variant rounded text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md flex items-center gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['items'] })}
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          <button
            className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-on-primary-fixed-variant transition-colors font-label-md text-label-md flex items-center gap-2 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Item
          </button>
        </div>
      </div>

      {/* Grid — click tên Item sẽ navigate sang /items/[id] */}
      <div className="flex-1 flex gap-gutter overflow-hidden h-[calc(100vh-180px)]">
        <ItemGrid
          items={items}
          isLoading={isLoading}
          onCellValueChanged={onCellValueChanged}
          onViewDetail={handleViewDetail}
          onDelete={handleDelete}
        />
      </div>

      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreate}
        form={form}
        isPending={createMutation.isPending}
      />
    </>
  );
}
