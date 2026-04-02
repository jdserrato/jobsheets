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
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700">
      <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create an account</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-md p-2 mb-4 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-md p-2 mb-4 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-md p-2 mb-4 text-sm"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white rounded-md p-2 font-medium hover:bg-blue-700"
        >
          Register
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
  