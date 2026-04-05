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
    <nav className="bg-black px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-white">JobTrackr</span>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`text-sm ${isActive("/dashboard") ? "text-white font-medium" : "text-gray-500 hover:text-gray-900"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/applications"
              className={`text-white text-sm ${isActive("/applications") ? "font-medium" : "text-gray-500 hover:text-gray-900"}`}
            >
              Applications
            </Link>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-white hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}