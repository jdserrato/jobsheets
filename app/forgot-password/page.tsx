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
    <div className = "min-h-screen bg-[#F5F0E8] flex flex-col font-sans px-5 py-12 items-center justify-center">

      {/* Logo */}
      <Link href="/" className="text-lg text-gray-900 font-bold font-serif tracking-tight mb-12 no-underline   ">
        Jobsheets
      </Link>

      {/* Form */}
      <div className="w-full max-w-sm">
        {submitted ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 leading-snug tracking-tight font-serif">
              Check your email
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              If an account exists for <strong className="text-gray-900">{email}</strong>, we have sent a 
              password reset link. It expires in 1 hour.
            </p>
            <p className="text-sm text-gray-400 text-left mt-6">
              <Link href="/login" className="text-[#C9A84C] no-underline font-medium">
                Back to sign in 
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="w-8 h-0.5 bg-[#C9A84C] mb-5 rounded-sm" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight font-serif">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Enter your email and we will send you a reset link.
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-3.5 py-2.5 border border-black/15 rounded-md text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 text-white text-sm font-medium rounded-md mt-1 ${
                  loading ? "bg-[#d4b06a] cursor-not-allowed" : "bg-[#C9A84C] cursor-pointer"
                }`}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </div>

            <p className="text-sm text-gray-400 text-center mt-6">
              <Link href="/login" className="text-[#C9A84C] no-underline font-medium">
                Back to sign in 
              </Link>
            </p>
          
          </>
      )}
      </div>              
    </div>

  )
}