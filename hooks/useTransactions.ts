"use client";

import { useState, useEffect, useCallback } from "react";
import { transactions } from "@/lib/db";
import { getMonthRange } from "@/lib/utils";
import type { Transaction, MonthlySummary } from "@/types";

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthRange, setMonthRange] = useState(() => getMonthRange());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await transactions.list(monthRange.start, monthRange.end);
    setData(result);
    setLoading(false);
  }, [monthRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions: data, loading, monthRange, setMonthRange, refetch: fetchData };
}

export function useMonthlySummary() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthRange, setMonthRange] = useState(() => getMonthRange());

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const result = await transactions.getMonthlySummary(monthRange.start, monthRange.end);
    setSummary(result);
    setLoading(false);
  }, [monthRange]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, monthRange, setMonthRange, refetch: fetchSummary };
}
