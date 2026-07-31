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

    const byCategory = new Map<string, number>();
    typeTxs.forEach((t) => {
      const key = t.category?.name ?? "Sin categoría";
      byCategory.set(key, (byCategory.get(key) ?? 0) + t.amount);
    });

    return Array.from(byCategory.entries())
      .map(([name, total]) => ({
        name,
        total,
        percentage: typeTotal > 0 ? (total / typeTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
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
      autoTable(doc, {
        startY: nextY + 8,
        head: [["Categoría", "Monto", "Porcentaje"]],
        body: expenseSummary.map((c) => [
          c.name,
          formatCurrency(c.total),
          `${c.percentage.toFixed(1)}%`,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] },
      });
      nextY = (doc.lastAutoTable?.finalY ?? nextY) + 14;
    }

    if (incomeSummary.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ingresos por Categoría", 14, nextY + 4);
      doc.setFont("helvetica", "normal");
      autoTable(doc, {
        startY: nextY + 8,
        head: [["Categoría", "Monto", "Porcentaje"]],
        body: incomeSummary.map((c) => [
          c.name,
          formatCurrency(c.total),
          `${c.percentage.toFixed(1)}%`,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 163, 74] },
      });
      nextY = (doc.lastAutoTable?.finalY ?? nextY) + 14;
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
