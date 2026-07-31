"use client";

import { useState, useCallback } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { transactions as txDb } from "@/lib/db";
import { format } from "@/lib/utils";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Transaction } from "@/types";

function TransactionsPage() {
  const { transactions: txs, loading, monthRange, setMonthRange, refetch } = useTransactions();
  const { categories } = useCategories();
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const currentMonth = new Date(monthRange.start);
  const monthLabel = format(currentMonth, "MMMM yyyy");

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setMonthRange({ start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(), end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString() });
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    const now = new Date();
    if (d > now) return;
    setMonthRange({ start: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(), end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString() });
  };

  const filtered = txs.filter(
    (tx) =>
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("¿Eliminar esta transacción?")) {
      await txDb.remove(id);
      refetch();
    }
  }, [refetch]);

  const handleEdit = useCallback((tx: Transaction) => {
    setEditTx(tx);
    setShowForm(true);
  }, []);

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Transacciones</h1>
          <button
            onClick={() => {
              setEditTx(null);
              setShowForm(true);
            }}
            className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-500"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <TransactionList
            transactions={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTx(null); }}
        title={editTx ? "Editar Transacción" : "Nueva Transacción"}
      >
        <TransactionForm
          categories={categories}
          initialData={editTx ?? undefined}
          onSuccess={() => { setShowForm(false); setEditTx(null); refetch(); }}
          onCancel={() => { setShowForm(false); setEditTx(null); }}
        />
      </Modal>

      <BottomNav />
    </>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <TransactionsPage />
    </AuthGuard>
  );
}
