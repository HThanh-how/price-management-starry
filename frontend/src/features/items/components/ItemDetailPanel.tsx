import React from 'react';
import type { ItemDetailDto } from '@/types';

interface ItemDetailPanelProps {
  itemDetail: ItemDetailDto | null | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function ItemDetailPanel({ itemDetail, isLoading, onClose }: ItemDetailPanelProps) {
  return (
    <div className="w-[400px] bg-surface-container-lowest border border-surface-container-high rounded-lg flex flex-col overflow-hidden shadow-[0_6px_16px_0_rgba(0,0,0,0.08)]">
      {/* Panel Header */}
      <div className="p-md border-b border-surface-container-high bg-surface-bright flex justify-between items-start">
        <div>
          {itemDetail && (
            <>
              <div className="font-mono-data text-primary text-[11px] mb-1">{itemDetail.itemCode}</div>
              <h3 className="font-h5 text-h5 text-on-surface">{itemDetail.itemName}</h3>
            </>
          )}
          {isLoading && <div className="text-sm text-on-surface-variant">Loading...</div>}
        </div>
        <button className="text-on-surface-variant hover:text-on-surface" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Panel Content */}
      {itemDetail && !isLoading && (
        <>
          <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
            {/* Specs */}
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-on-surface-variant">Base Unit:</div>
              <div className="text-on-surface font-medium">{itemDetail.unit}</div>
              <div className="text-on-surface-variant">Status:</div>
              <div className="text-on-surface font-medium">{itemDetail.status}</div>
              <div className="text-on-surface-variant">Description:</div>
              <div className="text-on-surface font-medium">{itemDetail.description || '-'}</div>
              <div className="text-on-surface-variant">Last Updated:</div>
              <div className="text-on-surface font-medium">
                {itemDetail.updatedAt
                  ? new Date(itemDetail.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date(itemDetail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <hr className="border-surface-container-high" />

            {/* Supplier Pricing Sub-Table */}
            <div>
              <div className="flex justify-between items-center mb-sm">
                <h4 className="font-label-md text-label-md text-on-surface font-semibold">Linked Suppliers &amp; Prices</h4>
                <span className="text-on-surface-variant text-xs">{itemDetail.supplierPrices.length} supplier(s)</span>
              </div>
              <div className="border border-surface-container-high rounded overflow-hidden">
                {/* Sub-table header */}
                <div className="grid grid-cols-12 p-2 bg-surface-container-low border-b border-surface-container-high text-[11px] font-medium text-on-surface-variant uppercase">
                  <div className="col-span-5">Supplier</div>
                  <div className="col-span-4 text-right">Current Price</div>
                  <div className="col-span-3 text-center">Currency</div>
                </div>
                {itemDetail.supplierPrices.length === 0 ? (
                  <div className="p-4 text-center text-sm text-on-surface-variant">No supplier prices linked.</div>
                ) : (
                  itemDetail.supplierPrices.map((sp) => (
                    <div key={sp.id} className="grid grid-cols-12 p-2 border-b border-surface-container-high text-xs items-center hover:bg-surface-container-low last:border-b-0">
                      <div className="col-span-5 truncate text-on-surface font-medium">{sp.supplierName}</div>
                      <div className="col-span-4 text-right font-mono-data">${sp.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="col-span-3 text-center text-on-surface-variant">{sp.currency}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-md border-t border-surface-container-high bg-surface-bright flex gap-sm justify-end">
            <button className="px-3 py-1.5 border border-outline-variant rounded text-on-surface text-sm hover:bg-surface-container-low" onClick={onClose}>
              Close
            </button>
            <button className="px-3 py-1.5 bg-primary text-on-primary rounded text-sm hover:bg-on-primary-fixed-variant">
              Edit Item
            </button>
          </div>
        </>
      )}
    </div>
  );
}
