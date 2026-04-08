"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

// useSearchParams() requires a Suspense boundary in Next.js app router
function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    setError("")

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message)
      setLoading(false)
    } else {
      router.push("/login?reset=success")
    }
  }

  if (!token) {
    return (
      <p style={{ fontSize: "14px", color: "#888" }}>
        Invalid reset link.{" "}
        <Link href="/forgot-password" style={{ color: "#C9A84C", textDecoration: "none" }}>
          Request a new one
        </Link>
      </p>
    )
  }

  return (
    <>
      <h1 style={{
        fontSize: "24px",
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: "8px",
        letterSpacing: "-0.02em",
        fontFamily: "Georgia, serif",
      }}>
        Choose a new password
      </h1>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>
        Must be at least 8 characters.
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
          type="password"
          placeholder="New password"
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
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
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
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<p style={{ fontSize: "14px", color: "#888" }}>Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}