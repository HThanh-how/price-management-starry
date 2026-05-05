import React from 'react';
import { Modal, Form, Select, Input, type FormInstance } from 'antd';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: FormInstance;
  isPending: boolean;
}

export function CreateItemModal({ isOpen, onClose, onSubmit, form, isPending }: CreateItemModalProps) {
  return (
    <Modal
      title="Create New Item"
      open={isOpen}
      onOk={onSubmit}
      onCancel={onClose}
      okText="Create"
      confirmLoading={isPending}
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
        <Form.Item name="category" label="Category">
          <Select placeholder="Select category" allowClear>
            <Select.Option value="Raw Materials">Raw Materials</Select.Option>
            <Select.Option value="Components">Components</Select.Option>
            <Select.Option value="Metals">Metals</Select.Option>
            <Select.Option value="Electronics">Electronics</Select.Option>
            <Select.Option value="Packaging">Packaging</Select.Option>
            <Select.Option value="Chemicals">Chemicals</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="unit" label="Unit" rules={[{ required: true, message: 'Unit is required' }]}>
          <Select placeholder="Select unit">
            <Select.Option value="PCS">PCS (Pieces)</Select.Option>
            <Select.Option value="KG">KG (Kilogram)</Select.Option>
            <Select.Option value="SET">SET</Select.Option>
            <Select.Option value="BOX">BOX</Select.Option>
            <Select.Option value="TON">TON</Select.Option>
            <Select.Option value="M">M (Meter)</Select.Option>
            <Select.Option value="L">L (Liter)</Select.Option>
            <Select.Option value="SPOOL">SPOOL</Select.Option>
            <Select.Option value="SHEET">SHEET</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
