// WHAT THIS FILE DOES:
// This is the dashboard page that lives at localhost:3000/dashboard.
// It is currently a placeholder - we will replace it on Day 7 with
// real stats: total applications, breakdown by status, average response time.
//
// This page is protected by middleware.ts - if you are not logged in
// and try to visit this page, you will be redirected to /login automatically.

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
        <p className="text-gray-600 mt-2">You are logged in.</p>
      </div>
    </div>
  )
}