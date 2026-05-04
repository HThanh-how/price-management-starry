'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Space, message, Modal, Form, Select, InputNumber, DatePicker, Input, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import dayjs from 'dayjs';
import { priceService, itemService, supplierService } from '@/services/api';
import type { PriceDto, CreatePriceRequest, ItemDto, SupplierDto } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

const currencies = ['USD', 'VND', 'EUR', 'JPY', 'CNY', 'KRW', 'THB'];

/**
 * Price Management page for assigning prices to Item + Supplier combinations.
 * Supports: Create, Edit (inline), Sort, Filter.
 */
export default function PricesPage() {
  const [prices, setPrices] = useState<PriceDto[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const gridRef = useRef<AgGridReact>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await priceService.getAll(1, 100);
      if (response.success) {
        setPrices(response.data.items);
      }
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch items and suppliers for the create form dropdowns
  const fetchDropdownData = useCallback(async () => {
    try {
      const [itemRes, supplierRes] = await Promise.all([
        itemService.getAll(1, 100),
        supplierService.getAll(1, 100),
      ]);
      if (itemRes.success) setItems(itemRes.data.items);
      if (supplierRes.success) setSuppliers(supplierRes.data.items);
    } catch {
      // Silently fail - dropdowns will be empty
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchDropdownData();
  }, [fetchPrices, fetchDropdownData]);

  // Inline edit handler
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent<PriceDto>) => {
    const { data, colDef } = event;
    if (!data) return;

    try {
      await priceService.update(data.id, {
        price: data.price,
        currency: data.currency,
        effectiveDate: data.effectiveDate,
        remark: data.remark || undefined,
        rowVersion: data.rowVersion,
      });
      message.success(`Price ${colDef.field} updated successfully`);
      fetchPrices();
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to update price');
      fetchPrices();
    }
  }, [fetchPrices]);

  const handleDelete = useCallback(async (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this price record?',
      onOk: async () => {
        try {
          await priceService.delete(id);
          message.success('Price record deleted successfully');
          fetchPrices();
        } catch (error: unknown) {
          const err = error as Error;
          message.error(err.message || 'Failed to delete price');
        }
      },
    });
  }, [fetchPrices]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const request: CreatePriceRequest = {
        itemId: values.itemId,
        supplierId: values.supplierId,
        price: values.price,
        currency: values.currency,
        effectiveDate: values.effectiveDate.toISOString(),
        remark: values.remark,
      };
      await priceService.create(request);
      message.success('Price record created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchPrices();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      const err = error as Error;
      message.error(err.message || 'Failed to create price record');
    }
  };

  const columnDefs: ColDef<PriceDto>[] = [
    { field: 'itemCode', headerName: 'Item Code', width: 130, filter: 'agTextColumnFilter', sortable: true },
    { field: 'itemName', headerName: 'Item Name', width: 180, filter: 'agTextColumnFilter', sortable: true },
    { field: 'supplierCode', headerName: 'Supplier Code', width: 140, filter: 'agTextColumnFilter', sortable: true },
    { field: 'supplierName', headerName: 'Supplier Name', width: 180, filter: 'agTextColumnFilter', sortable: true },
    {
      field: 'price', headerName: 'Price', width: 140, editable: true, sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value?.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'currency', headerName: 'Currency', width: 110, editable: true,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: currencies },
      filter: 'agTextColumnFilter', sortable: true,
      cellRenderer: (params: { value: string }) => <Tag color="blue">{params.value}</Tag>,
    },
    {
      field: 'effectiveDate', headerName: 'Effective Date', width: 150, sortable: true,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    { field: 'remark', headerName: 'Remark', flex: 1, minWidth: 150, editable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Actions', width: 80, pinned: 'right', sortable: false, filter: false,
      cellRenderer: (params: { data: PriceDto }) => (
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
            Add New Price
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchPrices}>Refresh</Button>
        </Space>
        <span style={{ color: '#888' }}>Total: {prices.length} records</span>
      </Space>

      <div style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={prices}
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

      <Modal title="Add New Price" open={isCreateModalOpen} onOk={handleCreate}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }} okText="Create" width={600}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}
          initialValues={{ currency: 'USD', effectiveDate: dayjs() }}>
          <Form.Item name="itemId" label="Item" rules={[{ required: true, message: 'Please select an item' }]}>
            <Select placeholder="Select item" showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={items.map(i => ({ value: i.id, label: `${i.itemCode} - ${i.itemName}` }))} />
          </Form.Item>
          <Form.Item name="supplierId" label="Supplier" rules={[{ required: true, message: 'Please select a supplier' }]}>
            <Select placeholder="Select supplier" showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={suppliers.map(s => ({ value: s.id, label: `${s.supplierCode} - ${s.supplierName}` }))} />
          </Form.Item>
          <Space size="middle" style={{ width: '100%' }}>
            <Form.Item name="price" label="Price" rules={[{ required: true }, { type: 'number', min: 0.01 }]}
              style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} min={0.01} precision={4} placeholder="0.0000" />
            </Form.Item>
            <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                {currencies.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="effectiveDate" label="Effective Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={2} placeholder="Optional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
