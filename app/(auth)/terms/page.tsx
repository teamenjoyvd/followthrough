import { readFileSync } from 'fs'
import { join } from 'path'
import { LegalPage } from '@/components/LegalPage'

export default function TermsPage() {
  const html = readFileSync(join(process.cwd(), 'lib/legal/terms.html'), 'utf-8')
  return <LegalPage html={html} />
}
