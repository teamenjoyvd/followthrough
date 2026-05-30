import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Followthrough',
  description: 'How Followthrough collects, uses, and protects your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-terra-outline mb-10">Last updated: 30 May 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-terra-on-surface-variant">

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">1. Who we are</h2>
          <p>
            Followthrough (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a contact relationship management tool operated by
            Team Enjoyvd. Our production application is available at{' '}
            <a href="https://ft.teamenjoyvd.com" className="text-primary hover:underline">https://ft.teamenjoyvd.com</a>.
            For privacy-related enquiries, contact us at{' '}
            <a href="mailto:privacy@teamenjoyvd.com" className="text-primary hover:underline">privacy@teamenjoyvd.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">2. What data we collect</h2>
          <p>We collect the following categories of personal data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information</strong> — name and email address provided during sign-up via Clerk authentication.</li>
            <li><strong>Contact records</strong> — names, email addresses, phone numbers, job titles, company names, and notes you enter or import into the application.</li>
            <li><strong>Interaction logs</strong> — records of calls, emails, and notes you create manually within the app.</li>
            <li><strong>Google Contacts data</strong> — see Section 3 below.</li>
            <li><strong>Usage data</strong> — standard server logs including IP address, browser type, and pages visited, retained for up to 90 days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">3. Google Contacts integration</h2>
          <p>
            If you connect your Google account, Followthrough requests the following OAuth scope:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <code className="text-xs bg-terra-surface-container-high px-1.5 py-0.5 rounded">https://www.googleapis.com/auth/contacts.readonly</code>
              {' '}— read-only access to your Google Contacts.
            </li>
          </ul>
          <p>
            We use this scope exclusively to import your Google Contacts into Followthrough so you can track follow-ups against them.
            We do <strong>not</strong> write to, modify, or delete your Google Contacts.
            We do <strong>not</strong> sell, share, or transfer your Google Contacts data to any third party.
            Imported contact data is stored in our database (Supabase, hosted on AWS) and is associated only with your account.
          </p>
          <p>
            You can revoke Google access at any time via your{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Account permissions page</a>.
            Revoking access does not automatically delete contacts already imported; to delete them, remove them within the app or contact us.
          </p>
          <p>
            Our use of Google user data complies with the{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google API Services User Data Policy
            </a>, including the Limited Use requirements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">4. How we use your data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and operate the Followthrough service.</li>
            <li>To authenticate you securely via Clerk.</li>
            <li>To sync and display your contacts and interaction history.</li>
            <li>To send transactional emails (e.g. password resets) where required.</li>
            <li>To improve application performance and fix bugs using anonymised usage data.</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell your data to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">5. Data storage and retention</h2>
          <p>
            Your data is stored in a Supabase PostgreSQL database hosted on AWS (EU region). We retain your account and contact data
            for as long as your account is active. If you delete your account, we will delete your personal data within 30 days,
            except where retention is required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">6. Third-party services</h2>
          <p>We use the following sub-processors:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Clerk</strong> — authentication and user management.</li>
            <li><strong>Supabase</strong> — database and storage.</li>
            <li><strong>Vercel</strong> — application hosting and edge delivery.</li>
            <li><strong>Google</strong> — OAuth and Contacts API (only when you connect your Google account).</li>
          </ul>
          <p>Each provider operates under its own privacy policy and data processing agreement.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">7. Your rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict processing of your data.</li>
            <li>Data portability.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@teamenjoyvd.com" className="text-primary hover:underline">privacy@teamenjoyvd.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">8. Cookies</h2>
          <p>
            We use cookies to maintain your session and authenticate you. See our{' '}
            <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for full details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">9. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will update the &ldquo;Last updated&rdquo; date at the top of this page.
            Continued use of the service after changes constitutes acceptance of the revised policy.
          </p>
        </section>

      </div>
    </div>
  )
}
