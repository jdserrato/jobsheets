// WHAT THIS FILE DOES:
// This is a layout file. In Next.js, a layout wraps every page in its folder.
// This layout adds the Navbar to the top of every dashboard/applications page
// automatically without having to add it to each page individually.

import Navbar from "@/components/Navbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Navbar />
      <main style={{ backgroundColor: "#ffffff" }}>{children}</main>
    </div>
  )
}