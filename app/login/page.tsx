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
            Your job search,<br />finally organised.
          </p>
        </div>
        <p style={{
          fontSize: "12px",
          color: "#999",
          letterSpacing: "0.05em",
        }}>
          © 2026 JOBSHEETS BY JUAN DIEGO SERRATO
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
            Welcome back
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#888",
            marginBottom: "32px",
          }}>
            Sign in to your account
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
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
              autoComplete="current-password"
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
              onClick={handleLogin}
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p style={{
            fontSize: "13px",
            color: "#888",
            textAlign: "center",
            marginTop: "24px",
          }}>
            No account?{" "}
            <Link href="/register" style={{
              color: "#C9A84C",
              textDecoration: "none",
              fontWeight: "500",
            }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}