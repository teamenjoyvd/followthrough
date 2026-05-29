export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-semibold text-gray-900">Privacy Policy</h1>
        {/* Termly Privacy Policy embed */}
        <div
          className="termly-embed"
          data-id="TERMLY_PRIVACY_ID"
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
