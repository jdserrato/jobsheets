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

type Application = {
  id: string
  companyName: string
  roleTitle: string
  status: string
  dateApplied: string
  jobDescription: string | null
  jobUrl: string | null
  location: string | null
  salaryRange: string | null
}

type StatusHistoryEntry = {
  id: string
  fromStatus: string | null
  toStatus: string
  changedAt: string
}
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
  const [application, setApplication] = useState<Application | null>(null)
  // Full status history for this application — array of StatusHistory records
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
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
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "48px 32px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ marginBottom: "40px" }}>
        <Link href="/applications" style={{
          fontSize: "12px",
          color: "#999",
          textDecoration: "none",
          letterSpacing: "0.05em",
        }}>
          ← Back
        </Link>
        <p style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#C9A84C",
          marginBottom: "6px",
          marginTop: "16px"
        }}>
          Application detail
        </p>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1a1a1a",
          letterSpacing: "-0.02em",
          fontFamily: "Georgia, serif"
        }}>
          {application.companyName}
        </h1>
      </div>

      {/* Main info card */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: "10px",
        padding: "28px",
        marginBottom: "16px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px"
        }}>
          <div>
            <p style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: "4px",
              fontFamily: "Georgia, serif"
            }}>
              {application.roleTitle}
            </p>
            {application.location && (
              <p style={{ fontSize: "13px", color: "#888" }}>{application.location}</p>
            )}
            {application.salaryRange && (
              <p style={{ fontSize: "13px", color: "#888" }}>{application.salaryRange}</p>
            )}
            {application.jobUrl && (
              <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" style={{
                fontSize: "13px",
                color: "#C9A84C",
                textDecoration: "none",
              }}>
                View job posting →
              </a>
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
              application.status === "APPLIED" ? "#EFF6FF" :
              application.status === "PHONE_SCREEN" ? "#FEFCE8" :
              application.status === "INTERVIEW" ? "#F5F3FF" :
              application.status === "OFFER" ? "#F0FDF4" :
              application.status === "ACCEPTED" ? "#DCFCE7" :
              application.status === "REJECTED" ? "#FEF2F2" : "#F9FAFB",
            color:
              application.status === "APPLIED" ? "#1D4ED8" :
              application.status === "PHONE_SCREEN" ? "#854D0E" :
              application.status === "INTERVIEW" ? "#6D28D9" :
              application.status === "OFFER" ? "#15803D" :
              application.status === "ACCEPTED" ? "#166534" :
              application.status === "REJECTED" ? "#B91C1C" : "#374151",
          }}>
            {application.status.replace("_", " ")}
          </span>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: "10px"
          }}>
            Update Status
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              defaultValue={application.status}
              id="status-select"
              disabled={statusLoading}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#1a1a1a",
                backgroundColor: "#fafafa",
                outline: "none",
              }}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const select = document.getElementById("status-select") as HTMLSelectElement
                handleStatusChange(select.value)
              }}
              disabled={statusLoading}
              style={{
                padding: "10px 20px",
                backgroundColor: statusLoading ? "#d4b06a" : "#C9A84C",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: statusLoading ? "not-allowed" : "pointer",
              }}
            >
              {statusLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Job description */}
      {application.jobDescription && (
        <div style={{
          backgroundColor: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "10px",
          padding: "28px",
          marginBottom: "16px"
        }}>
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: "14px"
          }}>
            Job Description
          </p>
          <p style={{
            fontSize: "13px",
            color: "#555",
            lineHeight: "1.7",
            whiteSpace: "pre-wrap"
          }}>
            {application.jobDescription}
          </p>
        </div>
      )}

      {/* Status history */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: "10px",
        padding: "28px",
        marginBottom: "16px"
      }}>
        <p style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "16px"
        }}>
          Status History
        </p>
        {history.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#bbb" }}>No history yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((entry: StatusHistoryEntry) => (
              <div key={entry.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px"
              }}>
                <span style={{ fontSize: "11px", color: "#bbb", width: "80px", flexShrink: 0 }}>
                  {new Date(entry.changedAt).toLocaleDateString()}
                </span>
                {entry.fromStatus && (
                  <>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#F9FAFB",
                      color: "#666",
                    }}>
                      {entry.fromStatus.replace("_", " ")}
                    </span>
                    <span style={{ color: "#C9A84C", fontSize: "12px" }}>→</span>
                  </>
                )}
                <span style={{
                  fontSize: "10px",
                  fontWeight: "500",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    entry.toStatus === "APPLIED" ? "#EFF6FF" :
                    entry.toStatus === "INTERVIEW" ? "#F5F3FF" :
                    entry.toStatus === "OFFER" ? "#F0FDF4" :
                    entry.toStatus === "ACCEPTED" ? "#DCFCE7" :
                    entry.toStatus === "REJECTED" ? "#FEF2F2" : "#F9FAFB",
                  color:
                    entry.toStatus === "APPLIED" ? "#1D4ED8" :
                    entry.toStatus === "INTERVIEW" ? "#6D28D9" :
                    entry.toStatus === "OFFER" ? "#15803D" :
                    entry.toStatus === "ACCEPTED" ? "#166534" :
                    entry.toStatus === "REJECTED" ? "#B91C1C" : "#374151",
                }}>
                  {entry.toStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleteLoading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "transparent",
          color: "#e00",
          border: "1px solid rgba(220,0,0,0.2)",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "500",
          cursor: deleteLoading ? "not-allowed" : "pointer",
        }}
      >
        {deleteLoading ? "Deleting..." : "Delete Application"}
      </button>
    </div>
  )
}