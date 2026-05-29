import { readFileSync } from 'fs'
import { join } from 'path'
import { LegalPage } from '@/components/LegalPage'

export default function CookiesPage() {
  const html = readFileSync(join(process.cwd(), 'lib/legal/cookies.html'), 'utf-8')
  return <LegalPage html={html} />
}
