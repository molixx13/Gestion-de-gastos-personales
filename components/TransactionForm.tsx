"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { transactions } from "@/lib/db";
import type { Category, Transaction } from "@/types";

interface TransactionFormProps {
  categories: Category[];
  initialData?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  categories,
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type ?? "expense",
  );
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [date, setDate] = useState(initialData?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!categoryId || !amount) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("El monto debe ser un número válido mayor a 0");
      return;
    }

    setSaving(true);

    try {
      if (initialData) {
        await transactions.update(initialData.id, {
          type,
          category_id: categoryId,
          amount: parsedAmount,
          description,
          date,
        });
      } else {
        await transactions.create({
          type,
          category_id: categoryId,
          amount: parsedAmount,
          description,
          date,
        });
      }
      onSuccess();
    } catch {
      setError("Error al guardar la transacción");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategoryId("");
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategoryId("");
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          Ingreso
        </button>
      </div>

      <Select
        id="category"
        label="Categoría"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Seleccionar categoría</option>
        {filteredCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </Select>

      <Input
        id="amount"
        label="Monto"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Input
        id="description"
        label="Descripción"
        placeholder="Opcional"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Input
        id="date"
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
