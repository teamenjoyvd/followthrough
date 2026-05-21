import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Followthrough</h1>
      <p className="text-gray-600 mb-8">Contact follow-up, done right.</p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="px-4 py-2 border border-black rounded hover:bg-gray-50"
        >
          Sign up
        </Link>
      </div>
    </main>
  )
}
