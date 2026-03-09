/**
 * Format a bigint or number as Costa Rican colones
 */
export function formatColones(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return `₡${num.toLocaleString("es-CR")}`;
}

/**
 * Format invoice ID as HV-XXX
 */
export function formatInvoiceId(id: bigint | number): string {
  const num = typeof id === "bigint" ? Number(id) : id;
  return `HV-${String(num).padStart(3, "0")}`;
}

/**
 * Format date in Spanish (Costa Rica)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format date short
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format today in Spanish
 */
export function formatTodaySpanish(): string {
  return new Date().toLocaleDateString("es-CR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * WhatsApp share helper
 */
export function shareViaWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/**
 * Get date N days from now as YYYY-MM-DD
 */
export function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Calculate next date given last date and frequency
 */
export function calculateNextDate(
  lastDate: string,
  frequencyDays: number,
): string {
  try {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + frequencyDays);
    return date.toISOString().split("T")[0];
  } catch {
    return addDaysToToday(frequencyDays);
  }
}
