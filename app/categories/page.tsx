"use client";

import { useState, useCallback } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCategories } from "@/hooks/useCategories";
import { categories as catDb } from "@/lib/db";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types";

const ICON_OPTIONS = ["🍔", "🛒", "🏠", "🚗", "🎮", "👕", "📱", "💊", "✈️", "🎓", "💼", "🎵", "🐱", "🎁", "⚡", "💧", "🔥", "⭐"];
const COLOR_OPTIONS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1",
];

function CategoriesPage() {
  const { categories: cats, loading, refetch } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍔");
  const [color, setColor] = useState("#3b82f6");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openCreate = () => {
    setEditCat(null);
    setName("");
    setIcon("🍔");
    setColor("#3b82f6");
    setType("expense");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setType(cat.type);
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setFormError("");
    try {
      if (editCat) {
        await catDb.update(editCat.id, { name: name.trim(), icon, color, type });
      } else {
        await catDb.create({ name: name.trim(), icon, color, type });
      }
      setShowForm(false);
      refetch();
    } catch (err: any) {
      setFormError(err.message || "Error al guardar la categoría");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("¿Eliminar esta categoría?")) {
      await catDb.remove(id);
      refetch();
    }
  }, [refetch]);

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Categorías</h1>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setType("expense")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              type === "expense"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Gastos
          </button>
          <button
            onClick={() => setType("income")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              type === "income"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            Ingresos
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {cats
              .filter((c) => c.type === type)
              .map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    {cat.icon}
                  </div>
                  <span className="flex-1 font-medium text-sm">{cat.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editCat ? "Editar Categoría" : "Nueva Categoría"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="cat-name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Comida"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Icono</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${
                    icon === ic
                      ? "bg-primary-100 ring-2 ring-primary-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === col ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {!editCat && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  type === "expense"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  type === "income"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Ingreso
              </button>
            </div>
          )}

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()} className="flex-1">
              {saving ? "Guardando..." : editCat ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      <BottomNav />
    </>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <CategoriesPage />
    </AuthGuard>
  );
}
