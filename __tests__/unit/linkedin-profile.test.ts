/** @jest-environment node */
import { NextRequest } from "next/server"
import { GET as connectGet } from "@/app/api/linkedin-profile/connect/route"
import { GET as callbackGet } from "@/app/api/linkedin-profile/callback/route"
import { GET as profileGet } from "@/app/api/linkedin-profile/profile/route"
import { POST as disconnectPost } from "@/app/api/linkedin-profile/disconnect/route"
import {
  LINKEDIN_SESSION_COOKIE,
  LINKEDIN_STATE_COOKIE,
  normalizeLinkedInUserInfo,
} from "@/server/features/linkedin-profile"
import { getDataSourceInfo } from "@/client/features/data-sources"
import { replaceDataSourceComponentProperties } from "@/client/features/data-sources"

const originalEnv = { ...process.env }
const originalFetch = global.fetch
const clientSecret = "linkedin-client-secret"
const accessToken = "sensitive-access-token"
const userInfo = {
  sub: "profile-subject",
  name: "Ada Lovelace",
  given_name: "Ada",
  family_name: "Lovelace",
  picture: "https://media.licdn.com/profile.jpg",
  email: "ada@example.com",
  email_verified: true,
  locale: "en_US",
  headline: "must not be used as a headline claim",
  positions: [{ title: "Unsupported" }],
}

const mockResponse = (body: unknown, ok = true) => ({
  ok,
  status: ok ? 200 : 400,
  json: async () => body,
}) as Response

const callbackRequest = (query: string, state: string) =>
  new NextRequest(`http://localhost:3000/api/linkedin-profile/callback?${query}`, {
    headers: { cookie: `${LINKEDIN_STATE_COOKIE}=${state}` },
  })

beforeEach(() => {
  process.env.LINKEDIN_CLIENT_ID = "client-id"
  process.env.LINKEDIN_CLIENT_SECRET = clientSecret
  process.env.LINKEDIN_REDIRECT_URI = "http://localhost:3000/api/linkedin-profile/callback"
  process.env.LINKEDIN_SESSION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64")
  global.fetch = jest.fn() as unknown as typeof fetch
})

afterEach(() => {
  process.env = { ...originalEnv }
  global.fetch = originalFetch
  jest.restoreAllMocks()
})

