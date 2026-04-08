/**
 * POST /api/forgot-password
 * 
 * Accepts an email address, generates a secure reset token, stores it
 * in the database with a 1-hour expiry, and emails the user a reset link.
 * 
 * Always returns 200 even if the email doesn't exist — this prevents
 * attackers from using this endpoint to discover registered emails.
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"
import { Resend } from "resend"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // If no user found, return 200 anyway — never reveal whether an email exists
  if (!user) {
    return NextResponse.json({ message: "If that email is registered, a reset link has been sent." })
  }

  // Delete any existing unused tokens for this user so only one is valid at a time
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // Generate a cryptographically secure random token
  const token = randomBytes(32).toString("hex")

  // Store the token with a 1-hour expiry
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    }
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: "Jobsheets <noreply@jobsheets.ca>",
    to: user.email,
    subject: "Reset your Jobsheets password",
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to choose a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  })

  return NextResponse.json({ message: "If that email is registered, a reset link has been sent." })
}