// WHAT THIS FILE DOES:
// This is the individual application detail page at /applications/[id].
// It shows all the information for a single job application.
// It also lets the user change the status of the application via a dropdown.
// When the status changes, it sends a PATCH request to /api/applications/[id]
// which updates the database and writes a new row to StatusHistory.
// It also shows the full status history so the user can see every
// status change and when it happened.

/**
 * @fileoverview Individual application detail page for the JobTracker application.
 *
 * Renders all information for a single job application at /applications/[id].
 * This is a client component because it fetches data on the client, manages
 * multiple pieces of interactive state, and handles user actions like status
 * changes and deletion.
 *
 * The [id] segment is a Next.js dynamic route — one file handles any application
 * ID. The ID is read from the URL using useParams() rather than being passed
 * as a prop.
 *
 * Page sections:
 *   - Application details  — company, role, location, salary, job URL, status badge
 *   - Status updater       — dropdown + save button to change the current status
 *   - Job description      — only rendered if the application has one
 *   - Status history       — full chronological log of every status change
 *   - Delete button        — permanently removes the application after confirmation
 *
 * Data fetching strategy:
 *   Initial load uses useEffect to fetch the application and its history together
 *   from /api/applications/[id] when the component mounts. After a status change,
 *   the history is re-fetched to reflect the new entry — the application itself
 *   is updated from the PATCH response directly without a second fetch.
 *
 * Loading states:
 *   Three separate loading flags prevent conflicting UI states:
 *   - loading        → initial page load, shows a loading placeholder
 *   - statusLoading  → status save in flight, disables the dropdown and save button
 *   - deleteLoading  → delete in flight, disables the delete button
 *
 * @module app/applications/[id]/page
 * @see {@link ../../../api/applications/[id]/route.ts} API route that handles PATCH and DELETE
 * @see {@link ../page.tsx} Applications list page the user returns to after deletion
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

/**
 * All valid application status values in the order they typically occur
 * in a job application lifecycle. Used to populate the status dropdown.
 * Must stay in sync with the status values used in the database and
 * the STATUS_COLORS map below.
 */
const STATUSES = [
  "APPLIED",
  "PHONE_SCREEN",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN"
]

/**
 * Maps each status value to a pair of Tailwind classes for its badge colour.
 * Shared with the applications list page — if colours are changed here they
 * should be changed there too to keep the UI consistent across both pages.
 *
 * Any status not in this map will render without colour classes, which will
 * break the badge appearance. If new statuses are added to STATUSES above,
 * a corresponding entry must be added here.
 */
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
 * Application detail page component. Fetches and displays a single application
 * by ID, and provides controls to update its status or delete it entirely.
 *
 * Renders three possible states before the main UI:
 *   1. Loading  — shown while the initial fetch is in flight
 *   2. Not found — shown if the fetch succeeds but returns no application
 *      (e.g. the ID is invalid or belongs to another user)
 *   3. Full detail UI — shown once a valid application is loaded
 */
