/**
 * @fileoverview Registration page for the JobTracker application.
 *
 * Renders a sign-up form at /register and handles new account creation
 * by posting form data to the registration API. This is a client component
 * because it manages interactive form state and responds to user input.
 *
 * Registration flow:
 *   1. User fills in name, email, and password
 *   2. handleRegister() sends a POST request to /api/register with the form data
 *   3. The API hashes the password and creates the user record in the database
 *   4. 201 response → user is navigated to /login to sign in with their new account
 *   5. 400 response → error message from the API is displayed on the form //changing to email verification flow in the future for security
 *
 * @module app/register/page
 * @see {@link ../api/register/route.ts} Registration API handler
 * @see {@link ../login/page.tsx} Login page the user lands on after registering
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * Registration page component. Collects new user details and delegates
 * account creation entirely to the /api/register endpoint — no password
 * hashing or database logic lives here.
 *
 * Unlike the login page which uses NextAuth's signIn(), this page uses
 * a plain fetch() call because account creation is a custom API route,
 * not something NextAuth handles. NextAuth only takes over after the
 * account exists and the user logs in.
 *
 * Error messages are passed directly from the API response rather than
 * being hardcoded here — this means the API controls what the user sees,
 * keeping error handling in one place.
 */
export default function RegisterPage() {
  const router = useRouter()

  // Controlled inputs — each field is owned by React state, not the DOM
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Holds the error message returned by the API on failed registration attempts.
  // Empty string means no error is currently displayed.
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

    /**
   * Submits the registration form to the API and handles the response.
   *
   * Sends name, email, and password as JSON to /api/register.
   * The Content-Type header is required so the API knows to parse
   * the body as JSON rather than plain text or form data.
   *
   * Response handling:
   *   - res.ok (status 201) → navigate to /login
   *   - any other status    → parse the error message from the response
   *                           body and display it on the form
   *
   * @returns {Promise<void>}
   */
  async function handleRegister() {
    setLoading(true)
    setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // tells the API to expect JSON
      body: JSON.stringify({ name, email, password }) // serialize state values to JSON string
    })

    if (res.ok) {
      // Account created — send to login so the user can sign in with their new credentials
      router.push("/login")
    } else {
      setError("Something went wrong. Please try again.") //fix when shift to email confirmation for security
      setLoading(false)    
    }
  }

  return (

  <div className= "min-h-screen bg-[#F5F0E8] flex flex-col font-sans px-5 py-12 items-center justify-center">

      {/* Logo */}
    <Link href="/" className="text-lg text-gray-900 font-bold font-serif tracking-tight mb-12 no-underline   ">
      Jobsheets
    </Link>

    {/* Tagline */}
    <div className="w-full max-w-sm mb-12">
      <div className="w-8 h-0.5 bg-[#C9A84C] mb-5 rounded-sm" />
      <p className="text-3xl font-bold text-gray-900 leading-snug tracking-tight font-serif">
        Stop losing track of where you applied.
      </p>
    </div>


    {/* Form */}
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight font-serif">
        Create an account
      </h1>

      {error && (
      <div className="bg-red-50 border border-red-200 rounded-md px-3.5 py-2.5 text-sm text-red-600 mb-4">
        {error}
      </div>
      )}

      <div className="flex flex-col gap-3">

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          className="w-full px-3.5 py-2.5 border border-black/15 rounded-md text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all"
        />


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
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 text-white text-sm font-medium rounded-md mt-1 ${
            loading ? "bg-[#d4b06a] cursor-not-allowed" : "bg-[#C9A84C] cursor-pointer"
          }`}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

      </div>

        <p className="text-sm text-gray-400 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#C9A84C] no-underline font-medium">
          Sign in 
        </Link>
        </p>
  
    </div>

    {/* footer */}
    <footer className="border-t border-black/10 py-6 px-5 text-center">
    <p className="text-xs text-gray-500 font-sans tracking-wide">
      © {new Date().getFullYear()} JOBSHEETS BY JUAN DIEGO SERRATO
    </p>
    </footer>

  </div>
  )
}
  