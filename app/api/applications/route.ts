// WHAT THIS FILE DOES:
// This file handles two things:
//   GET /api/applications - returns all job applications for the logged in user
//   POST /api/applications - creates a new job application in the database
//
// Every request first checks for a valid session - if the user is not logged
// in, it returns a 401 (unauthorized) error immediately.
// Applications are always filtered by the logged in user's ID so users
// can never see each other's data.

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(applications)
}

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

  const { companyName, roleTitle, jobDescription, jobUrl, location, salaryRange } =
    await request.json()

  if (!companyName || !roleTitle) {
    return NextResponse.json(
      { message: "Company name and role title are required" },
      { status: 400 }
    )
  }

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