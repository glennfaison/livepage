import { NextRequest, NextResponse } from "next/server"
import {
  completeLinkedInAuthorization,
  getLinkedInConfig,
  LINKEDIN_SESSION_COOKIE,
  LINKEDIN_STATE_COOKIE,
  linkedInSessionLifetimeSeconds,
  stateMatches,
} from "@/server/features/linkedin-profile"

const messagePage = (status: "connected" | "error", targetOrigin: string, responseStatus: number) => {
  const safeOrigin = JSON.stringify(targetOrigin).replace(/</g, "\\u003c")
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>LinkedIn connection</title></head><body><p>${status === "connected" ? "LinkedIn connected. You can close this window." : "LinkedIn could not be connected. You can close this window and try again."}</p><script>if(window.opener){window.opener.postMessage({type:"linkedin-profile-oauth",status:"${status}"},${safeOrigin});}window.close();</script></body></html>`
  return new NextResponse(body, {
    status: responseStatus,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  })
}

const clearStateCookie = (response: NextResponse) => {
  response.cookies.set(LINKEDIN_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/linkedin-profile/callback",
    maxAge: 0,
  })
  return response
}

export const GET = async (request: NextRequest) => {
  const state = request.nextUrl.searchParams.get("state") || ""
  const expectedState = request.cookies.get(LINKEDIN_STATE_COOKIE)?.value || ""
  if (!state || !expectedState || !stateMatches(state, expectedState)) {
    return clearStateCookie(messagePage("error", request.nextUrl.origin, 400))
  }

  const error = request.nextUrl.searchParams.get("error")
  const code = request.nextUrl.searchParams.get("code")
  if (error || !code) {
    return clearStateCookie(messagePage("error", request.nextUrl.origin, 400))
  }

  try {
    const config = getLinkedInConfig()
    if (config.redirectUri.origin !== request.nextUrl.origin) {
      return clearStateCookie(messagePage("error", config.redirectUri.origin, 400))
    }

    const { sessionCookie } = await completeLinkedInAuthorization(code)
    const response = clearStateCookie(messagePage("connected", config.redirectUri.origin, 200))
    response.cookies.set(LINKEDIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/linkedin-profile",
      maxAge: linkedInSessionLifetimeSeconds(),
    })
    return response
  } catch {
    return clearStateCookie(messagePage("error", request.nextUrl.origin, 502))
  }
}
