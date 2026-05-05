'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPriceSchema, type CreatePriceFormData, currencyValues } from '@/types/schemas';
import { usePriceDropdownQueries } from '../hooks/usePriceDropdownQueries';
import { useCreatePriceMutation } from '../hooks/useCreatePriceMutation';

export function PriceForm() {
  const { itemsQuery, suppliersQuery } = usePriceDropdownQueries();
  const createMutation = useCreatePriceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePriceFormData>({
    resolver: zodResolver(createPriceSchema),
    defaultValues: {
      itemId: '',
      supplierId: '',
      price: undefined,
      currency: 'USD',
      effectiveDate: new Date().toISOString().split('T')[0],
      remark: '',
    },
  });

  const items = itemsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];

  const onSubmit = (data: CreatePriceFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Item Select */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Select Item <span className="text-error">*</span></label>
          <div className="relative">
            <select
              className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.itemId ? 'border-error' : 'border-[#d9d9d9]'}`}
              {...register('itemId')}
              disabled={itemsQuery.isLoading}
            >
              <option value="">{itemsQuery.isLoading ? 'Loading...' : 'Select an item...'}</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.itemCode} — {item.itemName}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
          </div>
          {errors.itemId && <p className="text-error text-xs">{errors.itemId.message}</p>}
        </div>

        {/* Supplier Select */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Select Supplier <span className="text-error">*</span></label>
          <div className="relative">
            <select
              className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.supplierId ? 'border-error' : 'border-[#d9d9d9]'}`}
              {...register('supplierId')}
              disabled={suppliersQuery.isLoading}
            >
              <option value="">{suppliersQuery.isLoading ? 'Loading...' : 'Select a supplier...'}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.supplierCode} — {s.supplierName}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
          </div>
          {errors.supplierId && <p className="text-error text-xs">{errors.supplierId.message}</p>}
        </div>

        {/* Price + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Price <span className="text-error">*</span></label>
            <input
              type="number" step="0.01" placeholder="0.00"
              className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.price ? 'border-error' : 'border-[#d9d9d9]'}`}
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="text-error text-xs">{errors.price.message}</p>}
          </div>
          <div className="flex flex-col space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Currency <span className="text-error">*</span></label>
            <div className="relative">
              <select
                className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white ${errors.currency ? 'border-error' : 'border-[#d9d9d9]'}`}
                {...register('currency')}
              >
                {currencyValues.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
            </div>
            {errors.currency && <p className="text-error text-xs">{errors.currency.message}</p>}
          </div>
        </div>

        {/* Effective Date */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Effective Date <span className="text-error">*</span></label>
          <input
            type="date"
            className={`w-full border rounded px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white ${errors.effectiveDate ? 'border-error' : 'border-[#d9d9d9]'}`}
            {...register('effectiveDate')}
          />
          {errors.effectiveDate && <p className="text-error text-xs">{errors.effectiveDate.message}</p>}
        </div>

        {/* Remark */}
        <div className="flex flex-col space-y-1">
          <label className="font-label-md text-label-md text-on-surface">Remark</label>
          <textarea
            rows={3} placeholder="Enter any additional notes..."
            className="w-full border border-[#d9d9d9] rounded px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            {...register('remark')}
          />
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-1.5 border border-[#d9d9d9] rounded font-label-sm text-label-sm text-on-surface hover:border-primary hover:text-primary transition-colors bg-white"
            onClick={() => reset()}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-1.5 bg-primary text-white rounded font-label-sm text-label-sm hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
          >
            {createMutation.isPending ? (
              <><span className="material-symbols-outlined animate-spin mr-1 text-[16px]">sync</span> Submitting...</>
            ) : 'Submit Price'}
          </button>
        </div>
      </form>
    </div>
  );
}
