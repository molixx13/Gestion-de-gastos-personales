declare module "@supabase/ssr" {
  import { SupabaseClient, Session, User } from "@supabase/supabase-js";

  interface CookieOptions {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }

  export function createBrowserClient(
    url: string,
    anonKey: string,
  ): SupabaseClient;

  export function createServerClient(
    url: string,
    anonKey: string,
    options: {
      cookies: {
        getAll: () => { name: string; value: string }[];
        setAll: (cookies: CookieOptions[]) => void;
      };
    },
  ): SupabaseClient;
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

declare module "jspdf-autotable" {
  import jsPDF from "jspdf";

  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body: (string | number)[][];
    styles?: Record<string, unknown>;
    headStyles?: Record<string, unknown>;
  }

  export function autoTable(
    doc: jsPDF,
    options: AutoTableOptions,
  ): void;
}
