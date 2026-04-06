// WHAT THIS FILE DOES:
// This is the navigation bar component that appears at the top of every page.
// It shows links to the Dashboard and Applications pages.
// It also shows a Sign Out button that logs the user out using NextAuth
// and redirects them to the login page.
// It is a client component because it uses NextAuth's signOut function
// which runs in the browser.

"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(path + "/")
  }
  
return (
    <nav style={{
      backgroundColor: "#fff",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      padding: "0 48px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/dashboard" style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#1a1a1a",
          textDecoration: "none",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.02em",
        }}>
          Jobsheets
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/dashboard" style={{
            fontSize: "13px",
            color: isActive("/dashboard") ? "#C9A84C" : "#888",
            textDecoration: "none",
            fontWeight: isActive("/dashboard") ? "500" : "400",
            letterSpacing: "0.02em",
          }}>
            Dashboard
          </Link>
          <Link href="/applications" style={{
            fontSize: "13px",
            color: isActive("/applications") ? "#C9A84C" : "#888",
            textDecoration: "none",
            fontWeight: isActive("/applications") ? "500" : "400",
            letterSpacing: "0.02em",
          }}>
            Applications
          </Link>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          fontSize: "13px",
          color: "#888",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Sign out
      </button>
    </nav>
  )
}