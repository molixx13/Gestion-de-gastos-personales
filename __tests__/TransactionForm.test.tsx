import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "@/components/TransactionForm";
import type { Category } from "@/types";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }),
}));

const mockCategories: Category[] = [
  {
    id: "1",
    user_id: "u1",
    name: "Comida",
    icon: "🍔",
    color: "#ef4444",
    type: "expense",
    created_at: "2024-01-01",
  },
  {
    id: "2",
    user_id: "u1",
    name: "Salario",
    icon: "💼",
    color: "#22c55e",
    type: "income",
    created_at: "2024-01-01",
  },
];

describe("TransactionForm", () => {
  it("renders form fields", () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Gasto")).toBeInTheDocument();
    expect(screen.getByText("Ingreso")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto")).toBeInTheDocument();
  });

  it("shows expense categories by default", () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const select = screen.getByLabelText("Categoría");
    expect(select).toBeInTheDocument();
  });

  it("calls onCancel when cancel button clicked", async () => {
    const onCancel = vi.fn();
    render(
      <TransactionForm
        categories={mockCategories}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows error when submitting empty form", async () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Guardar"));
    expect(screen.getByText("Completa todos los campos obligatorios")).toBeInTheDocument();
  });
});
