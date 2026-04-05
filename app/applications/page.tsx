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
 * component runs. Without middleware this would be unsafe.
 */
export default async function ApplicationsPage() {
  const session = await getServerSession()

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! }
  })

  const applications = await prisma.application.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <Link
          href="/applications/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + Add Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No applications yet.</p>
          <p className="text-sm mt-1">Click "Add Application" to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-black text-lg font-semibold">{app.companyName}</h2>
                  <p className="text-gray-600 text-sm">{app.roleTitle}</p>
                  {app.location && (
                    <p className="text-gray-400 text-sm mt-1">{app.location}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-800"}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">
                  Applied {new Date(app.dateApplied).toLocaleDateString()}
                </p>
                <Link
                  href={`/applications/${app.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
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