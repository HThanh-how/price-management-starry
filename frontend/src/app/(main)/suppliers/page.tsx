'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Space, Input, message, Modal, Form, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import { supplierService } from '@/services/api';
import type { SupplierDto, CreateSupplierRequest } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

const { Search } = Input;

/**
 * Master Supplier List page with AG Grid table, inline editing.
 * Supports: Create, Edit (inline), Sort, Filter.
 */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const gridRef = useRef<AgGridReact>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await supplierService.getAll(1, 100, search || undefined);
      if (response.success) {
        setSuppliers(response.data.items);
      }
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Inline edit handler - saves to backend immediately
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent<SupplierDto>) => {
    const { data } = event;
    if (!data) return;

    try {
      await supplierService.update(data.id, {
        supplierName: data.supplierName,
        contactPerson: data.contactPerson || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        status: data.status,
        rowVersion: data.rowVersion,
      });
      message.success('Supplier updated successfully');
      fetchSuppliers();
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to update supplier');
      fetchSuppliers();
    }
  }, [fetchSuppliers]);

  const handleDelete = useCallback(async (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this supplier?',
      onOk: async () => {
        try {
          await supplierService.delete(id);
          message.success('Supplier deleted successfully');
          fetchSuppliers();
        } catch (error: unknown) {
          const err = error as Error;
          message.error(err.message || 'Failed to delete supplier');
        }
      },
    });
  }, [fetchSuppliers]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const request: CreateSupplierRequest = {
        supplierCode: values.supplierCode,
        supplierName: values.supplierName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };
      await supplierService.create(request);
      message.success('Supplier created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchSuppliers();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      const err = error as Error;
      message.error(err.message || 'Failed to create supplier');
    }
  };

  // AG Grid column definitions
  const columnDefs: ColDef<SupplierDto>[] = [
    { field: 'supplierCode', headerName: 'Supplier Code', width: 140, filter: 'agTextColumnFilter', sortable: true, pinned: 'left' },
    { field: 'supplierName', headerName: 'Supplier Name', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter', sortable: true },
    { field: 'contactPerson', headerName: 'Contact Person', width: 160, editable: true, filter: 'agTextColumnFilter' },
    { field: 'email', headerName: 'Email', width: 200, editable: true, filter: 'agTextColumnFilter' },
    { field: 'phone', headerName: 'Phone', width: 140, editable: true, filter: 'agTextColumnFilter' },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 200, editable: true, filter: 'agTextColumnFilter' },
    {
      field: 'status', headerName: 'Status', width: 120, editable: true,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Active', 'Inactive'] },
      filter: 'agTextColumnFilter', sortable: true,
      cellRenderer: (params: { value: string }) => {
        const color = params.value === 'Active' ? 'green' : 'red';
        return <Tag color={color}>{params.value}</Tag>;
      },
    },
    {
      headerName: 'Actions', width: 80, pinned: 'right', sortable: false, filter: false,
      cellRenderer: (params: { data: SupplierDto }) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />}
          onClick={() => handleDelete(params.data.id)} title="Delete" />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} size="middle">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add Supplier
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchSuppliers}>Refresh</Button>
        </Space>
        <Search placeholder="Search suppliers..." allowClear style={{ width: 300 }}
          onSearch={(val) => setSearch(val)} onChange={(e) => !e.target.value && setSearch('')} />
      </Space>

      <div style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={suppliers}
          columnDefs={columnDefs}
          loading={loading}
          defaultColDef={{ resizable: true, floatingFilter: true }}
          getRowId={(params) => params.data.id}
          onCellValueChanged={onCellValueChanged}
          animateRows
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          theme="legacy"
        />
      </div>

      <Modal title="Create New Supplier" open={isCreateModalOpen}
        onOk={handleCreate} onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }} okText="Create">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="supplierCode" label="Supplier Code" rules={[{ required: true }]}>
            <Input placeholder="e.g., SUP-001" />
          </Form.Item>
          <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Acme Corp" />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person">
            <Input placeholder="e.g., John Doe" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
            <Input placeholder="e.g., john@acme.com" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="e.g., +84 123 456 789" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} placeholder="e.g., 123 Main St, Ho Chi Minh City" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
