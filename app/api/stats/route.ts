// WHAT THIS FILE DOES:
// This is the stats API route at /api/stats.
// It runs several database queries to calculate useful metrics
// about the user's job search and returns them as JSON.
// The dashboard page calls this route to get the numbers it displays.
// Metrics returned:
//   - totalApplications: total number of applications
//   - byStatus: count of applications grouped by status
//   - perWeek: number of applications submitted each week
//   - avgDaysToResponse: average days between applying and first status change

/**
 * @fileoverview Stats API route for the JobTracker application.
 *
 * Calculates and returns job search metrics for the logged-in user at GET /api/stats.
 * Called by the dashboard page to populate its summary numbers and charts.
 * All calculations happen on the server in JavaScript after a single database
 * fetch — no complex SQL aggregations are used.
 *
 * Metrics returned:
 *   - totalApplications  → total count of all applications
 *   - byStatus           → count of applications grouped by current status
 *   - perWeek            → count of applications submitted each calendar week
 *   - avgDaysToResponse  → average days between applying and first status change,
 *                          or null if no applications have a response yet
 *
 * Data fetching strategy:
 *   All applications and their status histories are fetched in a single query
 *   using Prisma's include. This avoids N+1 queries (one query per application)
 *   at the cost of fetching more data upfront. For a personal job tracker with
 *   hundreds of applications this is fine — at tens of thousands it would need
 *   rethinking.
 *
 * HTTP responses:
 *   200 → metrics object returned successfully
 *   401 → no valid session (not logged in)
 *   404 → session exists but user record not found in database
 *
 * @module api/stats
 * @see {@link ../../dashboard/page.tsx} Dashboard page that consumes this route
 * @see {@link ../applications/route.ts} Applications route for raw application data
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Fetches all applications for the logged-in user and computes job search metrics.
 *
 * The four metrics are calculated sequentially from the same applications array —
 * the database is only hit once regardless of how many metrics are computed.
 *
 * @returns {Promise<NextResponse>} JSON object containing all four metrics, or an error response.
 *
 */
export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    )
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { statusHistory: { orderBy: { changedAt: "asc" } } }
  })

  // ── Metric 1: Total applications
  const totalApplications = applications.length

  // ── Metric 2: Count by status
  const byStatus = applications.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  // ── Metric 3: Applications per calendar week
  const perWeek = applications.reduce((acc: Record<string, number>, app) => {
    const date = new Date(app.dateApplied)
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const key = startOfWeek.toISOString().split("T")[0]
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // ── Metric 4: Average days to first response
  const responseTimes = applications
    .filter(app => app.statusHistory.length > 1)
    .map(app => {
      const applied = new Date(app.statusHistory[0].changedAt)
      const firstResponse = new Date(app.statusHistory[1].changedAt)
      return (firstResponse.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24)
    })

// Average the response times and round to the nearest whole day.
  const avgDaysToResponse = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null

  return NextResponse.json({
    totalApplications,
    byStatus,
    perWeek,
    avgDaysToResponse
  })
}