describe("LinkedIn OAuth routes", () => {
  it("starts the official authorization flow with a browser-bound state cookie and only OIDC scopes", async () => {
    const response = connectGet()
    const authorization = new URL(response.headers.get("location")!)
    const stateCookie = response.cookies.get(LINKEDIN_STATE_COOKIE)

    expect(authorization.origin + authorization.pathname).toBe("https://www.linkedin.com/oauth/v2/authorization")
    expect(authorization.searchParams.get("scope")).toBe("openid profile email")
    expect(authorization.searchParams.get("response_type")).toBe("code")
    expect(authorization.searchParams.get("state")).toBe(stateCookie?.value)
    expect(stateCookie).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/api/linkedin-profile/callback" })
    expect(stateCookie?.maxAge).toBe(600)
  })

  it("rejects a callback with missing or mismatched OAuth state before making network requests", async () => {
    const response = await callbackGet(callbackRequest("code=authorization-code&state=attacker-state", "expected-state"))

    expect(response.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(await response.text()).not.toContain(accessToken)
  })

  it("does not surface provider callback errors or their descriptions", async () => {
    const response = await callbackGet(callbackRequest(
      "error=access_denied&error_description=private-provider-detail&state=state",
      "state",
    ))

    expect(response.status).toBe(400)
    expect(await response.text()).not.toContain("private-provider-detail")
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("exchanges the code server-side, stores only an encrypted profile, and exposes no bearer token", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(mockResponse({ access_token: accessToken, expires_in: 3600 }))
      .mockResolvedValueOnce(mockResponse(userInfo)) as unknown as typeof fetch

    const response = await callbackGet(callbackRequest("code=authorization-code&state=state", "state"))
    const tokenRequest = (global.fetch as jest.Mock).mock.calls[0]
    const userInfoRequest = (global.fetch as jest.Mock).mock.calls[1]
    const sessionCookie = response.cookies.get(LINKEDIN_SESSION_COOKIE)?.value
    const page = await response.text()

    expect(response.status).toBe(200)
    expect(String(tokenRequest[0])).toBe("https://www.linkedin.com/oauth/v2/accessToken")
    expect(String(tokenRequest[1].body)).toContain(`client_secret=${encodeURIComponent(clientSecret)}`)
    expect(String(userInfoRequest[0])).toBe("https://api.linkedin.com/v2/userinfo")
    expect(userInfoRequest[1].headers.authorization).toBe(`Bearer ${accessToken}`)
    expect(sessionCookie).toBeTruthy()
    expect(sessionCookie).not.toContain(accessToken)
    expect(response.headers.get("set-cookie")).not.toContain(accessToken)
    expect(page).not.toContain(accessToken)
    expect(page).not.toContain(clientSecret)

    const profileResponse = profileGet(new NextRequest("http://localhost:3000/api/linkedin-profile/profile", {
      headers: {
        origin: "http://localhost:3000",
        cookie: `${LINKEDIN_SESSION_COOKIE}=${sessionCookie}`,
      },
    }))
    const profileBody = await profileResponse.json()
    expect(profileResponse.status).toBe(200)
    expect(profileBody.profile).toMatchObject({
      sub: "profile-subject",
      name: "Ada Lovelace",
      given_name: "Ada",
      family_name: "Lovelace",
      picture: "https://media.licdn.com/profile.jpg",
      profilePhotoUrl: "https://media.licdn.com/profile.jpg",
      email: "ada@example.com",
      email_verified: true,
      headline: "",
      summary: "",
      positions: [],
      education: [],
      skills: [],
    })
    expect(JSON.stringify(profileBody)).not.toContain(accessToken)
  })

  it("returns a generic error when token exchange fails", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({ error_description: "private-token-error" }, false)) as unknown as typeof fetch

    const response = await callbackGet(callbackRequest("code=authorization-code&state=state", "state"))
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain("private-token-error")
  })

  it("rejects cross-origin profile reads and disconnect requests", async () => {
    const profileResponse = await profileGet(new NextRequest("http://localhost:3000/api/linkedin-profile/profile", {
      headers: {
        origin: "https://evil.example",
        cookie: `${LINKEDIN_SESSION_COOKIE}=session`,
      },
    }))
    expect(profileResponse.status).toBe(403)

    const disconnectResponse = disconnectPost(new NextRequest("http://localhost:3000/api/linkedin-profile/disconnect", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    }))
    expect(disconnectResponse.status).toBe(403)
  })
})

describe("LinkedIn profile mapping", () => {
  it("normalizes only OIDC claims and keeps unsupported template fields empty", () => {
    const profile = normalizeLinkedInUserInfo({
      ...userInfo,
      picture: "http://untrusted.example/photo.jpg",
      headline: "not an OIDC userinfo claim",
      positions: [{ title: "not available" }],
    })

    expect(profile).toMatchObject({
      name: "Ada Lovelace",
      givenName: "Ada",
      familyName: "Lovelace",
      picture: "",
      photo: "",
      profilePicture: "",
      profilePhotoUrl: "",
      headline: "",
      summary: "",
      positions: [],
      education: [],
      skills: [],
    })
  })

  it("registers the source and resolves normalized claims through existing placeholder rendering", async () => {
    const source = getDataSourceInfo("linkedin-profile")
    expect(source).toBeDefined()
    expect(source?.id).toBe("linkedin-profile")
    expect(source?.settings).toEqual([])

    global.fetch = jest.fn().mockResolvedValue(mockResponse({ profile: normalizeLinkedInUserInfo(userInfo) })) as unknown as typeof fetch
    const profile = await source!.tryConnection({})
    if (!profile || typeof profile !== "object" || !("profilePhotoUrl" in profile)) {
      throw new Error("LinkedIn profile is missing its photo URL")
    }
    const component = {
      tag: "paragraph",
      attributes: { id: "profile-name", title: "[#data.name#]", photo: "[#data.profilePhotoUrl#]", url: "[#data.linkedinUrl#]" },
      children: ["[#data.givenName#] [#data.familyName#] · [#data.headline#]"],
    } as const
    const rendered = replaceDataSourceComponentProperties(component, profile)

    expect(profile.profilePhotoUrl).toBe("https://media.licdn.com/profile.jpg")
    expect(rendered.attributes).toEqual({
      id: "profile-name",
      title: "Ada Lovelace",
      photo: "https://media.licdn.com/profile.jpg",
      url: "",
    })
    expect(rendered.children).toEqual(["Ada Lovelace · "])
  })
})
