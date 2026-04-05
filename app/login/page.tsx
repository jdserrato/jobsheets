/**
 * @fileoverview Login page for the JobTracker application.
 *
 * Renders a sign-in form at /login and handles credential submission
 * through NextAuth. This is a client component because it manages
 * interactive form state and responds to user input.
 *
 * Authentication flow:
 *   1. User enters email and password
 *   2. handleLogin() calls NextAuth's signIn() with redirect: false
 *   3. NextAuth posts credentials to /api/auth/callback/credentials
 *   4. The authorize() function in route.ts verifies them against the database
 *   5. Success → user is navigated to /dashboard
 *   6. Failure → error message is displayed, form stays on screen
 *
 * @module app/login/page
 * @see {@link ../api/auth/[...nextauth]/route.ts} NextAuth handler
 * @see {@link ../../middleware.ts} Route protection middleware
 */
"use client"

import { signIn } from "next-auth/react" // import the signIn function from NextAuth to handle user authentication
import { useState } from "react"        // import useState hook to manage form state and error messages
import { useRouter } from "next/navigation"         // import useRouter hook to programmatically navigate after successful login

/**
 * Login page component. Manages form state locally and delegates
 * credential verification entirely to NextAuth — no direct database
 * or password logic lives here.
 *
 * Uses redirect: false in the signIn() call so that NextAuth returns
 * a result object instead of automatically redirecting. This allows
 * the component to handle success and failure differently:
 *   - Success: programmatic navigation to /dashboard via useRouter
 *   - Failure: inline error message without a full page reload
 */
export default function LoginPage() {              // define the LoginPage component which will render the login form and handle user authentication
  const router = useRouter()                 // initialize the router to navigate to the dashboard after successful login
  
  // Controlled inputs — each field is owned by React state, not the DOM
  const [email, setEmail] = useState("")            
  const [password, setPassword] = useState("")     
 
  // Holds the error message shown below the form on failed login attempts.
  // Empty string means no error is currently displayed.
  const [error, setError] = useState("")       

    /**
   * Submits the form credentials to NextAuth and handles the result.
   *
   * Called when the user clicks the Sign In button. Uses redirect: false
   * so NextAuth returns a result object instead of handling navigation
   * itself — this gives us control over what happens after each outcome.
   *
   * NextAuth deliberately does not specify why login failed (wrong password
   * vs email not found) — the generic error message here intentionally
   * mirrors that to prevent attackers from enumerating valid emails.
   *
   * @returns {Promise<void>}
   */
  async function handleLogin() {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false // return a result object instead of auto-redirecting 
    })

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard") 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sign in</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full border rounded-md p-2 mb-4 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full border rounded-md p-2 mb-4 text-sm"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white rounded-md p-2 font-medium hover:bg-blue-700"
        >
          Sign in
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          No account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}