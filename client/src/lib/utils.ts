import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ar-SA");
}

export function getFormattedDate(date: Date | null = new Date()): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export const FIELD_TYPES = [
  { value: "text", label: "نص" },
  { value: "number", label: "رقمي" },
  { value: "date", label: "تاريخ" },
  { value: "select", label: "اختيار من قائمة" },
  { value: "file", label: "رفع ملف" },
  { value: "client", label: "ربط بالعميل" }
];

export const CLIENT_FIELDS = [
  { value: "name", label: "اسم العميل" },
  { value: "idNumber", label: "رقم الهوية" },
  { value: "mobile", label: "رقم الجوال" },
  { value: "idExpiry", label: "تاريخ انتهاء الهوية" }
];

export const QUESTION_TYPES = [
  { value: "yesno", label: "نعم/لا" },
  { value: "multiple", label: "اختيار من متعدد" },
  { value: "text", label: "نص حر" }
];
