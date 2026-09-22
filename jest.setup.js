"use client"

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
    }
  },
  usePathname() {
    return "/"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock window.URL.createObjectURL
if (typeof window !== "undefined") {
  window.URL.createObjectURL = jest.fn(() => "mock-url")
  window.URL.revokeObjectURL = jest.fn()
}

// jsdom doesn't implement crypto.randomUUID; polyfill it so components (like
// LivePageAIChat) that generate a session id on mount don't crash in tests.
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = /** @type {Crypto} */ ({})
}
if (typeof globalThis.crypto.randomUUID !== "function") {
  let counter = 0
  globalThis.crypto.randomUUID = () => {
    counter += 1
    return `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`
  }
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
