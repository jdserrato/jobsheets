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
import Link from "next/link"    

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
  const [loading, setLoading] = useState(false)    

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
    setLoading(true)
    setError("")
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false // return a result object instead of auto-redirecting 
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard") 
    }
  }


return (
  <div className = "min-h-screen bg-[#F5F0E8] flex flex-col font-sans px-5 py-12 items-center justify-center">

    {/* Logo */}
    <Link href="/" className="text-lg text-gray-900 font-bold font-serif tracking-tight mb-12 no-underline   ">
      Jobsheets
    </Link>

    {/* Tagline */}
    <div className="w-full max-w-sm mb-12">
      <div className="w-8 h-0.5 bg-[#C9A84C] mb-5 rounded-sm" />
      <p className="text-3xl font-bold text-gray-900 leading-snug tracking-tight font-serif">
        Your job search,<br />finally organized.
      </p>
    </div>

    {/* Form */}
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight font-serif">
        Welcome back
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        Sign in to your account
      </p>

      {error && (
      <div className="bg-red-50 border border-red-200 rounded-md px-3.5 py-2.5 text-sm text-red-600 mb-4">
        {error}
      </div>
      )}

      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-3.5 py-2.5 border border-black/15 rounded-md text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3.5 py-2.5 border border-black/15 rounded-md text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all"
          />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 text-white text-sm font-medium rounded-md mt-1 ${
            loading ? "bg-[#d4b06a] cursor-not-allowed" : "bg-[#C9A84C] cursor-pointer"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

      </div>

      <p className="text-sm text-gray-400 text-center mt-3">
        <Link href="/forgot-password" className="text-[#C9A84C] no-underline">
          Forgot password?
        </Link>
      </p>  

      <p className="text-sm text-gray-400 text-center mt-6">
        No account?{" "}
        <Link href="/register" className="text-[#C9A84C] no-underline font-medium">
          Create one
        </Link>
      </p>
    </div>

  </div>
  )
}