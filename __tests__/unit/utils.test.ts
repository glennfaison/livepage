import { cn, generateId, intersperseAndAppend, validateUrlForSsrf, debounceAsync } from "@/client/lib/utils"

describe("Utility Functions", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("class1", "class2", { class3: true, class4: false })
      expect(result).toContain("class1")
      expect(result).toContain("class2")
      expect(result).toContain("class3")
      expect(result).not.toContain("class4")
    })
  })

  describe("generateId function", () => {
    it("should generate a string ID", () => {
      const id = generateId()
      expect(typeof id).toBe("string")
      expect(id.length).toBeGreaterThan(0)
    })

    it("should generate unique IDs", () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe("intersperseAndAppend function", () => {
    it("should return empty array when input is empty", () => {
      const result = intersperseAndAppend([], "divider")
      expect(result).toEqual([])
    })

    it("should intersperse items correctly", () => {
      const result = intersperseAndAppend(["a", "b", "c"], "divider")
      expect(result).toEqual(["divider", "a", "divider", "b", "divider", "c", "divider"])
    })

    it("should work with single item", () => {
      const result = intersperseAndAppend(["a"], "divider")
      expect(result).toEqual(["divider", "a", "divider"])
    })
  })

  describe("validateUrlForSsrf function", () => {
    it("should allow valid HTTPS URLs", () => {
      const result = validateUrlForSsrf("https://api.example.com/data")
      expect(result.valid).toBe(true)
    })

    it("should allow valid HTTP URLs", () => {
      const result = validateUrlForSsrf("http://api.example.com/data")
      expect(result.valid).toBe(true)
    })

    it("should reject invalid URL format", () => {
      const result = validateUrlForSsrf("not-a-url")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Invalid URL format")
    })

    it("should reject non-HTTP/HTTPS protocols", () => {
      const result = validateUrlForSsrf("ftp://example.com/file")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Only HTTP and HTTPS protocols are allowed")
    })

    it("should reject localhost", () => {
      const result = validateUrlForSsrf("http://localhost:3000/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to localhost is not allowed")
    })

    it("should reject 127.0.0.1 loopback", () => {
      const result = validateUrlForSsrf("http://127.0.0.1:8080/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IP ranges is not allowed")
    })

    it("should reject 10.x.x.x private range", () => {
      const result = validateUrlForSsrf("http://10.0.0.1/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IP ranges is not allowed")
    })

    it("should reject 172.16.x.x - 172.31.x.x private range", () => {
      const result = validateUrlForSsrf("http://172.16.0.1/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IP ranges is not allowed")
    })

    it("should reject 192.168.x.x private range", () => {
      const result = validateUrlForSsrf("http://192.168.1.1/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IP ranges is not allowed")
    })

    it("should reject 169.254.x.x link-local range", () => {
      const result = validateUrlForSsrf("http://169.254.169.254/latest/meta-data")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IP ranges is not allowed")
    })

    it("should reject IPv6 loopback ::1", () => {
      const result = validateUrlForSsrf("http://[::1]:8080/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IPv6 ranges is not allowed")
    })

    it("should reject IPv6 link-local fe80::", () => {
      const result = validateUrlForSsrf("http://[fe80::1]:8080/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IPv6 ranges is not allowed")
    })

    it("should reject IPv6 ULA fc00::/7", () => {
      const result = validateUrlForSsrf("http://[fc00::1]:8080/api")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Access to private IPv6 ranges is not allowed")
    })

    it("should allow public IP addresses", () => {
      const result = validateUrlForSsrf("http://8.8.8.8/api")
      expect(result.valid).toBe(true)
    })

    it("should allow public hostnames", () => {
      const result = validateUrlForSsrf("https://example.com/api")
      expect(result.valid).toBe(true)
    })
  })

  describe("debounceAsync function", () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("should allow the first call immediately", async () => {
      const fn = jest.fn().mockResolvedValue("result")
      const debounced = debounceAsync(fn, 500)

      const promise = debounced("arg")
      expect(fn).toHaveBeenCalledTimes(1)
      await expect(promise).resolves.toBe("result")
    })

    it("should reject calls within the debounce window", async () => {
      const fn = jest.fn().mockResolvedValue("result")
      const debounced = debounceAsync(fn, 500)

      await debounced("first")

      const second = debounced("second")
      await expect(second).rejects.toThrow("Rate limited")
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should allow calls after the debounce window", async () => {
      const fn = jest.fn().mockResolvedValue("result")
      const debounced = debounceAsync(fn, 500)

      await debounced("first")

      jest.advanceTimersByTime(500)
      await debounced("second")

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it("should pass arguments through to the wrapped function", async () => {
      const fn = jest.fn().mockResolvedValue("result")
      const debounced = debounceAsync(fn, 500)

      await debounced({ key: "value" })
      expect(fn).toHaveBeenCalledWith({ key: "value" })
    })
  })
})
