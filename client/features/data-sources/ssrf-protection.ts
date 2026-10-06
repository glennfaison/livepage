export class SSRFError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SSRFError"
  }
}

const PRIVATE_IP_RANGES = [
  { start: ipToNumber("127.0.0.0"), end: ipToNumber("127.255.255.255") },
  { start: ipToNumber("10.0.0.0"), end: ipToNumber("10.255.255.255") },
  { start: ipToNumber("172.16.0.0"), end: ipToNumber("172.31.255.255") },
  { start: ipToNumber("192.168.0.0"), end: ipToNumber("192.168.255.255") },
  { start: ipToNumber("169.254.0.0"), end: ipToNumber("169.254.255.255") },
  { start: ipToNumber("::1"), end: ipToNumber("::1") },
  { start: ipToNumber("fe80::"), end: ipToNumber("febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff") },
  { start: ipToNumber("fc00::"), end: ipToNumber("fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff") },
]

function ipToNumber(ip: string): bigint {
  if (ip.includes(":")) {
    return ipv6ToNumber(ip)
  }
  return ipv4ToNumber(ip)
}

function ipv4ToNumber(ip: string): bigint {
  const parts = ip.split(".").map(Number)
  return (
    (BigInt(parts[0]) << BigInt(24)) |
    (BigInt(parts[1]) << BigInt(16)) |
    (BigInt(parts[2]) << BigInt(8)) |
    BigInt(parts[3])
  )
}

function ipv6ToNumber(ip: string): bigint {
  const expanded = expandIPv6(ip)
  const parts = expanded.split(":").map((part) => BigInt(`0x${part}`))
  let result = BigInt(0)
  for (const part of parts) {
    result = (result << BigInt(16)) | part
  }
  return result
}

function expandIPv6(ip: string): string {
  if (ip.includes("::")) {
    const [left, right] = ip.split("::")
    const leftParts = left ? left.split(":") : []
    const rightParts = right ? right.split(":") : []
    const missing = 8 - leftParts.length - rightParts.length
    const middle = Array(missing).fill("0000")
    return [...leftParts, ...middle, ...rightParts].map((p) => p.padStart(4, "0")).join(":")
  }
  return ip.split(":").map((p) => p.padStart(4, "0")).join(":")
}

function isPrivateIP(hostname: string): boolean {
  let ip: string
  try {
    const url = new URL(`http://${hostname}`)
    ip = url.hostname
  } catch {
    return false
  }

  if (ip === "localhost" || ip === "localhost.localdomain") {
    return true
  }

  const ipNum = ipToNumber(ip)
  return PRIVATE_IP_RANGES.some((range) => ipNum >= range.start && ipNum <= range.end)
}

export function validateURL(url: string): void {
  let parsedURL: URL
  try {
    parsedURL = new URL(url)
  } catch {
    throw new SSRFError("Invalid URL format")
  }

  if (!["http:", "https:"].includes(parsedURL.protocol)) {
    throw new SSRFError("Only HTTP and HTTPS protocols are allowed")
  }

  if (isPrivateIP(parsedURL.hostname)) {
    throw new SSRFError("Access to private IP addresses is not allowed")
  }

  if (parsedURL.hostname === "localhost" || parsedURL.hostname.endsWith(".localhost")) {
    throw new SSRFError("Access to localhost is not allowed")
  }

  const blockedTLDs = [".local", ".internal", ".corp", ".home", ".lan"]
  if (blockedTLDs.some((tld) => parsedURL.hostname.endsWith(tld))) {
    throw new SSRFError("Access to internal network domains is not allowed")
  }
}

export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  validateURL(url)
  return fetch(url, options)
}