// WHAT THIS FILE DOES:
// This file handles two things for a specific application by its ID:
//   PATCH /api/applications/[id] - updates an application (status, notes, etc)
//   DELETE /api/applications/[id] - deletes an application
//
// Both routes first check for a valid session and then verify that the
// application belongs to the logged in user before doing anything.
// This prevents users from editing or deleting each other's applications.
// When the status changes, a new row is written to StatusHistory automatically.

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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