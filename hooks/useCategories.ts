"use client";

import { useState, useEffect, useCallback } from "react";
import { categories } from "@/lib/db";
import type { Category } from "@/types";

export function useCategories(type?: "income" | "expense") {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await categories.list(type);
    setData(result);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { categories: data, loading, refetch: fetchData };
}
