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

    <div className = "min-h-screen bg-[#F5F0E8] font-serif">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-6 border-b border-black/[0.08]">
        <span className="text-lg font-bold tracking-tight text-black">
          Jobsheets
        </span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-gray-500 no-underline font-sans">
            Sign in
          </Link>
          <Link href="/register" className="text-sm bg-[#C9A84C] text-white px-4 py-2 rounded-md no-underline font-sans font-medium">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-12 text-center">
        <p className="text-xs tracking-widest uppercase text-[#C9A84C] mb-6 font-sans">
          job search, organized
        </p>
        <h1 className="text-5xl font-bold text-black mb-6 leading-tight tracking-tight">
          Stop tracking jobs<br/> in a spreadsheet.
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-10 font-sans">
          Jobsheets keeps every application organized — company, role, 
          status, job description, and the full history of every update — in one clean place. 
        </p>
        <div className="flex flex-row gap-3 justify-center">
          <Link href="/register" className="text-white bg-[#C9A84C] px-8 py-3 rounded-lg no-underline font-sans font-medium text-center">
          Start for free
          </Link>
          <Link href="/login" className="text-gray-500 border border-black/15 px-8 py-3 rounded-lg no-underline font-sans font-medium text-center">
          Sign in
          </Link>
        </div>
      </section>
      
      <div className="max-w-3xl mx-auto h-px bg-black/10" />

      {/* What you get */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-12 text-center">
        <p className="text-xs text-left tracking-widest uppercase text-gray-500 mb-10 font-sans">
          what you get
        </p>
        <div className="grid grid-cols-1 gap-6 ">
           {[
            {
              title: "Track every application",
              description: "Log company, role, location, salary range, job URL, and the full job description in one place.",
            },
            {
              title: "Follow the status",
              description: "Move applications from Applied to Interview to Offer. Every change is recorded with a timestamp.",
            },
            {
              title: "See your progress",
              description: "A live dashboard shows how many applications you've sent, your response rate, and weekly activity.",
            },]
          .map((feature) => (
            <div key = {feature.title} className="p-7 bg-white rounded-xl border border-black/[0.07]">
              <div className="w-8 h-0.5 bg-[#C9A84C] mb-4 rounded-sm"/>
              <h3 className="text-left font-semibold text-gray-900 mb-2 font-sans">  
                {feature.title}
              </h3>
              <p className="text-left text-sm text-gray-500 leading-relaxed font-sans">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* Call to action */}
      <section className="max-w-3xl mx-auto mb-16 px-5 text-center">
        <div className="bg-black rounded-xl px-6 py-12">
          <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">
            Ready to get organized?
          </h2>
          <Link href="/register" className="text-base bg-[#C9A84C] text-white px-9 py-3.5 rounded-lg no-underline font-sans font-medium">
            Get started
          </Link>
        </div>
      </section>



      {/* footer */}
      <footer className="border-t border-black/10 py-6 px-5 text-center">
      <p className="text-xs text-gray-500 font-sans tracking-wide">
        © {new Date().getFullYear()} JOBSHEETS BY JUAN DIEGO SERRATO
      </p>
      </footer>

    </div>

  )

}








   