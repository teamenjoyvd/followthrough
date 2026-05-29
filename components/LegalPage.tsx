interface LegalPageProps {
  html: string
}

export function LegalPage({ html }: LegalPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
