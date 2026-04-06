// WHAT THIS FILE DOES:
// This is the landing page at jobsheets.ca
// Logged in users are immediately redirected to /dashboard.
// Logged out visitors see the landing page which explains what Jobsheets
// is and encourages them to sign up.

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LandingPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5F0E8",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>

      {/* Navbar */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 48px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}>
        <span style={{
          fontSize: "18px",
          fontWeight: "700",
          letterSpacing: "-0.02em",
          color: "#1a1a1a",
          fontFamily: "Georgia, serif",
        }}>
          Jobsheets
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/login" style={{
            fontSize: "14px",
            color: "#666",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
          }}>
            Sign in
          </Link>
          <Link href="/register" style={{
            fontSize: "14px",
            backgroundColor: "#C9A84C",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500",
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "100px 48px 80px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#C9A84C",
          marginBottom: "24px",
          fontFamily: "system-ui, sans-serif",
        }}>
          Job search, organised
        </p>
        <h1 style={{
          fontSize: "clamp(42px, 6vw, 72px)",
          fontWeight: "700",
          lineHeight: "1.1",
          color: "#1a1a1a",
          marginBottom: "24px",
          letterSpacing: "-0.03em",
        }}>
          Stop tracking jobs<br />in a spreadsheet.
        </h1>
        <p style={{
          fontSize: "18px",
          color: "#666",
          lineHeight: "1.7",
          marginBottom: "40px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: "400",
        }}>
          Jobsheets keeps every application organised — company, role, status,
          job description, and the full history of every update — in one clean place.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            fontSize: "15px",
            backgroundColor: "#C9A84C",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500",
          }}>
            Start for free
          </Link>
          <Link href="/login" style={{
            fontSize: "15px",
            backgroundColor: "transparent",
            color: "#1a1a1a",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "400",
            border: "1px solid rgba(0,0,0,0.15)",
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        height: "1px",
        backgroundColor: "rgba(0,0,0,0.08)",
      }} />

      {/* Features */}
      <section style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "80px 48px",
      }}>
        <p style={{
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "48px",
          fontFamily: "system-ui, sans-serif",
        }}>
          What you get
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
        }}>
          {[
            {
              title: "Track every application",
              description: "Log company, role, location, salary range, job URL, and the full job description in one place."
            },
            {
              title: "Follow the status",
              description: "Move applications from Applied to Interview to Offer. Every change is recorded with a timestamp."
            },
            {
              title: "See your progress",
              description: "A live dashboard shows how many applications you've sent, your response rate, and weekly activity."
            },
            {
              title: "Free forever",
              description: "No credit card required. No limits on applications. Just sign up and start tracking."
            },
          ].map((feature) => (
            <div key={feature.title} style={{
              padding: "28px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.07)",
            }}>
              <div style={{
                width: "32px",
                height: "3px",
                backgroundColor: "#C9A84C",
                marginBottom: "16px",
                borderRadius: "2px",
              }} />
              <h3 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "8px",
                fontFamily: "system-ui, sans-serif",
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#777",
                lineHeight: "1.6",
                fontFamily: "system-ui, sans-serif",
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: "720px",
        margin: "0 auto 80px",
        padding: "0 48px",
        textAlign: "center",
      }}>
        <div style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "12px",
          padding: "56px 48px",
        }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}>
            Ready to get organised?
          </h2>
          <p style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "32px",
            fontFamily: "system-ui, sans-serif",
          }}>
            Free to use. No credit card required.
          </p>
          <Link href="/register" style={{
            fontSize: "15px",
            backgroundColor: "#C9A84C",
            color: "#fff",
            padding: "14px 36px",
            borderRadius: "8px",
            textDecoration: "none",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500",
          }}>
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "24px 48px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "12px",
          color: "#999",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.05em",
        }}>
          © 2026 JOBSHEETS BY JUAN DIEGO SERRATO
        </p>
      </footer>

    </div>
  )
}

















// WHAT THIS FILE DOES:
// This is the root page at localhost:3000.
// It immediately redirects logged in users to the dashboard
// and logged out users to the login page.
// Nobody should ever actually see this page.

/*
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
  */