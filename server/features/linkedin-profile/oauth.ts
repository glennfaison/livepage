import "server-only"
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

const AUTHORIZATION_ENDPOINT = "https://www.linkedin.com/oauth/v2/authorization"
const TOKEN_ENDPOINT = "https://www.linkedin.com/oauth/v2/accessToken"
const USERINFO_ENDPOINT = "https://api.linkedin.com/v2/userinfo"
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60
const MAX_COOKIE_VALUE_LENGTH = 3500

export const LINKEDIN_STATE_COOKIE = "livepage-linkedin-oauth-state"
export const LINKEDIN_SESSION_COOKIE = "livepage-linkedin-profile"

export type LinkedInProfile = Readonly<{
  sub: string
  name: string
  given_name: string
  family_name: string
  givenName: string
  familyName: string
  picture: string
  photo: string
  profilePicture: string
  profilePhotoUrl: string
  email: string
  email_verified: boolean
  emailVerified: boolean
  locale: string
  headline: string
  summary: string
  positions: ReadonlyArray<never>
  education: ReadonlyArray<never>
  skills: ReadonlyArray<never>
}>

type LinkedInConfig = Readonly<{
  clientId: string
  clientSecret: string
  redirectUri: URL
  encryptionKey: Buffer
}>

export class LinkedInOAuthError extends Error {}

function decodeEncryptionKey(value: string | undefined): Buffer {
  if (!value) throw new LinkedInOAuthError("LinkedIn is not configured")
  const key = Buffer.from(value, "base64")
  if (key.length !== 32 || key.toString("base64") !== value) {
    throw new LinkedInOAuthError("LinkedIn is not configured")
  }
  return key
}

export function getLinkedInConfig(env: NodeJS.ProcessEnv = process.env): LinkedInConfig {
  const clientId = env.LINKEDIN_CLIENT_ID?.trim()
  const clientSecret = env.LINKEDIN_CLIENT_SECRET?.trim()
  const redirectValue = env.LINKEDIN_REDIRECT_URI?.trim()
  if (!clientId || !clientSecret || !redirectValue) {
    throw new LinkedInOAuthError("LinkedIn is not configured")
  }

  let redirectUri: URL
  try {
    redirectUri = new URL(redirectValue)
  } catch {
    throw new LinkedInOAuthError("LinkedIn is not configured")
  }

  const localDevelopmentHost = ["localhost", "127.0.0.1", "[::1]"].includes(redirectUri.hostname)
  const localHttpAllowed = env.NODE_ENV !== "production" && redirectUri.protocol === "http:" && localDevelopmentHost
  if (redirectUri.protocol !== "https:" && !localHttpAllowed) {
    throw new LinkedInOAuthError("LinkedIn is not configured")
  }
  if (
    redirectUri.username ||
    redirectUri.password ||
    redirectUri.pathname !== "/api/linkedin-profile/callback" ||
    redirectUri.search ||
    redirectUri.hash
  ) {
    throw new LinkedInOAuthError("LinkedIn is not configured")
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    encryptionKey: decodeEncryptionKey(env.LINKEDIN_SESSION_ENCRYPTION_KEY),
  }
}

export function createAuthorizationUrl(state: string, config = getLinkedInConfig()): URL {
  const authorizationUrl = new URL(AUTHORIZATION_ENDPOINT)
  authorizationUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri.toString(),
    scope: "openid profile email",
    state,
  }).toString()
  return authorizationUrl
}

export function createOAuthState(): string {
  return randomBytes(32).toString("base64url")
}

export function stateMatches(received: string, expected: string): boolean {
  const receivedBytes = Buffer.from(received)
  const expectedBytes = Buffer.from(expected)
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes)
}

