import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export { generateId, intersperseAndAppend } from "@/shared/lib/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
