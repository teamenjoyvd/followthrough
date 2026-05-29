export default function DataRequestPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Data Subject Access Request</h1>
        <p className="mb-8 text-gray-600">
          You have the right to request access to, correction of, or deletion of your personal
          data that we hold. To submit a request, email us at{' '}
          <a
            href="mailto:privacy@teamenjoyvd.com"
            className="text-blue-600 underline hover:text-blue-800"
          >
            privacy@teamenjoyvd.com
          </a>{' '}
          with the subject line &ldquo;Data Request&rdquo; and include your name and the email
          address associated with your account. We will respond within 30 days.
        </p>
        <p className="text-sm text-gray-500">
          For more information on how we handle your data, see our{' '}
          <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  )
}
