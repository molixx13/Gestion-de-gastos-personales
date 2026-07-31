"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, LogOut, Download, Trash2, Info } from "lucide-react";

function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const exportAllData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: txs } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .order("date", { ascending: false });

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), transactions: txs, categories: cats },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis-gastos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-4 pb-4">
        <h1 className="text-xl font-bold">Ajustes</h1>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mi Cuenta</p>
              <p className="text-xs text-gray-500">
                Datos sincronizados en la nube
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Datos</h2>

          <button
            onClick={exportAllData}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">Exportar datos</p>
              <p className="text-xs text-gray-500">
                Descarga copia de seguridad JSON
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm("¿Borrar todos los datos? Esta acción no se puede deshacer.")) {
                // TODO: implement batch delete
              }
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-red-600">Borrar datos</p>
              <p className="text-xs text-gray-500">
                Elimina todas tus transacciones
              </p>
            </div>
          </button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Acerca de</h2>
          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mis Gastos v1.0.0</p>
              <p className="text-xs text-gray-500">
                App de seguimiento de gastos personales
              </p>
            </div>
          </div>
        </Card>

        <Button
          variant="danger"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
        </Button>
      </div>

      <BottomNav />
    </>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  );
}
