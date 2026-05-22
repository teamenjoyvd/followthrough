# followthrough

Contact follow-up tool. Supports the follow-through process when working with contacts.

Built with Next.js, Supabase, and Clerk.

---

## 🎨 Rebranding & Custom Configuration

Followthrough supports full dynamic white-labeling and visual rebranding. To rebrand the application:

### 1. Branding Constants
Configure global brand details in [config/branding.ts](./config/branding.ts):

```typescript
export const branding = {
  appName: 'Followthrough',
  primaryColor: '#4a7c59',    // Forest Green (Terra primary hex)
  secondaryColor: '#6b6358',  // Warm neutral (Terra secondary hex)
  logoPath: '/logo.svg',
  supportUrl: 'https://github.com/teamenjoyvd/followthrough',
  faviconPath: '/favicon.ico',
}
```

- **`appName`**: Changes the page `<title>`, metadata, sidebar brand header, and landing page brand text.
- **`primaryColor` / `secondaryColor`**: Provide standard Hex codes. The app will automatically convert these hex values into HSL custom components at build/run time to dynamically update Tailwind's color palette tokens (such as `bg-primary`, `text-primary`, `border-border`, and focus rings).
- **`logoPath`**: Point this to your SVG logo file under `/public`.

### 2. Replacing the Logo Asset
Place your SVG vector logo at `/public/logo.svg`.
To make the logo adapt dynamically to the configured primary brand color, use the CSS custom property stroke/fill reference in your SVG paths:
```xml
<path d="..." stroke="var(--color-primary, #4a7c59)" />
```

### 3. Dynamic Styling Engine
The styling engine uses `components/InjectBrandingStyles.tsx` to automatically inject color variable overrides into the document `<head>` without causing hydration flashes:
- `--color-primary`: Raw Hex string.
- `--color-secondary`: Raw Hex string.
- `--primary`: Space-separated HSL components (`H S% L%`) mapped to Tailwind config utility rules.
- `--secondary`: Space-separated HSL components (`H S% L%`) mapped to Tailwind config utility rules.

