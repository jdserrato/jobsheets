/**
 * POST /api/reset-password
 * 
 * Accepts a token (from the email link) and a new password.
 * Validates the token exists and hasn't expired, then updates
 * the user's password hash and deletes the token so it can't be reused.
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
  }

  // Look up the token in the database
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  // Reject if token doesn't exist or has expired
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired." },
      { status: 400 }
    )
  }

  // Hash the new password
  const passwordHash = await bcrypt.hash(password, 10)

  // Update the user's password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash }
  })

  // Delete the token so it can't be used again
  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ message: "Password updated successfully." })
}