"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/TransactionForm";
import { useCategories } from "@/hooks/useCategories";
import { ArrowLeft } from "lucide-react";

function NewTransactionPage() {
  const { categories } = useCategories();
  const router = useRouter();

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
          <h1 className="text-xl font-bold">Nueva Transacción</h1>
        </div>

        <Card>
          <TransactionForm
            categories={categories}
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
      <NewTransactionPage />
    </AuthGuard>
  );
}
