import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function intersperseAndAppend<T, U>(originalArray: T[], itemToInsert: U): (T | U)[] {
  if (originalArray.length === 0) {
    return []
  }
  const result: (T | U)[] = originalArray.flatMap((element) => [itemToInsert, element])
  result.push(itemToInsert)
  return result
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PRIVATE_IP_RANGES = [
  { start: ipToNumber("10.0.0.0"), end: ipToNumber("10.255.255.255") },
  { start: ipToNumber("172.16.0.0"), end: ipToNumber("172.31.255.255") },
  { start: ipToNumber("192.168.0.0"), end: ipToNumber("192.168.255.255") },
  { start: ipToNumber("127.0.0.0"), end: ipToNumber("127.255.255.255") },
  { start: ipToNumber("169.254.0.0"), end: ipToNumber("169.254.255.255") },
]

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"])

function ipToNumber(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0
}

function isPrivateIPv4(hostname: string): boolean {
  const ipMatch = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)
  if (!ipMatch) return false
  const ipNum = ipToNumber(hostname)
  return PRIVATE_IP_RANGES.some((range) => ipNum >= range.start && ipNum <= range.end)
}

function isPrivateIPv6(hostname: string): boolean {
  if (hostname === "::1") return true
  if (hostname.startsWith("fe80:")) return true
  if (hostname.startsWith("fc00:") || hostname.startsWith("fd00:")) return true
  return false
}

function normalizeHostname(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname
}

export function validateUrlForSsrf(url: string): { valid: boolean; error?: string } {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" }
  }

  const hostname = normalizeHostname(parsedUrl.hostname)

  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    return { valid: false, error: "Access to localhost is not allowed" }
  }

  if (isPrivateIPv4(hostname)) {
    return { valid: false, error: "Access to private IP ranges is not allowed" }
  }

  if (isPrivateIPv6(hostname)) {
    return { valid: false, error: "Access to private IPv6 ranges is not allowed" }
  }

  return { valid: true }
}
