export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-semibold text-gray-900">Terms of Service</h1>
        {/* Termly Terms of Service embed */}
        <div
          className="termly-embed"
          data-id="TERMLY_TERMS_ID"
          data-type="iframe"
        />
        <script
          type="text/javascript"
          src="https://app.termly.io/embed-policy.min.js"
          async
        />
      </div>
    </main>
  )
}
