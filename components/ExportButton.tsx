"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { transactions } from "@/lib/db";
import { getMonthRange, formatCurrency, formatDate } from "@/lib/utils";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Transaction } from "@/types";

interface ExportButtonProps {
  transactions: Transaction[];
  month: string;
}

export function ExportButton({ transactions: txs, month }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const summarizeByCategory = (type: "income" | "expense") => {
    const typeTxs = txs.filter((t) => t.type === type);
    const typeTotal = typeTxs.reduce((s, t) => s + t.amount, 0);

    const byCategory = new Map<string, { name: string; color: string; total: number }>();
    typeTxs.forEach((t) => {
      const key = t.category?.name ?? "Sin categoría";
      const existing = byCategory.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        byCategory.set(key, {
          name: key,
          color: t.category?.color ?? "#6b7280",
          total: t.amount,
        });
      }
    });

    return Array.from(byCategory.values())
      .map((c) => ({
        ...c,
        percentage: typeTotal > 0 ? (c.total / typeTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    const n = parseInt(clean, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  const polarToXY = (
    cx: number,
    cy: number,
    r: number,
    angleDeg: number,
  ): [number, number] => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const donutSlicePath = (
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    const [x1, y1] = polarToXY(cx, cy, rOuter, startAngle);
    const [x2, y2] = polarToXY(cx, cy, rOuter, endAngle);
    const [x3, y3] = polarToXY(cx, cy, rInner, endAngle);
    const [x4, y4] = polarToXY(cx, cy, rInner, startAngle);
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const drawDonutChart = (
    doc: jsPDF,
    summary: ReturnType<typeof summarizeByCategory>,
    startY: number,
  ): number => {
    if (summary.length === 0) return startY;

    const cx = 32;
    const cy = startY + 28;
    const rOuter = 20;
    const rInner = 12;
    const total = summary.reduce((s, c) => s + c.total, 0);
    let angle = 0;

    summary.forEach((c) => {
      const sweep = (c.total / total) * 360;
      const [r, g, b] = hexToRgb(c.color);
      doc.setFillColor(r, g, b);
      doc.path(
        donutSlicePath(cx, cy, rOuter, rInner, angle, angle + sweep) as unknown as any[],
        "FD",
      );
      angle += sweep;
    });

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`${total.toFixed(2)} €`, cx - 8, cy);
    doc.setTextColor(0, 0, 0);

    let ly = startY + 8;
    doc.setFontSize(9);
    summary.forEach((c) => {
      const [r, g, b] = hexToRgb(c.color);
      doc.setFillColor(r, g, b);
      doc.rect(58, ly - 3, 4, 4, "F");
      doc.text(
        `${c.name}: ${c.total.toFixed(2)} € (${c.percentage.toFixed(1)}%)`,
        65,
        ly,
      );
      ly += 6;
    });

    return Math.max(cy + rOuter, ly) + 8;
  };

  const exportCSV = () => {
    const data = txs.map((tx) => ({
      Fecha: formatDate(tx.date),
      Tipo: tx.type === "expense" ? "Gasto" : "Ingreso",
      Categoría: tx.category?.name ?? "",
      Descripción: tx.description,
      Monto: tx.amount.toFixed(2),
    }));

    const csv = "\uFEFF" + Papa.unparse(data, { delimiter: ";" });
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;header=present",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Resumen de Gastos", 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${month}`, 14, 30);

    const totalIncome = txs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    doc.setFontSize(10);
    doc.text(`Ingresos: ${formatCurrency(totalIncome)}`, 14, 38);
    doc.text(`Gastos: ${formatCurrency(totalExpense)}`, 14, 44);
    doc.text(`Balance: ${formatCurrency(totalIncome - totalExpense)}`, 14, 50);

    const expenseSummary = summarizeByCategory("expense");
    const incomeSummary = summarizeByCategory("income");

    let nextY = 56;

    if (expenseSummary.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Gastos por Categoría", 14, nextY + 4);
      doc.setFont("helvetica", "normal");
      nextY = drawDonutChart(doc, expenseSummary, nextY + 8) + 4;
    }

    if (incomeSummary.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ingresos por Categoría", 14, nextY + 4);
      doc.setFont("helvetica", "normal");
      nextY = drawDonutChart(doc, incomeSummary, nextY + 8) + 4;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle de Transacciones", 14, nextY + 4);
    doc.setFont("helvetica", "normal");

    const tableData = txs.map((tx) => [
      formatDate(tx.date),
      tx.type === "expense" ? "Gasto" : "Ingreso",
      tx.category?.name ?? "",
      tx.description ?? "",
      `${tx.type === "expense" ? "-" : "+"}${tx.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: nextY + 8,
      head: [["Fecha", "Tipo", "Categoría", "Descripción", "Monto"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`gastos-${month}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={exportCSV}
        disabled={exporting || txs.length === 0}
      >
        <FileSpreadsheet className="w-4 h-4" />
        CSV
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={exportPDF}
        disabled={exporting || txs.length === 0}
      >
        <FileText className="w-4 h-4" />
        PDF
      </Button>
    </div>
  );
}
