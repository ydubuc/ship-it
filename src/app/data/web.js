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
          c("Config is externalized from code (env vars / config service), never committed", "crit"),
          c("Separate environments: local, dev/staging, production", "crit"),
          c("Secrets live in a secret manager / vault, not in .env committed to git", "crit", "aws secrets mgr, vault, doppler, 1password"),
          c("A committed .env.example documents every required variable", "rec"),
          c("App fails fast on startup if required config is missing or malformed", "rec"),
          c("Feature flags decouple deploy from release", "rec"),
        ],
      },
      {
        title: "Build-time config",
        items: [
          c("Vite env vars (VITE_*) split per-mode; no secrets in client bundle", "crit", "anything in the bundle is public"),
          c("Different base API URLs resolve per environment automatically", "rec"),
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
          c("A consistent error model / type across the codebase", "crit"),
          c("Errors are caught at boundaries, never swallowed silently", "crit"),
          c("User-facing messages are friendly; internals (stack traces) never leak to users", "crit"),
          c("Error boundaries wrap the React tree so one component can't blank the app", "crit"),
          c("Global handler for unhandled promise rejections & window errors", "rec"),
        ],
      },
      {
        title: "Resilience patterns",
        items: [
          c("Timeouts on every outbound network call", "crit"),
          c("Retries with exponential backoff + jitter for transient failures", "rec"),
          c("Graceful degradation when a non-critical dependency is down", "rec"),
          c("Offline / poor-connectivity states handled in UI", "crit"),
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
          c("Authentication implemented with a vetted standard (OAuth2/OIDC), not hand-rolled", "crit"),
          c("Tokens stored safely — HttpOnly cookies, never localStorage for long-lived secrets", "crit"),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec"),
          c("HTTPS/TLS everywhere; HTTP redirects to HTTPS; HSTS set", "crit"),
        ],
      },
      {
        title: "Input & transport",
        items: [
          c("Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)", "crit"),
          c("Output encoding / React escaping to prevent XSS; avoid dangerouslySetInnerHTML", "crit"),
          c("CSRF protection for cookie-based auth", "rec"),
        ],
      },
      {
        title: "Supply chain & hardening",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "npm audit / dependabot"),
          c("Lockfiles committed; dependency versions pinned", "rec"),
          c("Secrets scanning prevents credentials from being committed", "rec", "gitleaks / trufflehog"),
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
          c("Log levels used meaningfully (error/warn/info/debug)", "rec"),
          c("No secrets, tokens, or PII written to logs", "crit"),
          c("Client-side breadcrumbs don't spam the console in production builds", "rec"),
        ],
      },
      {
        title: "Metrics & errors",
        items: [
          c("Crash/error reporting wired up (Sentry, etc.)", "crit"),
          c("Real User Monitoring / Core Web Vitals tracked", "rec"),
          c("Synthetic uptime checks from outside your network", "rec"),
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
          c("HTTP caching headers (Cache-Control, ETag) set deliberately", "rec"),
          c("CDN serves static assets & cacheable responses", "rec"),
        ],
      },
      {
        title: "Bundle & rendering",
        items: [
          c("Code splitting & lazy loading for routes/heavy components", "rec"),
          c("Bundle size budget enforced in CI; tree-shaking verified", "rec"),
          c("Images optimized & responsive (modern formats, lazy loaded)", "rec"),
          c("Memoization where profiling shows real wins (not premature)", "rec"),
          c("Lighthouse / Core Web Vitals meet target thresholds", "rec"),
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
          c("Client respects 429/Retry-After and backs off", "rec"),
        ],
      },
    ],
  },
  {
    id: "api",
    icon: "🔌",
    title: "API Design & Contracts",
    blurb: "Keep the frontend–backend contract explicit and versioned.",
    subs: [
      {
        title: "Contracts",
        items: [
          c("Typed client or codegen so frontend ↔ backend types can't drift", "rec"),
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
          c("User-facing strings externalized, never hardcoded in components", "rec", "i18next / react-intl"),
          c("Dates, numbers, currencies formatted via locale-aware APIs (Intl)", "rec"),
          c("Layout handles longer translations & RTL languages", "rec"),
        ],
      },
      {
        title: "Accessibility (a11y)",
        items: [
          c("Semantic HTML & ARIA where needed; meets WCAG AA", "crit"),
          c("Full keyboard navigation with visible focus states", "crit"),
          c("Color contrast passes; not relying on color alone", "rec"),
          c("Respects reduced-motion and font scaling preferences", "rec"),
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
          c("Unit tests for business logic & edge cases", "crit"),
          c("Component tests for critical flows (Testing Library / Vitest)", "rec"),
          c("End-to-end tests for the top user journeys", "rec", "playwright / cypress"),
          c("Tests run in CI and block merge on failure", "crit"),
          c("Snapshot/visual regression where UI stability matters", "rec"),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (ESLint / Prettier)", "crit"),
          c("Type checking passes with no errors (strict TypeScript)", "crit"),
          c("Coverage tracked with a sane threshold (not 100% theater)", "rec"),
          c("Pre-commit hooks catch issues before they hit CI", "rec"),
          c("Flaky tests quarantined and fixed, not ignored", "rec"),
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
          c("CI runs build + lint + test on every PR", "crit", "github actions"),
          c("Reproducible builds; dependencies locked & cached", "rec"),
          c("Automated deploy pipeline — no manual steps", "crit"),
          c("Artifacts versioned & traceable to a git SHA", "rec"),
          c("Secrets in CI come from a secret store, not plaintext yaml", "crit"),
        ],
      },
      {
        title: "Release strategy",
        items: [
          c("One-click / automated rollback path that's been tested", "crit"),
          c("Changelog / release notes generated", "rec"),
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
          c("Privacy policy & terms of service in place and linked", "crit"),
          c("Consent for tracking/analytics where required (GDPR/cookies)", "crit"),
          c("Open-source license compliance reviewed", "rec"),
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
          c("README: what it is, how to run it locally, how to deploy", "crit"),
          c("Architecture overview / decision records (ADRs)", "rec"),
          c("Onboarding gets a new dev productive in under a day", "rec"),
          c("Blameless postmortems for incidents", "rec"),
        ],
      },
    ],
  },
];
