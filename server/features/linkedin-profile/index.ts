import "server-only"
import {
  createAuthorizationUrl,
  encryptLinkedInProfile,
  exchangeAuthorizationCode,
  fetchLinkedInUserInfo,
  getLinkedInConfig,
  normalizeLinkedInUserInfo,
  type LinkedInProfile,
} from "./oauth"

export {
  LINKEDIN_SESSION_COOKIE,
  LINKEDIN_STATE_COOKIE,
  LinkedInOAuthError,
  createOAuthState,
  decryptLinkedInProfile,
  encryptLinkedInProfile,
  exchangeAuthorizationCode,
  fetchLinkedInUserInfo,
  getLinkedInConfig,
  linkedInSessionLifetimeSeconds,
  normalizeLinkedInUserInfo,
  stateMatches,
  type LinkedInProfile,
} from "./oauth"

export function buildLinkedInAuthorizationUrl(state: string): URL {
  return createAuthorizationUrl(state, getLinkedInConfig())
}

export async function completeLinkedInAuthorization(code: string): Promise<{
  profile: LinkedInProfile
  sessionCookie: string
}> {
  const config = getLinkedInConfig()
  const token = await exchangeAuthorizationCode(code, fetch, config)
  const profile = normalizeLinkedInUserInfo(await fetchLinkedInUserInfo(token))
  return { profile, sessionCookie: encryptLinkedInProfile(profile, config) }
}
