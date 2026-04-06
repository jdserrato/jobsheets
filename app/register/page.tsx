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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5F0E8",
      display: "flex",
      fontFamily: "system-ui, sans-serif",
    }}>

      {/* Left panel */}
      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        borderRight: "1px solid rgba(0,0,0,0.08)",
      }}>
        <Link href="/" style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#1a1a1a",
          textDecoration: "none",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.02em",
        }}>
          Jobsheets
        </Link>
        <div>
          <div style={{
            width: "40px",
            height: "3px",
            backgroundColor: "#C9A84C",
            marginBottom: "20px",
            borderRadius: "2px",
          }} />
          <p style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1.3",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif",
            maxWidth: "280px",
          }}>
            Stop losing track<br />of where you applied.
          </p>
        </div>
        <p style={{
          fontSize: "12px",
          color: "#999",
          letterSpacing: "0.05em",
        }}>
          © 2026 JOBSHEETS
        </p>
      </div>

      {/* Right panel */}
      <div style={{
        flex: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
      }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif",
          }}>
            Create an account
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#888",
            marginBottom: "32px",
          }}>
            Free forever. No credit card required.
          </p>

          {error && (
            <div style={{
              backgroundColor: "#fff0f0",
              border: "1px solid #fcc",
              borderRadius: "6px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#c00",
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#1a1a1a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#1a1a1a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#1a1a1a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                backgroundColor: loading ? "#d4b06a" : "#C9A84C",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p style={{
            fontSize: "13px",
            color: "#888",
            textAlign: "center",
            marginTop: "24px",
          }}>
            Already have an account?{" "}
            <Link href="/login" style={{
              color: "#C9A84C",
              textDecoration: "none",
              fontWeight: "500",
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
  