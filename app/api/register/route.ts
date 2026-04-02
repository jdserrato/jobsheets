/**
 * @fileoverview Registration API route for the JobTracker application.
 *
 * Handles new user account creation at POST /api/register.
 * Called by the registration form in app/register/page.tsx when a user
 * submits their details. Runs entirely on the server — the client never
 * has direct access to the database or password hashing logic.
 *
 * Request body (JSON):
 *   { name: string, email: string, password: string }
 *
 * Responses:
 *   201 → account created successfully
 *   400 → validation failed or email already registered
 *
 * Security note:
 *   The 400 response for an existing email leaks whether an address is
 *   registered, enabling email enumeration. For production, both the
 *   existing-email and success cases should return 201 with the same
 *   generic message, and a confirmation email should be sent instead.
 *
 * @module api/register
 * @see {@link ../../register/page.tsx} Registration form that calls this route
 * @see {@link ../auth/[...nextauth]/route.ts} NextAuth handler that handles login after registration
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Creates a new user account from submitted registration details.
 *
 * Validates input, checks for duplicate emails, hashes the password,
 * and writes the new user record to the database. Password hashing
 * uses a cost factor of 10 — meaning even if the database is compromised,
 * the plaintext passwords cannot be recovered directly.
 *
 * This function only handles POST — Next.js will automatically return
 * 405 Method Not Allowed for GET, PUT, DELETE, etc. on this route.
 *
 * @param {Request} request - The incoming HTTP request from the registration form.
 * @returns {Promise<NextResponse>} JSON response with a message and HTTP status code.
 *
 */
export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json(
      { message: "An account with that email already exists" },
      { status: 400 }
    )
  }

  // Hash the password before storing — never save plaintext passwords.
  // Cost factor of 10 means bcrypt runs 2^10 (1,024) hashing rounds,
  // making brute force attacks computationally expensive.
  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { name, email, passwordHash }
  })

  return NextResponse.json(
    { message: "Account created successfully" },
    { status: 201 }
  )
}