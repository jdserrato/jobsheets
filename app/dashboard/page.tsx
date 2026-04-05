// WHAT THIS FILE DOES:
// This is the stats dashboard page at localhost:3000/dashboard.
// It fetches data from /api/stats and displays key metrics about
// the user's job search in a clean card layout:
//   - Total applications sent
//   - Breakdown of applications by status
//   - Applications submitted per week
//   - Average days to first response
// This page is protected by middleware - logged out users get redirected to /login.

/**
 * @fileoverview Dashboard page for the JobTracker application.
 *
 * Renders job search metrics at /dashboard fetched from /api/stats.
 * This is a client component because it fetches data on the client
 * using useEffect and manages loading state.
 *
 * The page is protected by middleware — unauthenticated users are
 * redirected to /login before this component ever runs.
 *
 * Displays four metrics in three sections:
 *   - Summary row     - total applications + average days to first response
 *   - By status card  - count of applications at each status stage
 *   - Per week card   - horizontal bar chart of the last 6 weeks of activity
 *
 * Renders three possible states:
 *   1. Loading   - shown while the /api/stats fetch is in flight
 *   2. Error     - shown if the fetch fails or returns no data
 *   3. Dashboard - shown once stats are successfully loaded
 *
 * @module app/dashboard/page
 * @see {@link ../../api/stats/route.ts} API route that calculates and returns the metrics
 * @see {@link ../../middleware.ts} Middleware that redirects unauthenticated users
 * @see {@link ../applications/page.tsx} Applications list linked from the page header
 */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
 * Dashboard page component. Fetches stats from /api/stats on mount
 * and renders them as metric cards. No user interaction is required —
 * the page is purely a read-only display of calculated data.
 *
 */
export default function DashboardPage() {
   // Holds the stats object returned by /api/stats — null until the fetch completes
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

    /**
   * Fetches job search metrics from /api/stats when the component mounts.
   *
   * The empty dependency array [] means this runs exactly once — on mount.
   * Stats do not need to be re-fetched automatically because the dashboard
   * is a snapshot view. The user can refresh the page to get updated numbers.
   *
   * setLoading(false) runs regardless of success or failure so the loading
   * placeholder is always replaced — either with the dashboard or the error state.
   */
  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Could not load stats.</p>
      </div>
    )
  }

  const sortedWeeks = Object.entries(stats.perWeek as Record<string, number>)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/applications"
          className="text-sm text-blue-600 hover:underline"
        >
          View all applications →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-blue-600 text-4xl font-bold mt-1">{stats.totalApplications}</p>
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500">Avg. Days to Response</p>
          <p className="text-yellow-500 text-4xl font-bold mt-1">
            {stats.avgDaysToResponse !== null ? stats.avgDaysToResponse : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.avgDaysToResponse !== null
              ? "days after applying"
              : "not enough data yet"}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-5 shadow-sm mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">By Status</h2>
        {Object.keys(stats.byStatus).length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(stats.byStatus as Record<string, number>).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-black text-sm font-semibold">{count}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Applications Per Week
        </h2>
        {sortedWeeks.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedWeeks.map(([week, count]) => (
              <div key={week} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">
                  {new Date(week).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric"
                  })}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((count / 10) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="text-black text-xs font-medium w-4 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}