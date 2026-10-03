import { NextRequest, NextResponse } from "next/server"
import {
  decryptLinkedInProfile,
  getLinkedInConfig,
  LINKEDIN_SESSION_COOKIE,
} from "@/server/features/linkedin-profile"

function rejectExplicitCrossOrigin(request: NextRequest): NextResponse | null {
  const originValue = request.headers.get("origin") ?? request.headers.get("referer")
  if (!originValue) return null
  try {
    if (new URL(originValue).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin" }, {
        status: 403,
        headers: { "cache-control": "no-store" },
      })
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, {
      status: 403,
      headers: { "cache-control": "no-store" },
    })
  }
  return null
}

export const GET = (request: NextRequest) => {
  const rejected = rejectExplicitCrossOrigin(request)
  if (rejected) return rejected

  let config
  try {
    config = getLinkedInConfig()
  } catch {
    return NextResponse.json({ error: "LinkedIn is not configured" }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    })
  }

  const cookie = request.cookies.get(LINKEDIN_SESSION_COOKIE)?.value
  if (!cookie) {
    return NextResponse.json({ error: "LinkedIn is not connected" }, {
      status: 401,
      headers: { "cache-control": "no-store" },
    })
  }
  const profile = decryptLinkedInProfile(cookie, config)
  if (!profile) {
    const response = NextResponse.json({ error: "LinkedIn is not connected" }, {
      status: 401,
      headers: { "cache-control": "no-store" },
    })
    response.cookies.set(LINKEDIN_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/linkedin-profile",
      maxAge: 0,
    })
    return response
  }
  return NextResponse.json({ profile }, { headers: { "cache-control": "no-store" } })
}
