import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Followthrough',
  description: 'How Followthrough uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
      <p className="text-sm text-terra-outline mb-10">Last updated: 30 May 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-terra-on-surface-variant">

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">1. What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device by a website. They allow the site to remember
            information about your visit, such as your login state, so you don&rsquo;t have to re-enter it each time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">2. Cookies we use</h2>
          <p>Followthrough uses a minimal set of cookies, all of which are strictly necessary:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-terra-surface-container-highest">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie</th>
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                  <th className="text-left py-2 font-semibold text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terra-surface-container-highest">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">__session</td>
                  <td className="py-2 pr-4">Clerk authentication session token. Keeps you logged in.</td>
                  <td className="py-2">Session / 7 days</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">__client_uat</td>
                  <td className="py-2 pr-4">Clerk client updated-at timestamp. Used to detect session changes.</td>
                  <td className="py-2">Session</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">__cf_bm</td>
                  <td className="py-2 pr-4">Cloudflare bot management. Protects the service from automated abuse.</td>
                  <td className="py-2">30 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We do <strong>not</strong> use advertising cookies, tracking pixels, or any third-party analytics
            cookies. We do not use cookies to build profiles for advertising purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">3. Cookie consent</h2>
          <p>
            Because all cookies we set are strictly necessary for the Service to function (authentication and
            security), they do not require your separate consent under most privacy regulations. You cannot
            opt out of these cookies without losing access to the authenticated parts of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">4. Managing cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Note that deleting session
            cookies will log you out of Followthrough. For instructions, refer to your browser&rsquo;s
            help documentation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">5. Changes to this policy</h2>
          <p>
            We may update this Cookie Policy as the Service evolves. We will update the
            &ldquo;Last updated&rdquo; date above when we do so.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-headline text-xl font-bold text-foreground">6. Contact</h2>
          <p>
            Questions about our use of cookies? Email us at{' '}
            <a href="mailto:privacy@teamenjoyvd.com" className="text-primary hover:underline">privacy@teamenjoyvd.com</a>.
          </p>
        </section>

      </div>
    </div>
  )
}