export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()

  // Extract the application ID from the URL — cast to string because
  // useParams() returns string | string[] and this route only has one [id] segment
  const id = params.id as string

  // The fetched application object — null until the initial fetch completes
  const [application, setApplication] = useState<any>(null)
  // Full status history for this application — array of StatusHistory records
  const [history, setHistory] = useState<any[]>([])
  // True during the initial page load fetch — controls the loading placeholder
  const [loading, setLoading] = useState(true)
  // True while a status PATCH request is in flight — disables the dropdown and save button
  const [statusLoading, setStatusLoading] = useState(false)
  // True while a DELETE request is in flight — disables the delete button
  const [deleteLoading, setDeleteLoading] = useState(false)

   /**
   * Fetches the application and its status history when the component mounts.
   *
   * The dependency array [id] means this effect re-runs if the ID in the URL
   * changes — which would happen if Next.js reuses this component instance
   * when navigating between different application detail pages.
   *
   * setLoading(false) runs regardless of whether the fetch succeeded or failed,
   * so the loading placeholder is always replaced — either with the application
   * UI or the "not found" message.
   */
  useEffect(() => {
    async function fetchApplication() {
      const res = await fetch(`/api/applications/${id}`)
      if (res.ok) {
        const data = await res.json()
        setApplication(data.application)
        setHistory(data.history)
      }
      setLoading(false)
    }
    fetchApplication()
  }, [id])

    /**
   * Sends a PATCH request to update the application status and refreshes
   * the status history to reflect the new entry.
   *
   * After a successful PATCH:
   *   - The application state is updated directly from the PATCH response
   *     (no second fetch needed — the API returns the updated record)
   *   - The history IS re-fetched with a second GET request because the PATCH
   *     response only returns the application, not the history entries
   *
   * The dropdown reads its current value directly from the DOM via getElementById
   * rather than tracking it in React state. This is intentional — the selected
   * value only matters at the moment the Save button is clicked, so there is no
   * need to update React state on every dropdown change.
   *
   * @param {string} newStatus - The status value selected in the dropdown.
   * @returns {Promise<void>}
   */
  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    if (res.ok) {
      // Update the application directly from the PATCH response — no refetch needed
      const updated = await res.json()
      setApplication(updated)

      // Re-fetch the full history because the PATCH just wrote a new StatusHistory
      // record and we need to show it — the PATCH response does not include history
      const historyRes = await fetch(`/api/applications/${id}`)
      if (historyRes.ok) {
        const data = await historyRes.json()
        setHistory(data.history)
      }
    }
    setStatusLoading(false)
  }

    /**
   * Asks for confirmation then sends a DELETE request to permanently remove
   * the application. On success, navigates back to the applications list.
   *
   * The native confirm() dialog is used as a simple guard against accidental
   * deletion — the user must explicitly confirm before the request is sent.
   * If the user cancels, the function returns early and nothing happens.
   *
   * setDeleteLoading(false) is only called on failure or cancellation —
   * on success the page navigates away so resetting state is unnecessary.
   *
   * @returns {Promise<void>}
   */
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this application?")) return
    setDeleteLoading(true)
    const res = await fetch(`/api/applications/${id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      router.push("/applications")
    }
    setDeleteLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">Application not found.</p>
        <Link href="/applications" className="text-blue-600 hover:underline text-sm">
          ← Back to applications
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/applications"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">{application.companyName}</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className=" text-black text-lg font-medium">{application.roleTitle}</p>
            {application.location && (
              <p className="text-gray-500 text-sm">{application.location}</p>
            )}
            {application.salaryRange && (
              <p className="text-gray-500 text-sm">{application.salaryRange}</p>
            )}
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View job posting →
              </a>
            )}
          </div>
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[application.status]}`}>
            {application.status.replace("_", " ")}
          </span>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
        <div className="flex gap-2">
        <select
            value={statusLoading ? application.status : undefined}
            defaultValue={application.status}
            id="status-select"
            disabled={statusLoading}
            className="text-black flex-1 border rounded-md p-2 text-sm disabled:opacity-50"
        >
            {STATUSES.map(s => (
            <option key={s} value={s}>
                {s.replace("_", " ")}
            </option>
            ))}
        </select>
        <button
            onClick={() => {
            const select = document.getElementById("status-select") as HTMLSelectElement
            handleStatusChange(select.value)
            }}
            disabled={statusLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
            {statusLoading ? "Saving..." : "Save"}
        </button>
        </div>
        </div>
      </div>

      {application.jobDescription && (
        <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Job Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {application.jobDescription}
          </p>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Status History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No history yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((entry: any) => (
              <div key={entry.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-xs">
                  {new Date(entry.changedAt).toLocaleDateString()}
                </span>
                {entry.fromStatus && (
                  <>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.fromStatus]}`}>
                      {entry.fromStatus.replace("_", " ")}
                    </span>
                    <span className="text-gray-400">→</span>
                  </>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[entry.toStatus]}`}>
                  {entry.toStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={deleteLoading}
        className="w-full border border-red-300 text-red-600 rounded-md p-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
      >
        {deleteLoading ? "Deleting..." : "Delete Application"}
      </button>
    </div>
  )
}