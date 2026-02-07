import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes?: number | null) {
  if (!minutes || Number.isNaN(minutes)) return ""
  const total = Math.max(0, Math.round(minutes))
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const mins = total % 60
  const hourLabel = hours === 1 ? "hr" : "hrs"
  if (mins === 0) return `${hours} ${hourLabel}`
  return `${hours} ${hourLabel} ${mins} min`
}
