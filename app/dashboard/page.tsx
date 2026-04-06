"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Stats = {
  totalApplications: number
  avgDaysToResponse: number | null
  byStatus: Record<string, number>
  perWeek: Record<string, number>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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
      <div style={{ padding: "48px 32px", fontFamily: "system-ui, sans-serif" }}>
        <p style={{ color: "#999" }}>Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ padding: "48px 32px", fontFamily: "system-ui, sans-serif" }}>
        <p style={{ color: "#999" }}>Could not load stats.</p>
      </div>
    )
  }

  const sortedWeeks = Object.entries(stats.perWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)

  const STATUS_BG: Record<string, string> = {
    APPLIED: "#EFF6FF",
    PHONE_SCREEN: "#FEFCE8",
    INTERVIEW: "#F5F3FF",
    OFFER: "#F0FDF4",
    ACCEPTED: "#DCFCE7",
    REJECTED: "#FEF2F2",
    WITHDRAWN: "#F9FAFB",
  }

  const STATUS_TEXT: Record<string, string> = {
    APPLIED: "#1D4ED8",
    PHONE_SCREEN: "#854D0E",
    INTERVIEW: "#6D28D9",
    OFFER: "#15803D",
    ACCEPTED: "#166534",
    REJECTED: "#B91C1C",
    WITHDRAWN: "#374151",
  }

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
            Overview
          </p>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif"
          }}>
            Dashboard
          </h1>
        </div>
        <Link href="/applications" style={{
          fontSize: "13px",
          color: "#888",
          textDecoration: "none"
        }}>
          View all applications →
        </Link>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "16px"
      }}>
        <div style={{
          backgroundColor: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "10px",
          padding: "28px"
        }}>
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: "12px"
          }}>
            Total Applications
          </p>
          <p style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.03em",
            fontFamily: "Georgia, serif"
          }}>
            {stats.totalApplications}
          </p>
        </div>

        <div style={{
          backgroundColor: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "10px",
          padding: "28px"
        }}>
          <p style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: "12px"
          }}>
            Avg. Days to Response
          </p>
          <p style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.03em",
            fontFamily: "Georgia, serif"
          }}>
            {stats.avgDaysToResponse !== null ? stats.avgDaysToResponse : "—"}
          </p>
          <p style={{ fontSize: "12px", color: "#bbb", marginTop: "4px" }}>
            {stats.avgDaysToResponse !== null ? "days after applying" : "not enough data yet"}
          </p>
        </div>
      </div>

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
          marginBottom: "20px"
        }}>
          By Status
        </p>
        {Object.keys(stats.byStatus).length === 0 ? (
          <p style={{ fontSize: "14px", color: "#bbb" }}>No applications yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: STATUS_BG[status] || "#F9FAFB",
                  color: STATUS_TEXT[status] || "#374151",
                }}>
                  {status.replace("_", " ")}
                </span>
                <span style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  fontFamily: "Georgia, serif"
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: "10px",
        padding: "28px"
      }}>
        <p style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "20px"
        }}>
          Applications Per Week
        </p>
        {sortedWeeks.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#bbb" }}>No data yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedWeeks.map(([week, count]) => (
              <div key={week} style={{
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <span style={{
                  fontSize: "12px",
                  color: "#999",
                  width: "60px",
                  flexShrink: 0
                }}>
                  {new Date(week).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric"
                  })}
                </span>
                <div style={{
                  flex: 1,
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  height: "6px"
                }}>
                  <div style={{
                    width: `${Math.min((count / 10) * 100, 100)}%`,
                    height: "6px",
                    backgroundColor: "#C9A84C",
                    borderRadius: "4px",
                  }} />
                </div>
                <span style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  width: "16px",
                  textAlign: "right"
                }}>
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