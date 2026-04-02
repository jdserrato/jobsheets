/**
 * @fileoverview Route protection middleware for the JobTracker application.
 *
 * Runs automatically on every incoming request BEFORE the page loads,
 * acting as a single security checkpoint for all protected routes.
 * Individual pages do not need their own authentication checks —
 * this file covers them all automatically.
 *
 * Protected routes:
 *   - /dashboard/*      — main dashboard and all nested pages
 *   - /applications/*   — application list and all nested pages
 *
 * Authentication flow:
 *   1. Request arrives for a protected route
 *   2. Middleware checks for a valid JWT session cookie
 *   3. Valid token   → request passes through to the page normally
 *   4. Missing token → user is redirected to /login
 *
 * @module middleware
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware} Next.js middleware docs
 * @see {@link https://next-auth.js.org/configuration/nextjs#middleware} NextAuth middleware docs
 */

import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Intercepts incoming requests and verifies the user is authenticated
 * before allowing access to protected routes.
 *
 * Reads the NextAuth JWT session cookie and validates it against
 * NEXTAUTH_SECRET. If the token is missing or invalid, the user
 * is redirected to /login regardless of which protected page they
 * were trying to reach. The original URL is not preserved — users
 * always land on /login and must navigate manually after signing in.
 *
 * @param {NextRequest} request - The incoming request object provided by Next.js.
 * @returns {Promise<NextResponse>} A redirect to /login if unauthenticated,
 *                                  or NextResponse.next() to proceed normally.
 *
 * @example
 * // User visits /dashboard without being logged in:
 * // middleware runs → no token found → redirected to /login
 *
 * // User visits /dashboard while logged in:
 * // middleware runs → valid token found → page loads normally
 */
export async function middleware(request: NextRequest) {
  // Validate the JWT session cookie using the same secret NextAuth used to sign it.
  // Returns the decoded token payload if valid, or null if missing/expired/tampered.
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

/**
 * Defines which routes this middleware runs on.
 *
 * Uses Next.js path matching syntax:
 *   /dashboard/:path*    — matches /dashboard and any route nested under it
 *   /applications/:path* — matches /applications and any route nested under it
 *
 * Routes NOT listed here (e.g. /login, /register, /api/auth/*)
 * are public and will never trigger this middleware.
 *
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher} Matcher docs
 */
export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*"]
}