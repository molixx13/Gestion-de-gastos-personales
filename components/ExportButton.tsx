"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import html2canvas from "html2canvas";
import type { Transaction } from "@/types";

interface ExportButtonProps {
  transactions: Transaction[];
  month: string;
  expenseChartRef?: RefObject<HTMLDivElement>;
  incomeChartRef?: RefObject<HTMLDivElement>;
}

const PAGE_BOTTOM = 285;

export function ExportButton({
  transactions: txs,
  month,
  expenseChartRef,
  incomeChartRef,
}: ExportButtonProps) {
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

  const captureChart = async (
    doc: jsPDF,
    ref: RefObject<HTMLDivElement> | undefined,
    title: string,
    startY: number,
  ): Promise<number> => {
    if (!ref?.current) return startY;

    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, startY + 4);
    doc.setFont("helvetica", "normal");

    let y = startY + 8;
    if (y + imgHeight > PAGE_BOTTOM) {
      doc.addPage();
      y = 20;
    }

    doc.addImage(imgData, "PNG", 14, y, imgWidth, imgHeight);
    return y + imgHeight + 10;
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

  const exportPDF = async () => {
    setExporting(true);
    try {
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

      if (expenseSummary.length > 0 && expenseChartRef?.current) {
        nextY = await captureChart(doc, expenseChartRef, "Gastos por Categoría", nextY);
      }

      if (incomeSummary.length > 0 && incomeChartRef?.current) {
        nextY = await captureChart(doc, incomeChartRef, "Ingresos por Categoría", nextY);
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
    } finally {
      setExporting(false);
    }
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
