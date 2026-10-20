import "server-only"

export class MissingEnvironmentVariablesError extends Error {
  constructor(missing: ReadonlyArray<{ readonly name: string; readonly feature: string }>) {
    const lines = missing.map(({ name, feature }) => `  - ${name} (${feature})`)
    super(`Missing required environment variables:\n${lines.join("\n")}\n\nSet these variables before starting the server.`)
    this.name = "MissingEnvironmentVariablesError"
  }
}

type RequiredEnvVar = Readonly<{ readonly name: string; readonly feature: string }>

export const REQUIRED_ENV_VARS: ReadonlyArray<RequiredEnvVar> = Object.freeze([
  { name: "TYPESAFE_API_KEY", feature: "TypeSafe / Jev (prompt assist)" },
  { name: "OPENAI_API_KEY", feature: "OpenAI (prompt assist)" },
  { name: "LINKEDIN_CLIENT_ID", feature: "LinkedIn Profile data source" },
  { name: "LINKEDIN_CLIENT_SECRET", feature: "LinkedIn Profile data source" },
  { name: "LINKEDIN_REDIRECT_URI", feature: "LinkedIn Profile data source" },
  { name: "LINKEDIN_SESSION_ENCRYPTION_KEY", feature: "LinkedIn session encryption" },
])

export const OPTIONAL_ENV_DEFAULTS: Readonly<Record<string, string>> = Object.freeze({
  TYPESAFE_BASE_URL: "https://api.typesafe.ai",
  TYPESAFE_MODEL: "jev-latest",
  OPENAI_MODEL: "gpt-5-nano",
  PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE: "20",
  PROMPT_ASSIST_REFINE_RATE_LIMIT_PER_MINUTE: "60",
  TYPESAFE_CALLS_PER_MINUTE: "120",
  OPENAI_CALLS_PER_MINUTE: "120",
})

export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const missing = REQUIRED_ENV_VARS.filter(({ name }) => {
    const value = env[name]
    return value === undefined || value.trim() === ""
  })
  if (missing.length > 0) {
    throw new MissingEnvironmentVariablesError(missing)
  }
}
