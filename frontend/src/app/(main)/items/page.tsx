'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Space, Input, message, Modal, Form, Select, Drawer, Descriptions, Table, Tag, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent } from 'ag-grid-community';
import { itemService } from '@/services/api';
import type { ItemDto, ItemDetailDto, CreateItemRequest } from '@/types';

// Register AG Grid community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const { Search } = Input;

/**
 * Master Item List page with AG Grid table, inline editing, and detail panel.
 * Supports: Create, Edit (inline), Sort, Filter, Detail view with supplier prices.
 */
export default function ItemsPage() {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<ItemDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();
  const gridRef = useRef<AgGridReact>(null);

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await itemService.getAll(1, 100, search || undefined);
      if (response.success) {
        setItems(response.data.items);
      }
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle inline editing - save changes immediately to backend
  const onCellValueChanged = useCallback(async (event: CellValueChangedEvent<ItemDto>) => {
    const { data } = event;
    if (!data) return;

    try {
      await itemService.update(data.id, {
        itemName: data.itemName,
        description: data.description || undefined,
        unit: data.unit,
        status: data.status,
        rowVersion: data.rowVersion,
      });
      message.success('Item updated successfully');
      fetchItems(); // Refresh to get new rowVersion
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to update item');
      fetchItems(); // Revert on failure
    }
  }, [fetchItems]);

  // View item detail with supplier prices
  const viewDetail = useCallback(async (itemId: string) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await itemService.getDetail(itemId);
      if (response.success) {
        setSelectedItemDetail(response.data);
      }
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || 'Failed to fetch item detail');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Delete item
  const handleDelete = useCallback(async (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this item?',
      onOk: async () => {
        try {
          await itemService.delete(id);
          message.success('Item deleted successfully');
          fetchItems();
        } catch (error: unknown) {
          const err = error as Error;
          message.error(err.message || 'Failed to delete item');
        }
      },
    });
  }, [fetchItems]);

  // Create new item
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const request: CreateItemRequest = {
        itemCode: values.itemCode,
        itemName: values.itemName,
        description: values.description,
        unit: values.unit,
      };
      await itemService.create(request);
      message.success('Item created successfully');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchItems();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return; // Form validation error
      const err = error as Error;
      message.error(err.message || 'Failed to create item');
    }
  };

  // AG Grid column definitions with inline editing
  const columnDefs: ColDef<ItemDto>[] = [
    {
      field: 'itemCode',
      headerName: 'Item Code',
      width: 130,
      filter: 'agTextColumnFilter',
      sortable: true,
      pinned: 'left',
    },
    {
      field: 'itemName',
      headerName: 'Item Name',
      flex: 1,
      minWidth: 200,
      editable: true,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      editable: true,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'unit',
      headerName: 'Unit',
      width: 100,
      editable: true,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Active', 'Inactive'] },
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: { value: string }) => {
        const color = params.value === 'Active' ? 'green' : 'red';
        return <Tag color={color}>{params.value}</Tag>;
      },
    },
    {
      headerName: 'Actions',
      width: 130,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ItemDto }) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewDetail(params.data.id)}
            title="View Detail"
          />
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(params.data.id)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // Supplier prices table columns for the detail drawer
  const supplierPriceColumns = [
    { title: 'Supplier Code', dataIndex: 'supplierCode', key: 'supplierCode', width: 130 },
    { title: 'Supplier Name', dataIndex: 'supplierName', key: 'supplierName' },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => val?.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      align: 'right' as const,
    },
    { title: 'Currency', dataIndex: 'currency', key: 'currency', width: 100 },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '-',
    },
    { title: 'Remark', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <div>
      {/* Toolbar */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} size="middle">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add Item
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchItems}>Refresh</Button>
        </Space>
        <Search
          placeholder="Search items..."
          allowClear
          style={{ width: 300 }}
          onSearch={(val) => setSearch(val)}
          onChange={(e) => !e.target.value && setSearch('')}
        />
      </Space>

      {/* AG Grid Table */}
      <div style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={items}
          columnDefs={columnDefs}
          loading={loading}
          defaultColDef={{
            resizable: true,
            floatingFilter: true,
          }}
          getRowId={(params) => params.data.id}
          onCellValueChanged={onCellValueChanged}
          animateRows
          pagination
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowSelection="single"
          theme="legacy"
        />
      </div>

      {/* Create Item Modal */}
      <Modal
        title="Create New Item"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }}
        okText="Create"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="itemCode" label="Item Code" rules={[{ required: true, message: 'Item code is required' }]}>
            <Input placeholder="e.g., ITM-001" />
          </Form.Item>
          <Form.Item name="itemName" label="Item Name" rules={[{ required: true, message: 'Item name is required' }]}>
            <Input placeholder="e.g., Steel Bolt M10" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true, message: 'Unit is required' }]}>
            <Select placeholder="Select unit">
              <Select.Option value="PCS">PCS (Pieces)</Select.Option>
              <Select.Option value="KG">KG (Kilogram)</Select.Option>
              <Select.Option value="SET">SET</Select.Option>
              <Select.Option value="BOX">BOX</Select.Option>
              <Select.Option value="M">M (Meter)</Select.Option>
              <Select.Option value="L">L (Liter)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Item Detail Drawer with Supplier Prices */}
      <Drawer
        title={selectedItemDetail ? `Item Detail: ${selectedItemDetail.itemCode}` : 'Item Detail'}
        open={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedItemDetail(null); }}
        width={720}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
        ) : selectedItemDetail ? (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Item Code">{selectedItemDetail.itemCode}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedItemDetail.status === 'Active' ? 'green' : 'red'}>
                  {selectedItemDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Item Name" span={2}>{selectedItemDetail.itemName}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedItemDetail.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Unit">{selectedItemDetail.unit}</Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedItemDetail.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginBottom: 12 }}>
              Supplier Prices ({selectedItemDetail.supplierPrices.length})
            </h3>
            <Table
              dataSource={selectedItemDetail.supplierPrices}
              columns={supplierPriceColumns}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: 'No supplier prices linked to this item.' }}
            />
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
