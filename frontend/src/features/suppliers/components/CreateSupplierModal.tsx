'use client';

import React from 'react';
import { Modal, Form, Input } from 'antd';
import type { FormInstance } from 'antd';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: FormInstance;
  isPending: boolean;
}

/**
 * Reusable modal for creating a new Supplier.
 * Uses Ant Design Form for validation (consistent with Items module pattern).
 */
export function CreateSupplierModal({ isOpen, onClose, onSubmit, form, isPending }: CreateSupplierModalProps) {
  return (
    <Modal
      title="Create New Supplier"
      open={isOpen}
      onOk={onSubmit}
      onCancel={onClose}
      okText="Create"
      confirmLoading={isPending}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="supplierCode"
          label="Supplier Code"
          rules={[{ required: true, message: 'Supplier code is required' }]}
        >
          <Input placeholder="e.g., VNSUP-001" />
        </Form.Item>
        <Form.Item
          name="supplierName"
          label="Supplier Name"
          rules={[{ required: true, message: 'Supplier name is required' }]}
        >
          <Input placeholder="e.g., Mekong Delta Plastics JSC" />
        </Form.Item>
        <Form.Item name="contactPerson" label="Contact Person">
          <Input placeholder="e.g., Nguyen Van A" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Invalid email' }]}
        >
          <Input placeholder="e.g., contact@company.vn" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input placeholder="e.g., +84 28 3822 1234" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} placeholder="e.g., 123 Le Loi St, Dist 1, HCMC" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
