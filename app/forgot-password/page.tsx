"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    // Always show the confirmation screen regardless of whether email exists
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5F0E8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      fontFamily: "system-ui, sans-serif",
    }}>

      <Link href="/" style={{
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a1a1a",
        textDecoration: "none",
        fontFamily: "Georgia, serif",
        letterSpacing: "-0.02em",
        marginBottom: "48px",
      }}>
        Jobsheets
      </Link>

      <div style={{ width: "100%", maxWidth: "360px" }}>
        {submitted ? (
          <>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, serif",
            }}>
              Check your email
            </h1>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.6" }}>
              If an account exists for <strong style={{ color: "#1a1a1a" }}>{email}</strong>, 
              we have sent a password reset link. It expires in 1 hour.
            </p>
            <p style={{ fontSize: "13px", color: "#aaa", marginTop: "24px" }}>
              <Link href="/login" style={{ color: "#C9A84C", textDecoration: "none" }}>
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, serif",
            }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>
              Enter your email and we will send you a reset link.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
              <button
                onClick={handleSubmit}
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
                }}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#888", textAlign: "center", marginTop: "24px" }}>
              <Link href="/login" style={{ color: "#C9A84C", textDecoration: "none" }}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}