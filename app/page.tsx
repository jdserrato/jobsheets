// WHAT THIS FILE DOES:
// This is the root page at localhost:3000.
// It immediately redirects logged in users to the dashboard
// and logged out users to the login page.
// Nobody should ever actually see this page.

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}