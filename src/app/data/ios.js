import { c } from '../utils/helpers.js';

export const profile = { id: "ios", ico: "⌘", name: "iOS Mobile App", desc: "swift · native" };

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
          c("Secrets live in a secret manager / vault, not in .env committed to git", "crit", "keychain, doppler, 1password"),
          c("App fails fast on startup if required config is missing or malformed", "rec"),
          c("Feature flags decouple deploy from release", "rec"),
        ],
      },
      {
        title: "Build-time config",
        items: [
          c("Build configs (.xcconfig) per scheme: Debug / Staging / Release", "rec"),
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
          c("User-facing messages are friendly; internals never leak to users", "crit"),
          c("Swift errors typed; no force-unwraps in production paths", "crit", "avoid try! and ! on optionals"),
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
    blurb: "Assume hostile input and a hostile network. Defense in depth.",
    subs: [
      {
        title: "AuthN / AuthZ",
        items: [
          c("Authentication implemented with a vetted standard (OAuth2/OIDC), not hand-rolled", "crit"),
          c("Tokens stored in Keychain, never in UserDefaults or plain storage", "crit"),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec"),
          c("HTTPS/TLS everywhere; no cleartext traffic", "crit"),
          c("Certificate pinning for sensitive mobile APIs", "rec"),
        ],
      },
      {
        title: "Supply chain & hardening",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "swift package audit"),
          c("Lockfiles committed; dependency versions pinned", "rec"),
          c("Secrets scanning prevents credentials from being committed", "rec", "gitleaks / trufflehog"),
          c("App Transport Security enforced; no arbitrary loads exception", "rec"),
        ],
      },
    ],
  },
  {
    id: "data",
    icon: "🗄️",
    title: "Data & Persistence",
    blurb: "Local data outlives app updates. Plan for migrations from day one.",
    subs: [
      {
        title: "Local storage",
        items: [
          c("Local persistence has a migration story (Core Data / SwiftData / SQLite)", "rec"),
        ],
      },
    ],
  },
  {
    id: "observability",
    icon: "📡",
    title: "Logging & Observability",
    blurb: "If you can't see it in production, you can't fix it.",
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
        title: "Crash & error reporting",
        items: [
          c("Crash reporting wired up (Crashlytics, Sentry, etc.)", "crit"),
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
        title: "Device performance",
        items: [
          c("Image & list caching on device; avoid re-downloading", "rec"),
          c("Smooth 60fps scrolling; main thread work kept off the UI thread", "rec"),
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
    id: "i18n",
    icon: "🌐",
    title: "Localization & Accessibility",
    blurb: "Reach more people. Externalize strings, respect locale, and meet accessibility standards.",
    subs: [
      {
        title: "Localization",
        items: [
          c("User-facing strings externalized via String Catalogs, never hardcoded", "rec"),
          c("Dates, numbers, currencies formatted via locale-aware APIs (NSNumberFormatter)", "rec"),
          c("Layout handles longer translations & RTL languages", "rec"),
        ],
      },
      {
        title: "Accessibility (a11y)",
        items: [
          c("VoiceOver / screen-reader labels on all interactive elements", "rec"),
          c("Color contrast passes; not relying on color alone", "rec"),
          c("Respects Dynamic Type / font scaling", "rec"),
          c("Respects reduced-motion preferences", "rec"),
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
          c("Unit tests for business logic & edge cases (XCTest)", "crit"),
          c("UI tests for critical flows (XCUITest)", "rec"),
          c("Tests run in CI and block merge on failure", "crit"),
          c("Snapshot/visual regression where UI stability matters", "rec"),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (SwiftLint)", "crit"),
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
          c("CI runs build + lint + test on every PR", "crit", "xcode cloud / github actions"),
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
          c("Staged App Store rollout + phased release", "rec"),
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
          c("App privacy nutrition labels & ATT prompt filled accurately", "crit"),
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
