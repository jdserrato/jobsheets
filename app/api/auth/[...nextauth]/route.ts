/**
 * @fileoverview NextAuth.js authentication handler for the JobTracker application.
 *
 * Catches all requests to /api/auth/* via the [...nextauth] dynamic route, including:
 *   - /api/auth/signin
 *   - /api/auth/signout
 *   - /api/auth/session
 *   - /api/auth/callback
 *
 * Authentication strategy:
 *   - Credentials provider (email + password)
 *   - Passwords verified against bcrypt hashes stored in PostgreSQL
 *   - Sessions stored as encrypted JWT cookies in the browser (stateless)
 *   - No session records are written to the database
 *
 * @module api/auth/[...nextauth]
 * @see {@link https://next-auth.js.org/configuration/options} NextAuth configuration docs
 */


import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * NextAuth handler configured with email/password authentication.
 *
 * The `authorize` function acts as the login gatekeeper — it runs on every
 * sign-in attempt and must return a user object on success or null on failure.
 * NextAuth will never see the reason for failure; it only knows success or null,
 * which prevents leaking whether an email exists in the system.
 *
 * Login flow:
 *   1. Validate that email and password are present
 *   2. Look up the user in the database by email
 *   3. Compare the submitted password against the stored bcrypt hash
 *   4. Return the user object on success then NextAuth creates a JWT session cookie
 *   5. Return null on any failure then NextAuth redirects to the login page with an error
 */
const handler = NextAuth({ // configure NextAuth to use the credentials provider
  providers: [
    CredentialsProvider({ // set up a credentials provider for email/password authentication
      name: "credentials", 
      credentials: {      // define the fields expected in the login form
        email: { label: "Email", type: "email" }, 
        password: { label: "Password", type: "password" } 
      },

        /**
       * Verifies submitted credentials against the database.
       *
       * Intentionally returns null for ALL failure cases (missing credentials,
       * user not found, wrong password) to avoid revealing which step failed.
       * This prevents attackers from using the login form to enumerate valid emails.
       *
       * @param {object} credentials - The submitted form values.
       * @param {string} credentials.email - The submitted email address.
       * @param {string} credentials.password - The submitted plaintext password.
       * @returns {Promise<object|null>} user object on success, null on any failure.
       */
      async authorize(credentials) { // this function is called when a user tries to log in with credentials
        // Reject immediately if either field is missing
        if (!credentials?.email || !credentials?.password) return null

        // Look up user by email — returns null if no match
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        // Compare the submitted password against the stored bcrypt hash
        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: {
    strategy: "jwt" // use JSON Web Tokens for session instead of database sessions
  },
  pages: {
    signIn: "/login" // custom login page
  }
})

// NextAuth exports a single handler that covers both GET and POST requests:
//   GET  /api/auth/*  — fetching session data, CSRF tokens, provider info
//   POST /api/auth/*  — submitting credentials, signing out
export { handler as GET, handler as POST }