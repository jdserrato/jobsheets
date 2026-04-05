// WHAT THIS FILE DOES:
// This is the form page at localhost:3000/applications/new.
// It is a client component because it has interactive form elements.
// When the user fills out the form and clicks Submit, it sends a POST
// request to /api/applications with the form data as JSON.
// If the request succeeds, it redirects to /applications so the user
// can see their newly added application in the list.
// If it fails, it shows an error message on the page.

/**
 * @fileoverview New application form page for the JobTracker application.
 *
 * Renders a form at /applications/new that allows the user to log a new
 * job application. This is a client component because it manages interactive
 * form state, handles user input, and responds to button clicks.
 *
 * Submission flow:
 *   1. User fills in company name and role title (required) plus optional fields
 *   2. handleSubmit() validates required fields client-side before sending
 *   3. A POST request is sent to /api/applications with the form data as JSON
 *   4. Success (201)  user is navigated to /applications to see the new entry
 *   5. Failure        error message from the API is displayed on the form
 *
 * Validation happens in two places:
 *   - Client side: handleSubmit() checks required fields before sending the request,
 *     saving a round trip to the server for the most common mistake
 *   - Server side: /api/applications validates again as the authoritative check,
 *     since client-side validation can always be bypassed
 *
 * @module app/applications/new/page
 * @see {@link ../../../api/applications/route.ts} API route that handles the POST request
 * @see {@link ../page.tsx} Applications list page the user is redirected to on success
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

/**
 * New application form component. Manages all form fields in a single state
 * object and delegates persistence entirely to the /api/applications endpoint.
 * No database logic or authentication lives here.
 *
 * Form state is held in a single object rather than individual useState calls
 * for each field — this allows handleChange() to update any field with one
 * generic handler instead of a separate setter function per field.
 *
 * Loading state is tracked to disable the submit button during the request,
 * preventing duplicate submissions if the user clicks multiple times while
 * waiting for the server to respond.
 */
export default function NewApplicationPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    companyName: "",
    roleTitle: "",
    jobDescription: "",
    jobUrl: "",
    location: "",
    salaryRange: ""
  })

    /**
   * Generic change handler shared across all form inputs and the textarea.
   *
   * Uses the input's `name` attribute as the key to update the correct field
   * in the form state object. This means every input MUST have a `name` prop
   * that exactly matches a key in the form state object above, or the update
   * will silently add an unrecognised key instead of updating the right field.
   *
   * Spread syntax (...form) copies all existing fields first, then the
   * computed property [e.target.name] overwrites only the changed field.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event from any input or textarea.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    //spread operator copies existing fields and then only overwrites the ones that changed.
    setForm({ ...form, [e.target.name]: e.target.value })
  }

    /**
   * Validates the form and submits it to the API.
   *
   * Runs client-side validation first to catch missing required fields without
   * a network round trip. If validation passes, sets loading state, clears any
   * previous error, and POSTs the form data to /api/applications.
   *
   * Loading is only cleared on failure — on success, the page navigates away
   * entirely so there is no need to reset state. Clearing loading on success
   * would cause a brief flash of the enabled button before navigation completes.
   *
   * @returns {Promise<void>}
   */
  async function handleSubmit() {
    if (!form.companyName || !form.roleTitle) {
      setError("Company name and role title are required")
      return
    }

    setLoading(true)
    setError("")

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      router.push("/applications")
    } else {
      const data = await res.json()
      setError(data.message)
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold">Add Application</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="e.g. Google"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Title *
            </label>
            <input
              type="text"
              name="roleTitle"
              value={form.roleTitle}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="e.g. Software Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="e.g. Calgary, AB"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <input
              type="text"
              name="salaryRange"
              value={form.salaryRange}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="e.g. $80,000 - $100,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job URL
            </label>
            <input
              type="text"
              name="jobUrl"
              value={form.jobUrl}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="e.g. https://jobs.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              rows={6}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Paste the job description here..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md p-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Application"}
          </button>
        </div>
      </div>
    </div>
  )
}