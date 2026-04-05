/**
 * @fileoverview Applications API route for the JobTracker application.
 *
 * Handles two operations at /api/applications:
 *   GET  → returns all job applications belonging to the logged-in user
 *   POST → creates a new job application for the logged-in user
 *
 * Both handlers follow the same three-step authentication pattern:
 *   1. Verify a valid session exists
 *   2. Look up the user record from the session email
 *   3. Scope all database operations to that user's ID
 *
 * Data isolation is enforced at the query level — every read and write
 * is filtered by userId, so users can never access each other's data
 * even if they manipulate requests directly.
 *
 * HTTP responses:
 *   200 → applications returned successfully (GET)
 *   201 → application created successfully (POST)
 *   400 → missing required fields (POST)
 *   401 → no valid session (not logged in)
 *   404 → session exists but user record not found in database
 *
 * @module api/applications
 * @see {@link ../../../middleware.ts} Middleware that protects the frontend routes
 * @see {@link ../../schema.prisma} Application and StatusHistory model definitions
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Returns all job applications belonging to the currently logged-in user,
 * ordered from most recently created to oldest.
 *
 * Authentication uses the session email rather than an ID in the URL —
 * this means the user can never request another user's applications by
 * manipulating a parameter. The data they get back is always and only theirs.
 *
 * The 404 case (session valid but no user in database) should not happen
 * in normal usage, but is handled defensively in case of data inconsistency
 * between the session cookie and the database.
 *
 * @returns {Promise<NextResponse>} Array of application objects, or an error response.
 *
 * @example
 * // Successful fetch
 * GET /api/applications
 * → 200 [{ id, companyName, roleTitle, status, dateApplied, ... }, ...]
 *
 * // Not logged in
 * GET /api/applications
 * → 401 { message: "Unauthorized" }
 */
export async function GET() {
  const session = await getServerSession()

  // session?.user?.email uses optional chaining — if session is null,
  // or session.user is null, it short-circuits to null instead of throwing.
  // No session email means the user is not logged in.
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
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(applications)
}

/**
 * Creates a new job application for the currently logged-in user.
 *
 * Required fields: companyName, roleTitle
 * Optional fields: jobDescription, jobUrl, location, salaryRange
 *
 * On creation, two records are written in sequence:
 *   1. The Application record itself, with status defaulting to "APPLIED"
 *   2. A StatusHistory record marking the initial status transition
 *      (fromStatus: null means this is the first entry — the application
 *      did not transition from anything, it was created at this status)
 *
 * Writing the StatusHistory entry here rather than relying on the client
 * to do it ensures every application always has at least one history entry
 * and the audit trail is never incomplete.
 *
 * @param {Request} request - The incoming POST request containing application data.
 * @returns {Promise<NextResponse>} The newly created application object, or an error response.
 *
 * @example
 * // Successful creation
 * POST /api/applications
 * Body: { "companyName": "Acme", "roleTitle": "Engineer", "location": "Remote" }
 * → 201 { id, companyName, roleTitle, status: "APPLIED", dateApplied, ... }
 *
 * // Missing required fields
 * POST /api/applications
 * Body: { "location": "Remote" }
 * → 400 { message: "Company name and role title are required" }
 */
export async function POST(request: Request) {
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

  // Destructure all expected fields from the request body.
  // Optional fields (jobDescription, jobUrl, location, salaryRange) will be
  // undefined if not provided — Prisma stores these as null in the database.
  const { companyName, roleTitle, jobDescription, jobUrl, location, salaryRange } =
    await request.json()

  if (!companyName || !roleTitle) {
    return NextResponse.json(
      { message: "Company name and role title are required" },
      { status: 400 }
    )
  }

  // Create the application record — userId ties it permanently to this user.
  const application = await prisma.application.create({
    data: {
      userId: user.id,
      companyName,
      roleTitle,
      jobDescription,
      jobUrl,
      location,
      salaryRange,
      status: "APPLIED"
    }
  })

  await prisma.statusHistory.create({
    data: {
      applicationId: application.id,
      fromStatus: null,
      toStatus: "APPLIED"
    }
  })

  return NextResponse.json(application, { status: 201 })
}