/** @jest-environment node */
import { validateEnv, MissingEnvironmentVariablesError, REQUIRED_ENV_VARS, OPTIONAL_ENV_DEFAULTS } from "@/server/lib/env"

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env = { ...originalEnv }
  for (const { name } of REQUIRED_ENV_VARS) {
    process.env[name] = "present"
  }
  for (const [name, value] of Object.entries(OPTIONAL_ENV_DEFAULTS)) {
    process.env[name] = value
  }
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe("validateEnv", () => {
  it("does not throw when all required variables are present", () => {
    expect(() => validateEnv()).not.toThrow()
  })

  it("throws MissingEnvironmentVariablesError naming each missing variable and its feature", () => {
    delete process.env.TYPESAFE_API_KEY
    delete process.env.LINKEDIN_CLIENT_SECRET
    let caught: unknown
    try {
      validateEnv()
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(MissingEnvironmentVariablesError)
    const message = (caught as Error).message
    expect(message).toContain("TYPESAFE_API_KEY")
    expect(message).toContain("TypeSafe / Jev (prompt assist)")
    expect(message).toContain("LINKEDIN_CLIENT_SECRET")
    expect(message).toContain("LinkedIn Profile data source")
  })

  it("treats an empty value as missing", () => {
    process.env.OPENAI_API_KEY = ""
    expect(() => validateEnv()).toThrow(MissingEnvironmentVariablesError)
  })

  it("leaves optional variables unaffected", () => {
    for (const name of Object.keys(OPTIONAL_ENV_DEFAULTS)) {
      delete process.env[name]
    }
    expect(() => validateEnv()).not.toThrow()
  })

  it("accepts a custom process env", () => {
    const env: NodeJS.ProcessEnv = { ...process.env }
    delete env.TYPESAFE_API_KEY
    expect(() => validateEnv(env)).toThrow(MissingEnvironmentVariablesError)
  })
})
