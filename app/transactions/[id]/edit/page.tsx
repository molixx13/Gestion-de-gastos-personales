"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/TransactionForm";
import { useCategories } from "@/hooks/useCategories";
import { transactions as txDb } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import type { Transaction } from "@/types";

function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const { categories } = useCategories();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    txDb.getById(id).then(setTx);
  }, [id]);

  if (!tx) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Editar Transacción</h1>
        </div>

        <Card>
          <TransactionForm
            categories={categories}
            initialData={tx}
            onSuccess={() => router.push("/")}
            onCancel={() => router.back()}
          />
        </Card>
      </div>

      <BottomNav />
    </>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <EditTransactionPage />
    </AuthGuard>
  );
}
