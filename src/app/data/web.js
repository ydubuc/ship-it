import { c } from '../utils/helpers.js';

export const profile = { id: "web", ico: "⬡", name: "Web Frontend", desc: "react · spa/ssr" };

export const sections = [
  {
    id: "config",
    icon: "⚙️",
    title: "Configuration & Environments",
    blurb: "Config should be injected, never hardcoded. Environments must be separable and reproducible.",
    subs: [
      {
        title: "Config management",
        items: [
          c("Config is externalized from code (env vars / config service), never committed", "crit", "Endpoints and toggles should come from the environment, not source — so you can change them per deploy without a code change or rebuild."),
          c("Separate environments: local, dev/staging, production", "crit", "Distinct environments mean testing against staging can never touch real users' data, and a staging experiment can't break production."),
          c("Secrets live in a secret manager / vault, not in .env committed to git", "crit", "A committed .env leaks every key into git history forever. Keep real secrets in a managed store and inject them at deploy time.", "aws secrets mgr, vault, doppler, 1password"),
          c("A committed .env.example documents every required variable", "rec", "A checked-in example (with placeholder values) tells the next developer exactly which variables to set, without leaking real ones."),
          c("App fails fast on startup if required config is missing or malformed", "rec", "Validate required config at boot and error loudly rather than failing mysteriously deep in a user flow."),
          c("Feature flags decouple deploy from release", "rec", "Ship code dark and flip features on remotely — enabling gradual rollout and instant kill switches without a redeploy.", "launchdarkly, unleash, posthog"),
        ],
      },
      {
        title: "Build-time config",
        items: [
          c("Vite env vars (VITE_*) split per-mode; no secrets in client bundle", "crit", "Anything bundled into the frontend ships to every visitor and is fully visible — only put public values in VITE_* vars, never secrets.", "anything in the bundle is public"),
          c("Different base API URLs resolve per environment automatically", "rec", "A staging build points at the staging API and prod at prod — driven by mode, with no manual URL editing before deploy."),
        ],
      },
    ],
  },
  {
    id: "errors",
    icon: "🧯",
    title: "Error Handling & Resilience",
    blurb: "Failures are expected. Decide how each layer degrades, retries, and surfaces problems.",
    subs: [
      {
        title: "Handling strategy",
        items: [
          c("A consistent error model / type across the codebase", "crit", "One predictable error shape lets you map any failure to the right UI and log it uniformly, instead of handling each ad hoc."),
          c("Errors are caught at boundaries, never swallowed silently", "crit", "An empty `catch {}` hides bugs that resurface later as confusing behavior — handle, surface, or report every error."),
          c("User-facing messages are friendly; internals (stack traces) never leak to users", "crit", "Show \"Something went wrong — try again,\" not a raw exception. Stack traces confuse users and reveal implementation details to attackers."),
          c("Error boundaries wrap the React tree so one component can't blank the app", "crit", "An unhandled render error unmounts the whole React tree to a white screen — an error boundary contains the failure to one region.", "<ErrorBoundary> / react-error-boundary"),
          c("Global handler for unhandled promise rejections & window errors", "rec", "Catch what slips past local try/catch so it's logged to your error reporter instead of vanishing into the console.", "window.onerror / onunhandledrejection"),
        ],
      },
      {
        title: "Resilience & UX states",
        items: [
          c("Timeouts on every outbound network call", "crit", "Without a timeout a hung request leaves a spinner forever on a flaky connection — set a deadline and fail into a retry state.", "AbortController + setTimeout"),
          c("Every async view has explicit loading, empty, and error states", "crit", "Design all four states — loading, empty, error, success — so users never stare at a blank area or a spinner that never resolves."),
          c("Offline / poor-connectivity states handled in UI", "crit", "Detect offline and show a clear message or cached data instead of a stream of silent failures the user can't interpret.", "navigator.onLine / offline event"),
          c("Retries with exponential backoff + jitter for transient failures", "rec", "Retry transient errors a couple of times with increasing, randomized delays so a brief blip recovers without hammering the server."),
          c("Optimistic updates roll back cleanly on failure", "rec", "If you update the UI before the server confirms, revert to the prior state and tell the user when the request fails."),
          c("Graceful degradation when a non-critical dependency is down", "rec", "If the recommendations widget fails, still render the page — one optional service shouldn't take the whole view down."),
        ],
      },
    ],
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Security",
    blurb: "Assume hostile input and a hostile network. Defense in depth across every layer.",
    subs: [
      {
        title: "AuthN / AuthZ",
        items: [
          c("Authentication implemented with a vetted standard (OAuth2/OIDC), not hand-rolled", "crit", "Auth has countless subtle failure modes. Use a proven provider or library rather than inventing your own login and session logic.", "Auth0, Clerk, NextAuth"),
          c("Tokens stored safely — HttpOnly cookies, never localStorage for long-lived secrets", "crit", "Any XSS can read localStorage and steal a token there. HttpOnly cookies are invisible to JavaScript, shrinking the attack surface."),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec", "Short-lived tokens plus rotating refresh tokens limit damage from a stolen token and let you force-logout a compromised session."),
          c("HTTPS/TLS everywhere; HTTP redirects to HTTPS; HSTS set", "crit", "Plain HTTP can be read and tampered with in transit. Redirect all HTTP to HTTPS and set HSTS so browsers refuse to downgrade.", "Strict-Transport-Security header"),
        ],
      },
      {
        title: "Input & transport",
        items: [
          c("Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)", "crit", "A strong Content-Security-Policy blocks injected scripts; X-Frame-Options stops clickjacking; X-Content-Type-Options stops MIME sniffing.", "securityheaders.com to verify"),
          c("Output encoding / React escaping to prevent XSS; avoid dangerouslySetInnerHTML", "crit", "React escapes values by default, which prevents most XSS — `dangerouslySetInnerHTML` bypasses that and reintroduces the risk."),
          c("Any HTML you must inject is sanitized first", "rec", "If you truly must render user/third-party HTML, run it through a sanitizer to strip scripts and event handlers before insertion.", "DOMPurify"),
          c("CSRF protection for cookie-based auth", "rec", "Cookies are sent automatically with cross-site requests — use anti-CSRF tokens or SameSite cookies so other sites can't act as the user.", "SameSite=Lax/Strict"),
          c("Third-party scripts vetted; Subresource Integrity on external assets", "rec", "Every external script can run as you on your page — minimize them and pin a hash (SRI) so a hacked CDN can't swap in malicious code.", "integrity=\"sha384-...\""),
        ],
      },
      {
        title: "Supply chain & hardening",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "The npm tree is huge and a frequent attack vector — scan automatically so a known vulnerability doesn't ship unnoticed.", "npm audit / dependabot"),
          c("Lockfiles committed; dependency versions pinned", "rec", "A committed lockfile guarantees every install and build resolves the exact same, audited dependency versions."),
          c("Secrets scanning prevents credentials from being committed", "rec", "A pre-commit/CI scan stops an API key from reaching git history, where it's effectively public the moment it's pushed.", "gitleaks / trufflehog"),
        ],
      },
    ],
  },
  {
    id: "data",
    icon: "🗄️",
    title: "Client Data & State",
    blurb: "The browser is an untrusted, shared device. Manage server state deliberately and store little.",
    subs: [
      {
        title: "Server state",
        items: [
          c("Server state handled by a caching data layer, not ad-hoc fetch-in-effect", "rec", "A data library gives you caching, dedup, retries, and loading/error states for free — hand-rolled useEffect fetching reinvents all of it, buggily.", "react query / swr / rtk query"),
          c("Cache invalidation & refetch strategy is explicit", "rec", "Decide when cached data is refetched (on focus, on mutation, on interval) so users don't act on stale data or see needless reloads."),
          c("Requests cancelled on unmount / navigation to avoid races & leaks", "rec", "Cancel in-flight requests when a component unmounts so a late response can't update a gone component or overwrite newer data.", "AbortController"),
        ],
      },
      {
        title: "Client storage & forms",
        items: [
          c("No sensitive data persisted in localStorage / IndexedDB", "crit", "Browser storage is readable by any script on the page and persists across sessions — never put tokens or personal data there."),
          c("Forms have client-side validation with accessible error messaging", "rec", "Validate inline for fast feedback, and tie errors to fields (aria-describedby) so screen-reader users hear what's wrong — but always re-validate server-side."),
          c("Unsaved-changes / navigation-away protection where data loss matters", "rec", "Warn before the user navigates or closes a tab with unsaved edits so a long form isn't lost to a stray click.", "beforeunload / router blocker"),
        ],
      },
    ],
  },
  {
    id: "observability",
    icon: "📡",
    title: "Logging & Observability",
    blurb: "If you can't see it in production, you can't fix it. Logs, errors, and real-user data.",
    subs: [
      {
        title: "Logging",
        items: [
          c("Log levels used meaningfully (error/warn/info/debug)", "rec", "Distinct levels let you separate real problems from noise when triaging — not everything is an error."),
          c("No secrets, tokens, or PII written to logs", "crit", "Anything logged in the browser is visible in the console and may be shipped to your log service — keep secrets and personal data out."),
          c("Client-side breadcrumbs don't spam the console in production builds", "rec", "Strip debug `console.log` from production so the console stays clean for real diagnostics and you don't leak internals."),
        ],
      },
      {
        title: "Metrics & errors",
        items: [
          c("Crash/error reporting wired up (Sentry, etc.)", "crit", "You can't watch every user's browser — automated reporting tells you what's actually breaking in the field, with stack traces and context.", "Sentry / Rollbar"),
          c("Source maps uploaded so production stack traces are readable", "rec", "Minified bundles produce useless stack traces — upload source maps to your error tool so errors point to real files and lines."),
          c("Real User Monitoring / Core Web Vitals tracked", "rec", "Measure actual users' load and interaction speed (LCP, CLS, INP), not just your fast dev machine, to catch real-world slowness.", "web-vitals, RUM"),
          c("Synthetic uptime checks from outside your network", "rec", "An external probe hitting your site on a schedule alerts you to outages before users tweet about them.", "pingdom, checkly"),
        ],
      },
    ],
  },
  {
    id: "perf",
    icon: "⚡",
    title: "Performance & Caching",
    blurb: "Fast is a feature. Measure, set budgets, and cache the right things.",
    subs: [
      {
        title: "Caching",
        items: [
          c("HTTP caching headers (Cache-Control, ETag) set deliberately", "rec", "The right headers let browsers and CDNs skip refetching unchanged resources — set long caches for hashed assets, short or none for HTML.", "Cache-Control, ETag"),
          c("CDN serves static assets & cacheable responses", "rec", "A CDN serves files from an edge near each user, cutting latency and offloading your origin server.", "Cloudflare, Fastly, CloudFront"),
          c("Content-hashed filenames enable long-cache + safe cache-busting", "rec", "Hashing the content into the filename lets you cache assets forever, while a new deploy gets a new name so users never see stale code.", "app.a1b2c3.js"),
        ],
      },
      {
        title: "Bundle & rendering",
        items: [
          c("Code splitting & lazy loading for routes/heavy components", "rec", "Split the bundle so users download only what the current page needs, not the whole app up front — faster first load.", "React.lazy + dynamic import"),
          c("Bundle size budget enforced in CI; tree-shaking verified", "rec", "Set a size budget and fail the build if it's exceeded so the bundle doesn't quietly bloat release after release.", "size-limit, bundlephobia"),
          c("Images optimized & responsive (modern formats, lazy loaded)", "rec", "Images are usually the heaviest assets — serve AVIF/WebP at the right size and lazy-load off-screen ones to cut load time and data.", "loading=\"lazy\", srcset"),
          c("Fonts preloaded with font-display set to avoid invisible text (FOIT)", "rec", "Preload key fonts and use `font-display: swap` so text shows immediately in a fallback instead of being invisible until the font loads."),
          c("Memoization where profiling shows real wins (not premature)", "rec", "Add memo/useMemo only where the profiler proves a real bottleneck — sprinkling it everywhere adds complexity for no measurable gain.", "React DevTools Profiler"),
          c("Lighthouse / Core Web Vitals meet target thresholds (LCP, CLS, INP)", "rec", "Track the metrics Google ranks on and users feel: load (LCP), layout stability (CLS), responsiveness (INP) — and set passing targets."),
        ],
      },
    ],
  },
  {
    id: "ratelimit",
    icon: "🚦",
    title: "Rate Limiting & Abuse Protection",
    blurb: "Respect server limits gracefully; back off when asked.",
    subs: [
      {
        title: "Client behavior",
        items: [
          c("Client respects 429/Retry-After and backs off", "rec", "When the server returns \"too many requests,\" wait the Retry-After interval instead of retrying instantly and worsening the overload."),
          c("High-frequency inputs debounced / throttled (search, scroll, resize)", "rec", "Don't fire a request on every keystroke or scroll tick — debounce/throttle so you send one request after activity settles.", "debounce ~300ms"),
        ],
      },
    ],
  },
  {
    id: "api",
    icon: "🔌",
    title: "API Design & Contracts",
    blurb: "Keep the frontend–backend contract explicit, typed, and resilient to drift.",
    subs: [
      {
        title: "Contracts",
        items: [
          c("Typed client or codegen so frontend ↔ backend types can't drift", "rec", "Generate the API client/types from the backend schema so a field rename breaks the build at compile time, not silently at runtime.", "openapi-typescript, tRPC, GraphQL codegen"),
          c("API errors mapped to typed client errors and matching UI states", "rec", "Translate HTTP/error responses into known client error types so each (401, 404, 500, validation) drives the right UI instead of a generic failure."),
        ],
      },
    ],
  },
  {
    id: "seo",
    icon: "🔎",
    title: "SEO & Discoverability",
    blurb: "If search engines and link previews can't read it, it doesn't exist. (Skip if app is behind auth.)",
    subs: [
      {
        title: "Crawlability & metadata",
        items: [
          c("404 / not-found route returns the correct status and a usable page", "crit", "A missing page must return HTTP 404 (not 200 with empty content) so search engines drop it — and show users a helpful page with a way back."),
          c("Per-page title & meta description set", "rec", "Each page needs its own descriptive title and meta description — they're the headline and snippet in search results and browser tabs."),
          c("Open Graph / Twitter card tags for rich link sharing", "rec", "OG tags control the title, description, and image shown when a link is shared on social or chat — without them, shares look broken.", "og:title, og:image"),
          c("Canonical URLs set; no duplicate-content ambiguity", "rec", "A canonical tag tells search engines which URL is the real one when the same content is reachable via several paths or query params.", "<link rel=\"canonical\">"),
          c("robots.txt and sitemap.xml present and correct", "rec", "robots.txt guides crawlers on what to index, and a sitemap helps them discover all your pages — especially deep or new ones."),
          c("Structured data / JSON-LD where relevant", "rec", "Schema.org markup powers rich results (ratings, prices, breadcrumbs, FAQs) that make your listing stand out in search.", "schema.org JSON-LD"),
          c("SSR / SSG / prerender so crawlers receive real content", "rec", "A client-only SPA can serve an empty shell to crawlers and link unfurlers — render content on the server or prerender it if SEO matters.", "Next.js, Astro, prerender"),
        ],
      },
    ],
  },
  {
    id: "i18n",
    icon: "🌐",
    title: "Localization & Accessibility",
    blurb: "Reach more people. Externalize strings, respect locale, and meet accessibility standards.",
    subs: [
      {
        title: "Localization",
        items: [
          c("User-facing strings externalized, never hardcoded in components", "rec", "Keeping copy in translation files lets you localize without touching components and keeps wording consistent and reviewable.", "i18next / react-intl"),
          c("Dates, numbers, currencies formatted via locale-aware APIs (Intl)", "rec", "Formats differ by region (1,000.50 vs 1.000,50, date order, currency symbols) — let the platform format for the user's locale.", "Intl.DateTimeFormat / NumberFormat"),
          c("Layout handles longer translations & RTL languages", "rec", "Translated text can be far longer, and Arabic/Hebrew flow right-to-left — use flexible layouts and logical CSS properties so UI doesn't break.", "dir=\"rtl\", margin-inline"),
        ],
      },
      {
        title: "Accessibility (a11y)",
        items: [
          c("Semantic HTML & ARIA where needed; meets WCAG AA", "crit", "Use real buttons, headings, and landmarks so assistive tech understands the page; add ARIA only to fill gaps native HTML can't.", "WCAG 2.1 AA"),
          c("Full keyboard navigation with visible focus states", "crit", "Every interactive element must be reachable and operable by keyboard alone, with a clear focus ring — many users never touch a mouse.", ":focus-visible"),
          c("Color contrast passes; not relying on color alone", "rec", "Meet contrast ratios for text, and pair color cues with text or icons so low-vision and color-blind users aren't excluded.", "4.5:1 for body text"),
          c("Respects reduced-motion and font scaling preferences", "rec", "Honor `prefers-reduced-motion` for users prone to motion sickness, and use relative units so browser zoom/text scaling doesn't break layout.", "@media (prefers-reduced-motion)"),
        ],
      },
    ],
  },
  {
    id: "testing",
    icon: "🧪",
    title: "Testing & Quality",
    blurb: "Tests are how you change code without fear. Cover the layers that matter.",
    subs: [
      {
        title: "Test coverage",
        items: [
          c("Unit tests for business logic & edge cases", "crit", "Cover the logic that's costly to get wrong — calculations, parsing, validation — including empty, null, and boundary inputs.", "Vitest / Jest"),
          c("Component tests for critical flows (Testing Library / Vitest)", "rec", "Test components the way users interact (click, type, read) rather than implementation details, so refactors don't break the tests.", "@testing-library/react"),
          c("End-to-end tests for the top user journeys", "rec", "Automate the few make-or-break flows (sign-up, checkout) in a real browser so a release can't silently break revenue paths.", "playwright / cypress"),
          c("Tests run in CI and block merge on failure", "crit", "Tests only protect you if they run on every PR and stop a red build from merging — local-only tests get skipped under pressure."),
          c("Snapshot/visual regression where UI stability matters", "rec", "Visual diffs catch unintended layout and style changes that logic tests miss — useful for design systems and key screens.", "Chromatic / Percy"),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (ESLint / Prettier)", "crit", "Automated linting and formatting end style debates and catch real bugs (unused vars, missing deps) before code review.", "ESLint / Prettier"),
          c("Type checking passes with no errors (strict TypeScript)", "crit", "Strict TypeScript catches whole classes of bugs at compile time — run `tsc --noEmit` in CI and treat type errors as build failures.", "strict: true"),
          c("Supported browser matrix defined and tested", "rec", "Decide which browsers/versions you support and test them — a feature that works in Chrome may silently break in Safari.", "browserslist"),
          c("Coverage tracked with a sane threshold (not 100% theater)", "rec", "Track coverage to find untested critical paths, but don't chase 100% — testing trivial code adds noise, not safety."),
          c("Pre-commit hooks catch issues before they hit CI", "rec", "Run lint and format on commit so trivial failures are fixed locally in seconds, not after a slow CI round-trip.", "husky + lint-staged"),
          c("Flaky tests quarantined and fixed, not ignored", "rec", "A randomly failing test teaches the team to ignore red builds — isolate it, fix the cause, then bring it back."),
        ],
      },
    ],
  },
  {
    id: "build",
    icon: "🏗️",
    title: "Build, CI/CD & Release",
    blurb: "Shipping should be boring, automated, and reversible.",
    subs: [
      {
        title: "Pipeline",
        items: [
          c("CI runs build + lint + test on every PR", "crit", "Build, lint, and test automatically on every pull request so broken code is caught before merge, not discovered in production.", "github actions"),
          c("Reproducible builds; dependencies locked & cached", "rec", "Pinned versions plus caching make builds deterministic and fast — identical inputs always produce identical output."),
          c("Automated deploy pipeline — no manual steps", "crit", "Manual deploy steps are where mistakes happen — automate the whole path from merge to live so releases are repeatable and boring."),
          c("Per-PR preview / staging deploys for review", "rec", "A live preview URL per pull request lets reviewers and designers click through the actual change before it merges.", "Vercel/Netlify previews"),
          c("Artifacts versioned & traceable to a git SHA", "rec", "Every deployed build should map to the exact commit it came from, so you can reproduce and debug precisely what's live."),
          c("Secrets in CI come from a secret store, not plaintext yaml", "crit", "Never paste tokens into workflow files — pull them from the CI secret store so they're masked and not committed to the repo.", "GitHub Actions secrets"),
        ],
      },
      {
        title: "Release strategy",
        items: [
          c("One-click / automated rollback path that's been tested", "crit", "When a deploy breaks production, you need a fast, rehearsed way back to the last good version — don't improvise during an incident."),
          c("Changelog / release notes generated", "rec", "A running record of what shipped in each release helps users, support, and your own team correlate changes to behavior."),
        ],
      },
    ],
  },
  {
    id: "privacy",
    icon: "⚖️",
    title: "Privacy, Legal & Compliance",
    blurb: "The non-code obligations that still ship with the product.",
    subs: [
      {
        title: "Compliance",
        items: [
          c("Privacy policy & terms of service in place and linked", "crit", "A reachable privacy policy and terms are legally expected and build trust — link them in the footer and at sign-up."),
          c("Consent for tracking/analytics where required (GDPR/cookies)", "crit", "In the EU and similar regimes you must get opt-in consent before setting non-essential cookies or tracking — not just a notice banner."),
          c("Non-essential scripts/cookies blocked until consent is given", "rec", "Don't load analytics or ad scripts until the user actually consents — loading them first and asking after defeats the legal purpose.", "consent mode / CMP"),
          c("Open-source license compliance reviewed", "rec", "Some dependency licenses require attribution or impose conditions — review them before shipping commercially."),
        ],
      },
    ],
  },
  {
    id: "docs",
    icon: "📚",
    title: "Documentation & Operability",
    blurb: "The team (including future-you) needs to run, debug, and onboard without tribal knowledge.",
    subs: [
      {
        title: "Docs",
        items: [
          c("README: what it is, how to run it locally, how to deploy", "crit", "A newcomer (or you in six months) should get the app running and deployed from the README alone, without asking around."),
          c("Architecture overview / decision records (ADRs)", "rec", "Record why key choices were made (framework, state management, rendering strategy) so future changes don't relitigate settled ground.", "lightweight ADR markdown files"),
          c("Onboarding gets a new dev productive in under a day", "rec", "Scripted setup and clear docs let a new engineer ship a small change on day one instead of losing a week to environment issues."),
          c("Blameless postmortems for incidents", "rec", "After an outage, write up what happened and what to fix — focus on the system, not blame, so the same failure doesn't recur."),
        ],
      },
    ],
  },
];
