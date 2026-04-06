/**
 * @fileoverview Applications list page for the JobTracker application.
 *
 * Renders all job applications belonging to the logged-in user at /applications.
 * This is a server component — data is fetched directly from the database on
 * the server before the page is sent to the browser, meaning no loading spinner,
 * no client-side fetch, and no visible layout shift on arrival.
 *
 * The page is protected by middleware — unauthenticated users are redirected
 * to /login before this component ever runs. The session and user lookups here
 * are therefore safe to perform without defensive 401 handling.
 *
 * Displays each application as a card showing:
 *   - Company name, role title, and optional location
 *   - Status badge with a colour mapped to the current status
 *   - Date applied
 *   - Link to the individual application detail page
 *
 * Empty state is handled explicitly — if the user has no applications,
 * a prompt to add their first one is shown instead of a blank page.
 *
 * @module app/applications/page
 * @see {@link ../../middleware.ts} Middleware that redirects unauthenticated users
 * @see {@link ./[id]/page.tsx} Individual application detail page
 * @see {@link ./new/page.tsx} New application form
 * @see {@link ../../api/applications/route.ts} API route for application data
 */

import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"

const prisma = new PrismaClient()

 // Maps each application status value to a pair of Tailwind classes that
 // control the badge background and text colour.
const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  PHONE_SCREEN: "bg-yellow-100 text-yellow-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-green-100 text-green-800",
  ACCEPTED: "bg-green-200 text-green-900",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800"
}

/**
 * Server component that fetches and renders the user's full application list.
 *
 * Because this is a server component, the database queries run on the server
 * at request time — the browser receives fully rendered HTML and never sees
 * the database calls, the session object, or the Prisma client. This is
 * fundamentally different from a client component where fetch() calls are
 * visible in the browser's network tab.
 *
 * Data flow:
 *   1. Read the session to identify who is logged in
 *   2. Look up the full user record to get their database ID
 *   3. Fetch all applications scoped to that user ID, newest first
 *   4. Render the list, or the empty state if none exist
 *
 * The non-null assertion (!) on session?.user?.email is safe here because
 * middleware has already guaranteed the user is authenticated before this
 * component runs. Without middleware this would be unsafe. ****changed
 */
export default async function ApplicationsPage() {
  const session = await getServerSession()

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" }
  })

  const applications = await prisma.application.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "48px 32px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "40px"
      }}>
        <div>
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: "6px"
          }}>
            Your applications
          </p>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif"
          }}>
            My Applications
          </h1>
        </div>
        <Link href="/applications/new" style={{
          fontSize: "13px",
          backgroundColor: "#C9A84C",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "500",
        }}>
          + Add Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 0",
          color: "#bbb"
        }}>
          <p style={{ fontSize: "16px", marginBottom: "8px", color: "#999" }}>No applications yet.</p>
          <p style={{ fontSize: "13px" }}>Click Add Application to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {applications.map(app => (
            <div key={app.id} style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: "10px",
              padding: "20px 24px",
            }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "4px",
                    fontFamily: "Georgia, serif"
                  }}>
                    {app.companyName}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#666" }}>{app.roleTitle}</p>
                  {app.location && (
                    <p style={{ fontSize: "12px", color: "#bbb", marginTop: "2px" }}>{app.location}</p>
                  )}
                </div>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "500",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor:
                    app.status === "APPLIED" ? "#EFF6FF" :
                    app.status === "PHONE_SCREEN" ? "#FEFCE8" :
                    app.status === "INTERVIEW" ? "#F5F3FF" :
                    app.status === "OFFER" ? "#F0FDF4" :
                    app.status === "ACCEPTED" ? "#DCFCE7" :
                    app.status === "REJECTED" ? "#FEF2F2" : "#F9FAFB",
                  color:
                    app.status === "APPLIED" ? "#1D4ED8" :
                    app.status === "PHONE_SCREEN" ? "#854D0E" :
                    app.status === "INTERVIEW" ? "#6D28D9" :
                    app.status === "OFFER" ? "#15803D" :
                    app.status === "ACCEPTED" ? "#166534" :
                    app.status === "REJECTED" ? "#B91C1C" : "#374151",
                }}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,0.05)"
              }}>
                <p style={{ fontSize: "11px", color: "#bbb" }}>
                  Applied {new Date(app.dateApplied).toLocaleDateString()}
                </p>
                <Link href={`/applications/${app.id}`} style={{
                  fontSize: "12px",
                  color: "#C9A84C",
                  textDecoration: "none",
                  fontWeight: "500",
                }}>
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}