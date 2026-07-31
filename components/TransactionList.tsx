"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { ArrowDownRight, ArrowUpRight, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions: txs,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (txs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No hay transacciones</p>
        <p className="text-sm mt-1">Agrega tu primer gasto o ingreso</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {txs.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              tx.type === "expense"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {tx.type === "expense" ? (
              <ArrowDownRight className="w-5 h-5" />
            ) : (
              <ArrowUpRight className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {tx.description || tx.category?.name || "Sin categoría"}
            </p>
            <p className="text-xs text-gray-500">
              {tx.category?.name && tx.description
                ? `${tx.category.name} · ${formatDate(tx.date)}`
                : formatDate(tx.date)}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p
              className={`text-sm font-semibold ${
                tx.type === "expense" ? "text-red-600" : "text-green-600"
              }`}
            >
              {tx.type === "expense" ? "-" : "+"}
              {formatCurrency(tx.amount)}
            </p>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(tx)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(tx.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
