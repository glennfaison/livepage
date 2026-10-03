import { NextRequest, NextResponse } from "next/server"
import { LINKEDIN_SESSION_COOKIE } from "@/server/features/linkedin-profile"

function rejectExplicitCrossOrigin(request: NextRequest): NextResponse | null {
  const originValue = request.headers.get("origin") ?? request.headers.get("referer")
  if (!originValue) return null
  try {
    if (new URL(originValue).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  }
  return null
}

export const POST = (request: NextRequest) => {
  const rejected = rejectExplicitCrossOrigin(request)
  if (rejected) return rejected
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set(LINKEDIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/linkedin-profile",
    maxAge: 0,
  })
  return response
}
