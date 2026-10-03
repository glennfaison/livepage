import { NextResponse } from "next/server"
import {
  buildLinkedInAuthorizationUrl,
  createOAuthState,
  LINKEDIN_STATE_COOKIE,
  LinkedInOAuthError,
} from "@/server/features/linkedin-profile"

export const GET = () => {
  try {
    const state = createOAuthState()
    const response = NextResponse.redirect(buildLinkedInAuthorizationUrl(state))
    response.headers.set("cache-control", "no-store")
    response.cookies.set(LINKEDIN_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/linkedin-profile/callback",
      maxAge: 10 * 60,
    })
    return response
  } catch (error) {
    const status = error instanceof LinkedInOAuthError ? 503 : 500
    return NextResponse.json({ error: "LinkedIn is not configured" }, { status })
  }
}
