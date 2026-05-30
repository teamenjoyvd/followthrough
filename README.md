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

---

## 🛠️ Developer Infrastructure (Agentic v2)

This repository includes the **Agentic v2 developer framework**, providing structured co-development workflows, safe automated rules validation, pre-commit compliance, and context-handoff tools.

### 🏃 Core Commands

You can run these scripts to manage workspace setup, quality assurance, and deployments:

| Command | Purpose | When to Run |
| :--- | :--- | :--- |
| `npm run agentic:bootstrap` | Runs interactive setup wizard for configs, secrets, & git hooks | After a fresh clone or when resetup is needed |
| `npm run agentic:validate` | Validates migration rollbacks, RLS compliance, and checks for secret leaks | Before making a commit or submitting a PR |
| `npm run agentic:handoff` | Generates a state summary of the active branch/tasks to clipboard | When context is full or handing off sessions |
| `npm run agentic:smoke` | Hits core staging/production routes and checks response codes | Directly after deploying changes |

### 🤖 AI Co-development Recipes

If you are pair-programming with AI coding assistants (like Cursor, Claude.ai, or Antigravity), they are trained to recognize short prompt triggers. 

*   **`SSU` (System Startup)**: Paste at session start to initialize the AI's understanding of this project's rules, schemas, and active tasks.
*   **`PLAN`**: Paste before starting any coding task to draft an isolated, safe implementation plan.
*   **`BUILD`**: Paste after planning is approved to start executing the edits safely.

See the complete prompt templates in [docs/ai/PROMPTS.md](docs/ai/PROMPTS.md).

### 📂 Directory Map
*   `.cursor/rules/`: Cursor system-level rules (`auth.mdc`, `database.mdc`, `frontend.mdc`, `general.mdc`) to keep AI assistants strictly aligned with our architectural principles.
*   `docs/ai/RULES.md`: Master design guidelines, RLS principles, and migration workflow policies.
*   `docs/ai/DECISIONS.md`: The living architecture decision log (ADR).
*   `docs/ai/MIGRATIONS.md`: Applied migration log & runbook.