export async function exchangeAuthorizationCode(
  code: string,
  fetcher: typeof fetch = fetch,
  config = getLinkedInConfig(),
): Promise<string> {
  const response = await fetcher(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri.toString(),
    }),
    redirect: "error",
    cache: "no-store",
  })
  if (!response.ok) throw new LinkedInOAuthError("LinkedIn authorization failed")
  const body: unknown = await response.json().catch(() => null)
  if (!body || typeof body !== "object" || !("access_token" in body) || typeof body.access_token !== "string") {
    throw new LinkedInOAuthError("LinkedIn authorization failed")
  }
  return body.access_token
}

export async function fetchLinkedInUserInfo(
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const response = await fetcher(USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${accessToken}` },
    redirect: "error",
    cache: "no-store",
  })
  if (!response.ok) throw new LinkedInOAuthError("LinkedIn profile could not be loaded")
  return response.json().catch(() => {
    throw new LinkedInOAuthError("LinkedIn profile could not be loaded")
  })
}

function claimString(claims: Record<string, unknown>, key: string): string {
  return typeof claims[key] === "string" ? (claims[key] as string).trim().slice(0, 1000) : ""
}

export function normalizeLinkedInUserInfo(value: unknown): LinkedInProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LinkedInOAuthError("LinkedIn profile could not be loaded")
  }
  const claims = value as Record<string, unknown>
  const subject = claimString(claims, "sub")
  if (!subject) throw new LinkedInOAuthError("LinkedIn profile could not be loaded")
  const pictureClaim = claimString(claims, "picture")
  let picture = ""
  try {
    const pictureUrl = new URL(pictureClaim)
    if (pictureUrl.protocol === "https:") picture = pictureUrl.toString()
  } catch {}

  const emailVerified = claims.email_verified === true
  const email = emailVerified ? claimString(claims, "email") : ""
  return {
    sub: subject,
    name: claimString(claims, "name"),
    given_name: claimString(claims, "given_name"),
    family_name: claimString(claims, "family_name"),
    givenName: claimString(claims, "given_name"),
    familyName: claimString(claims, "family_name"),
    picture,
    photo: picture,
    profilePicture: picture,
    profilePhotoUrl: picture,
    email,
    email_verified: emailVerified,
    emailVerified,
    locale: claimString(claims, "locale"),
    headline: "",
    summary: "",
    positions: [],
    education: [],
    skills: [],
  }
}

export function encryptLinkedInProfile(
  profile: LinkedInProfile,
  config = getLinkedInConfig(),
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", config.encryptionKey, iv)
  const plaintext = Buffer.from(JSON.stringify({
    expiresAt: nowSeconds + SESSION_LIFETIME_SECONDS,
    profile,
  }))
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const cookie = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url")
  if (cookie.length > MAX_COOKIE_VALUE_LENGTH) {
    throw new LinkedInOAuthError("LinkedIn profile could not be stored")
  }
  return cookie
}

export function decryptLinkedInProfile(
  value: string,
  config = getLinkedInConfig(),
  nowSeconds = Math.floor(Date.now() / 1000),
): LinkedInProfile | null {
  try {
    const encrypted = Buffer.from(value, "base64url")
    if (encrypted.length < 29 || encrypted.toString("base64url") !== value) return null
    const iv = encrypted.subarray(0, 12)
    const tag = encrypted.subarray(12, 28)
    const decipher = createDecipheriv("aes-256-gcm", config.encryptionKey, iv)
    decipher.setAuthTag(tag)
    const plaintext = Buffer.concat([decipher.update(encrypted.subarray(28)), decipher.final()])
    const session: unknown = JSON.parse(plaintext.toString("utf8"))
    if (!session || typeof session !== "object" || !("expiresAt" in session) || !("profile" in session)) return null
    if (typeof session.expiresAt !== "number" || session.expiresAt <= nowSeconds) return null
    return normalizeLinkedInUserInfo(session.profile)
  } catch {
    return null
  }
}

export function linkedInSessionLifetimeSeconds(): number {
  return SESSION_LIFETIME_SECONDS
}
