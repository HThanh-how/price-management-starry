import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceForm } from '../components/PriceForm';

// Mock the SRP hooks
const mockMutate = vi.fn();

vi.mock('../hooks/usePriceDropdownQueries', () => ({
  usePriceDropdownQueries: vi.fn(() => ({
    itemsQuery: {
      data: [
        { id: 'item-1', itemCode: 'ITM-001', itemName: 'Widget A' },
        { id: 'item-2', itemCode: 'ITM-002', itemName: 'Widget B' },
      ],
      isLoading: false,
    },
    suppliersQuery: {
      data: [
        { id: 'sup-1', supplierCode: 'SUP-001', supplierName: 'Supplier X' },
      ],
      isLoading: false,
    },
  })),
}));

vi.mock('../hooks/useCreatePriceMutation', () => ({
  useCreatePriceMutation: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

// Import after mock so we can override per-test
import { usePriceDropdownQueries } from '../hooks/usePriceDropdownQueries';
import { useCreatePriceMutation } from '../hooks/useCreatePriceMutation';

describe('PriceForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset về trạng thái mặc định cho MỌI test — tránh mock leak
    vi.mocked(usePriceDropdownQueries).mockReturnValue({
      itemsQuery: {
        data: [
          { id: 'item-1', itemCode: 'ITM-001', itemName: 'Widget A' },
          { id: 'item-2', itemCode: 'ITM-002', itemName: 'Widget B' },
        ],
        isLoading: false,
      },
      suppliersQuery: {
        data: [
          { id: 'sup-1', supplierCode: 'SUP-001', supplierName: 'Supplier X' },
        ],
        isLoading: false,
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(useCreatePriceMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  // ----- Rendering -----

  it('should render all form fields and submit button', () => {
    render(<PriceForm />);

    expect(screen.getByText(/Select Item/)).toBeDefined();
    expect(screen.getByText(/Select Supplier/)).toBeDefined();
    expect(screen.getByText('Price')).toBeDefined();
    expect(screen.getByText('Currency')).toBeDefined();
    expect(screen.getByText(/Effective Date/)).toBeDefined();
    expect(screen.getByText('Remark')).toBeDefined();
    expect(screen.getByRole('button', { name: /Submit Price/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeDefined();
  });

  it('should populate item dropdown with fetched data', () => {
    render(<PriceForm />);

    const itemSelect = screen.getAllByRole('combobox')[0];
    expect(itemSelect.innerHTML).toContain('ITM-001');
    expect(itemSelect.innerHTML).toContain('Widget A');
    expect(itemSelect.innerHTML).toContain('ITM-002');
  });

  it('should populate supplier dropdown with fetched data', () => {
    render(<PriceForm />);

    const supplierSelect = screen.getAllByRole('combobox')[1];
    expect(supplierSelect.innerHTML).toContain('SUP-001');
    expect(supplierSelect.innerHTML).toContain('Supplier X');
  });

  // ----- Loading State -----

  it('should show loading text and disable selects when data is loading', () => {
    vi.mocked(usePriceDropdownQueries).mockReturnValue({
      itemsQuery: { data: [], isLoading: true },
      suppliersQuery: { data: [], isLoading: true },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<PriceForm />);

    const selects = screen.getAllByRole('combobox');
    expect(selects[0].innerHTML).toContain('Loading...');
    expect((selects[0] as HTMLSelectElement).disabled).toBe(true);
    expect(selects[1].innerHTML).toContain('Loading...');
    expect((selects[1] as HTMLSelectElement).disabled).toBe(true);
  });

  // ----- isPending State -----

  it('should disable submit button and show spinner when mutation is pending', () => {
    vi.mocked(useCreatePriceMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<PriceForm />);

    const submitButton = screen.getByRole('button', { name: /Submitting/i });
    expect(submitButton).toBeDefined();
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });

  // ----- Form Validation -----

  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<PriceForm />);

    const submitButton = screen.getByRole('button', { name: /Submit Price/i });
    await user.click(submitButton);

    // Zod validation messages should appear
    await waitFor(() => {
      expect(screen.getByText(/Please select an item/i)).toBeDefined();
    });
    await waitFor(() => {
      expect(screen.getByText(/Please select a supplier/i)).toBeDefined();
    });

    // Mutation should NOT be called
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
