export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8 text-sm text-gray-700">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cookie Policy</h1>
          <p className="mt-1 text-gray-500">Last updated May 29, 2026</p>
        </div>

        <p>
          This Cookie Policy explains how Followthrough (&ldquo;Company,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; and &ldquo;our&rdquo;) uses cookies and similar technologies to
          recognize you when you visit our website at{" "}
          <a
            href="https://ft.teamenjoyvd.com"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ft.teamenjoyvd.com
          </a>{" "}
          (&ldquo;Website&rdquo;). It explains what these technologies are and why we use them, as
          well as your rights to control our use of them.
        </p>

        <p>
          In some cases we may use cookies to collect personal information, or that becomes personal
          information if we combine it with other information.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you
            visit a website. Cookies are widely used by website owners in order to make their
            websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, Followthrough) are called
            &ldquo;first-party cookies.&rdquo; Cookies set by parties other than the website owner
            are called &ldquo;third-party cookies.&rdquo; Third-party cookies enable third-party
            features or functionality to be provided on or through the website (e.g., advertising,
            interactive content, and analytics). The parties that set these third-party cookies can
            recognize your computer both when it visits the website in question and also when it
            visits certain other websites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Why do we use cookies?</h2>
          <p>
            We use first- and third-party cookies for several reasons. Some cookies are required for
            technical reasons in order for our Website to operate, and we refer to these as
            &ldquo;essential&rdquo; or &ldquo;strictly necessary&rdquo; cookies. Other cookies also
            enable us to track and target the interests of our users to enhance the experience on
            our Online Properties. Third parties serve cookies through our Website for advertising,
            analytics, and other purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. Essential cookies
            cannot be rejected as they are strictly necessary to provide you with services.
          </p>
          <p>
            You may also set or amend your web browser controls to accept or refuse cookies. The
            specific types of first- and third-party cookies served through our Website are
            described below.
          </p>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Essential website cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through
              our Website and to use some of its features, such as access to secure areas.
            </p>
            <CookieTable
              cookies={[
                {
                  name: "__cf_bm",
                  purpose:
                    "Cloudflare places this cookie on end-user devices that access customer sites protected by Bot Management or Bot Fight Mode.",
                  provider: ".ft.teamenjoyvd.com",
                  service: "Cloudflare",
                  serviceUrl: "https://www.cloudflare.com/privacypolicy/",
                  type: "http_cookie",
                  expires: "29 minutes",
                },
              ]}
            />

            <h3 className="font-medium text-gray-900">Performance and functionality cookies</h3>
            <p>
              These cookies are used to enhance the performance and functionality of our Website but
              are non-essential to their use. However, without these cookies, certain functionality
              may become unavailable.
            </p>
            <CookieTable
              cookies={[
                {
                  name: "_cfuvid",
                  purpose:
                    "Set by Cloudflare to enhance security and performance. Helps identify trusted web traffic and ensures a secure browsing experience.",
                  provider: ".ft.teamenjoyvd.com",
                  service: "Cloudflare",
                  serviceUrl:
                    "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/",
                  type: "server_cookie",
                  expires: "Session",
                },
              ]}
            />

            <h3 className="font-medium text-gray-900">Unclassified cookies</h3>
            <p>
              These are cookies that have not yet been categorized. We are in the process of
              classifying these cookies with the help of their providers.
            </p>
            <CookieTable
              cookies={[
                {
                  name: "__client_uat",
                  provider: ".teamenjoyvd.com",
                  type: "http_cookie",
                  expires: "9 years 11 months 28 days",
                },
                {
                  name: "__clerk_redirect_count",
                  provider: "ft.teamenjoyvd.com",
                  type: "server_cookie",
                  expires: "Less than 1 minute",
                },
                {
                  name: "__clerk_environment",
                  provider: "ft.teamenjoyvd.com",
                  type: "html_local_storage",
                  expires: "Persistent",
                },
                {
                  name: "__clerk_db_jwt",
                  provider: "ft.teamenjoyvd.com",
                  type: "http_cookie",
                  expires: "11 months 30 days",
                },
              ]}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            How can I control cookies on my browser?
          </h2>
          <p>
            As the means by which you can refuse cookies through your web browser controls vary from
            browser to browser, you should visit your browser&rsquo;s help menu for more
            information. The following is information about how to manage cookies on the most popular
            browsers:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {[
              {
                label: "Chrome",
                href: "https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies",
              },
              {
                label: "Internet Explorer",
                href: "https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d",
              },
              {
                label: "Firefox",
                href: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop",
              },
              { label: "Safari", href: "https://support.apple.com/en-ie/guide/safari/sfri11471/mac" },
              {
                label: "Edge",
                href: "https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd",
              },
              { label: "Opera", href: "https://help.opera.com/en/latest/web-preferences/" },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            What about other tracking technologies, like web beacons?
          </h2>
          <p>
            Cookies are not the only way to recognize or track visitors to a website. We may use
            other, similar technologies from time to time, like web beacons (sometimes called
            &ldquo;tracking pixels&rdquo; or &ldquo;clear gifs&rdquo;). These are tiny graphics
            files that contain a unique identifier that enables us to recognize when someone has
            visited our Website or opened an email including them. In many instances, these
            technologies are reliant on cookies to function properly, and so declining cookies will
            impair their functioning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            How often will you update this Cookie Policy?
          </h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example,
            changes to the cookies we use or for other operational, legal, or regulatory reasons.
            Please therefore revisit this Cookie Policy regularly to stay informed about our use of
            cookies and related technologies. The date at the top of this Cookie Policy indicates
            when it was last updated.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Where can I get further information?
          </h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please contact
            us at:
          </p>
          <address className="not-italic leading-6">
            Followthrough
            <br />
            Banat Str
            <br />
            Sofia, 1407
            <br />
            Bulgaria
          </address>
        </section>
      </div>
    </main>
  )
}

type Cookie = {
  name: string
  purpose?: string
  provider: string
  service?: string
  serviceUrl?: string
  type: string
  expires: string
}

function CookieTable({ cookies }: { cookies: Cookie[] }) {
  return (
    <div className="space-y-3">
      {cookies.map((c) => (
        <div
          key={c.name}
          className="rounded border border-gray-200 p-4 text-xs text-gray-600"
        >
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              <Row label="Name" value={<code className="font-mono">{c.name}</code>} />
              {c.purpose && <Row label="Purpose" value={c.purpose} />}
              <Row label="Provider" value={c.provider} />
              {c.service && (
                <Row
                  label="Service"
                  value={
                    c.serviceUrl ? (
                      <a
                        href={c.serviceUrl}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.service} — View Privacy Policy
                      </a>
                    ) : (
                      c.service
                    )
                  }
                />
              )}
              <Row label="Type" value={c.type} />
              <Row label="Expires in" value={c.expires} />
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="align-top">
      <th className="w-24 py-1 pr-3 text-right font-medium text-gray-500">{label}</th>
      <td className="py-1">{value}</td>
    </tr>
  )
}
