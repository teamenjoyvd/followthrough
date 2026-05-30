import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Followthrough',
  description: 'Terms and conditions for using Followthrough.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-terra-outline mb-10">Last updated: 30 May 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-terra-on-surface-variant">

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">1. Acceptance of terms</h2>
          <p>
            By accessing or using Followthrough (&ldquo;the Service&rdquo;) at{' '}
            <a href="https://ft.teamenjoyvd.com" className="text-primary hover:underline">https://ft.teamenjoyvd.com</a>,
            you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">2. Description of service</h2>
          <p>
            Followthrough is a contact relationship management tool that helps individuals track follow-ups,
            log interactions, and optionally sync contacts from Google. The Service is provided &ldquo;as is&rdquo;
            and may be updated, modified, or discontinued at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">3. Accounts</h2>
          <p>
            You must create an account to use the Service. You are responsible for maintaining the confidentiality
            of your credentials and for all activity under your account. You must notify us immediately of any
            unauthorised use at{' '}
            <a href="mailto:privacy@teamenjoyvd.com" className="text-primary hover:underline">privacy@teamenjoyvd.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for any unlawful purpose or in violation of any regulations.</li>
            <li>Upload or store data that infringes third-party rights.</li>
            <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure.</li>
            <li>Scrape, reverse-engineer, or otherwise extract data from the Service without permission.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">5. Your data</h2>
          <p>
            You retain ownership of all contact data and interaction records you enter into the Service.
            By using the Service, you grant us a limited licence to store and process that data solely to
            provide and improve the Service. See our{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">6. Google integration</h2>
          <p>
            If you connect a Google account, you authorise us to access your Google Contacts in read-only mode
            as described in our Privacy Policy. You may revoke this access at any time via your Google Account settings.
            We are not affiliated with or endorsed by Google LLC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">7. Intellectual property</h2>
          <p>
            All software, design, and content comprising the Followthrough application (excluding your data)
            is the property of Team Enjoyvd and is protected by applicable intellectual property laws.
            You may not copy, modify, or distribute any part of the Service without our written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">8. Disclaimer of warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied,
            including but not limited to warranties of merchantability, fitness for a particular purpose,
            or non-infringement. We do not guarantee that the Service will be uninterrupted or error-free.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Team Enjoyvd shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Service,
            even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at our discretion if you violate
            these terms. You may delete your account at any time from within the application settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">11. Changes to these terms</h2>
          <p>
            We may update these terms at any time. We will update the &ldquo;Last updated&rdquo; date above.
            Continued use of the Service after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">12. Governing law</h2>
          <p>
            These terms are governed by and construed in accordance with applicable law.
            Any disputes shall be subject to the exclusive jurisdiction of the competent courts.
          </p>
        </section>

      </div>
    </div>
  )
}
