import { format as dateFnsFormat, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export { dateFnsFormat as format };

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string): string {
  return dateFnsFormat(parseISO(date), "d MMM yyyy", { locale: es });
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString(),
  };
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}
