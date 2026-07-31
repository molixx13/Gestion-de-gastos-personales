"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryChart } from "@/components/CategoryChart";
import { TransactionList } from "@/components/TransactionList";
import { ExportButton } from "@/components/ExportButton";
import { useMonthlySummary, useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency, format } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/TransactionForm";
import { transactions as txDb } from "@/lib/db";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { Transaction } from "@/types";

function HomePage() {
  const { summary, loading: summaryLoading, monthRange } = useMonthlySummary();
  const { transactions: txs, loading: txsLoading, refetch } = useTransactions();
  const { categories } = useCategories("expense");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);

  const currentMonth = format(new Date(monthRange.start), "MMMM yyyy");

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

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditTx(null);
    refetch();
  }, [refetch]);

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mis Gastos</h1>
            <p className="text-sm text-gray-500 capitalize">{currentMonth}</p>
          </div>
          <ExportButton transactions={txs} month={currentMonth} />
        </div>

        {summaryLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-20" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Ingresos</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </p>
            </Card>
            <Card className="text-center">
              <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Gastos</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(summary.totalExpense)}
              </p>
            </Card>
            <Card className="text-center">
              <Wallet className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Balance</p>
              <p
                className={`text-sm font-bold ${
                  summary.balance >= 0 ? "text-primary-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.balance)}
              </p>
            </Card>
          </div>
        ) : null}

        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Gastos por Categoría
          </h2>
          {summary && <CategoryChart data={summary.expenseCategories} />}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Ingresos por Categoría
          </h2>
          {summary && <CategoryChart data={summary.incomeCategories} />}
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Últimas Transacciones
          </h2>
          <button
            onClick={() => {
              setEditTx(null);
              setShowForm(true);
            }}
            className="text-sm text-primary-600 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {txsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <TransactionList
            transactions={txs.slice(0, 10)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTx(null);
        }}
        title={editTx ? "Editar Transacción" : "Nueva Transacción"}
      >
        <TransactionForm
          categories={categories}
          initialData={editTx ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditTx(null);
          }}
        />
      </Modal>

      <BottomNav />
    </>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
