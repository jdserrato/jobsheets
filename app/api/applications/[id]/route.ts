/**
 * @fileoverview Dynamic application API route for the JobTracker application.
 *
 * Handles operations on a single application by its ID at:
 *   GET   /api/applications/[id] → fetches a single application and its status history
 *   PATCH  /api/applications/[id] → updates fields on an existing application
 *   DELETE /api/applications/[id] → permanently deletes an application and its history
 *
 * The [id] segment is a Next.js dynamic route — one file handles any application
 * ID automatically. For example:
 *   /api/applications/a3f8c2d1-9b4e-4f7a-8c3d-1e2f5a6b7c8d
 *   /api/applications/b7c3e1f2-4d8a-4b2c-9e1f-3a7d2c8b4e6f
 *
 * Both handlers follow the same four-step security pattern:
 *   1. Verify a valid session exists
 *   2. Look up the user record from the session email
 *   3. Look up the application by the ID in the URL
 *   4. Confirm the application belongs to the logged-in user
 *
 * Step 4 is the critical ownership check — without it, any logged-in user
 * could edit or delete any other user's applications by guessing a UUID.
 *
 * HTTP responses:
 *   200 → application updated (PATCH) or deleted (DELETE) successfully
 *   400 → missing required fields
 *   401 → no valid session (not logged in)
 *   404 → application not found OR application belongs to a different user
 *         (both cases return 404 — returning 403 "Forbidden" would confirm
 *         the application exists, leaking information about other users' data)
 *
 * @module api/applications/[id]
 * @see {@link ../route.ts} Parent route that handles GET and POST for all applications
 * @see {@link ../../../../schema.prisma} Application and StatusHistory model definitions
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const application = await prisma.application.findUnique({
    where: { id: params.id }
  })

  if (!application || application.userId !== user.id) {
    return NextResponse.json(
      { message: "Application not found" },
      { status: 404 }
    )
  }

  const history = await prisma.statusHistory.findMany({
    where: { applicationId: params.id },
    orderBy: { changedAt: "asc" }
  })

  return NextResponse.json({ application, history })
}

/**
 * Updates one or more fields on an existing application.
 *
 * All fields are optional — only the fields included in the request body
 * are updated. Fields that are omitted are left unchanged in the database.
 * This is achieved through spread syntax that only includes a field in the
 * update if it has a truthy value (see inline comment below).
 *
 * Status change behaviour:
 *   If the incoming status differs from the current status, a StatusHistory
 *   record is written BEFORE the application is updated. This ordering
 *   guarantees the history entry captures the correct fromStatus — if the
 *   application were updated first, that value would be lost.
 *
 * Ownership check:
 *   Returns 404 (not 403) when the application belongs to another user.
 *   This deliberately avoids confirming whether the application exists at all.
 *
 * @param {Request} request - The incoming PATCH request containing fields to update.
 * @param {{ params: { id: string } }} context - Next.js route context containing the application ID from the URL.
 * @returns {Promise<NextResponse>} The updated application object, or an error response.
 *
 * @example
 * // Update status only
 * PATCH /api/applications/a3f8c2d1-...
 * Body: { "status": "INTERVIEW" }
 * → 200 { id, companyName, roleTitle, status: "INTERVIEW", ... }
 *
 * // Update multiple fields
 * PATCH /api/applications/a3f8c2d1-...
 * Body: { "roleTitle": "Senior Engineer", "salaryRange": "$120k-$140k" }
 * → 200 { id, companyName, roleTitle: "Senior Engineer", ... }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const application = await prisma.application.findUnique({
    where: { id: params.id }
  })

  if (!application || application.userId !== user.id) {
    return NextResponse.json(
      { message: "Application not found" },
      { status: 404 }
    )
  }

  const { companyName, roleTitle, jobDescription, jobUrl, location, salaryRange, status } =
    await request.json()

  if (status && status !== application.status) {
    await prisma.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: status
      }
    })
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: {
      ...(companyName && { companyName }),
      ...(roleTitle && { roleTitle }),
      ...(jobDescription && { jobDescription }),
      ...(jobUrl && { jobUrl }),
      ...(location && { location }),
      ...(salaryRange && { salaryRange }),
      ...(status && { status })
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const application = await prisma.application.findUnique({
    where: { id: params.id }
  })

  if (!application || application.userId !== user.id) {
    return NextResponse.json(
      { message: "Application not found" },
      { status: 404 }
    )
  }

  await prisma.statusHistory.deleteMany({
    where: { applicationId: params.id }
  })

  await prisma.application.delete({
    where: { id: params.id }
  })

  return NextResponse.json(
    { message: "Application deleted" },
    { status: 200 }
  )
}