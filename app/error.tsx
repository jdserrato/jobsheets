// WHAT THIS FILE DOES:
// This is the global error page. In Next.js, if any page crashes
// or throws an unexpected error, this component is shown instead
// of a blank screen. It gives the user a friendly message and
// a button to try again.

"use client"

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-lg p-8 shadow-sm max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          An unexpected error occurred. Try again or come back later.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}