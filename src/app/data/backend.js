import { c } from '../utils/helpers.js';

export const profile = { id: "backend", ico: "⬢", name: "Backend / API", desc: "rust · axum · rest" };

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
          c("12-factor style config via env for the service binary", "rec", "figment / config crate for layered config"),
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
          c("Centralized error handler maps errors → HTTP responses", "crit", "axum: IntoResponse on a custom AppError enum"),
          c("Use Result + thiserror for libraries, anyhow/eyre at the binary edge", "rec"),
        ],
      },
      {
        title: "Resilience patterns",
        items: [
          c("Timeouts on every outbound network call", "crit"),
          c("Retries with exponential backoff + jitter for transient failures", "rec"),
          c("Circuit breakers / bulkheads for flaky downstream dependencies", "rec"),
          c("Graceful degradation when a non-critical dependency is down", "rec"),
          c("Idempotency keys for unsafe operations that may be retried", "rec"),
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
          c("Authorization checked server-side on every protected route", "crit", "never trust the client to enforce access"),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec"),
          c("Passwords hashed with argon2/bcrypt; never stored or logged in plaintext", "crit"),
        ],
      },
      {
        title: "Input & transport",
        items: [
          c("All input validated & sanitized server-side against a schema", "crit"),
          c("Parameterized queries / ORM — no string-concatenated SQL", "crit", "sqlx compile-checked queries help here"),
          c("HTTPS/TLS everywhere; HTTP redirects to HTTPS; HSTS set", "crit"),
          c("CORS configured to an explicit allow-list, not *", "crit"),
          c("Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)", "crit"),
          c("CSRF protection for cookie-based auth", "rec"),
        ],
      },
      {
        title: "Supply chain & hardening",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "cargo audit / dependabot"),
          c("Lockfiles committed; dependency versions pinned", "rec"),
          c("Rate limiting + abuse protection on auth & public endpoints", "crit"),
          c("Secrets scanning prevents credentials from being committed", "rec", "gitleaks / trufflehog"),
          c("Principle of least privilege on all service/cloud credentials", "rec"),
        ],
      },
    ],
  },
  {
    id: "data",
    icon: "🗄️",
    title: "Data & Persistence",
    blurb: "Your data outlives your code. Migrations, integrity, and backups are not optional.",
    subs: [
      {
        title: "Schema & migrations",
        items: [
          c("Schema lives in version control; migrations are reviewed code", "crit", "sqlx migrate / refinery / diesel"),
          c("Migrations are forward-only and reversible/tested", "rec"),
          c("Constraints (FK, unique, not-null, checks) enforced at the DB level", "rec"),
          c("Indexes cover hot query paths; N+1 queries identified", "rec"),
        ],
      },
      {
        title: "Integrity & lifecycle",
        items: [
          c("Automated, tested backups with a known restore procedure (RPO/RTO defined)", "crit", "an untested backup is not a backup"),
          c("Connection pooling tuned; pool exhaustion handled", "rec"),
          c("Data retention & deletion policy implemented (GDPR/CCPA right to erasure)", "rec"),
          c("PII identified, encrypted at rest, and access-audited", "crit"),
          c("Transactions wrap multi-step writes; partial failures roll back", "rec"),
        ],
      },
    ],
  },
  {
    id: "observability",
    icon: "📡",
    title: "Logging & Observability",
    blurb: "If you can't see it in production, you can't fix it. Logs, metrics, traces, and alerts.",
    subs: [
      {
        title: "Logging",
        items: [
          c("Structured logging (JSON) with consistent fields, not raw println", "crit", "tracing + tracing-subscriber"),
          c("Log levels used meaningfully (error/warn/info/debug)", "rec"),
          c("Correlation/request IDs flow through logs end-to-end", "rec"),
          c("No secrets, tokens, or PII written to logs", "crit"),
        ],
      },
      {
        title: "Metrics, traces & errors",
        items: [
          c("Crash/error reporting wired up (Sentry, etc.)", "crit"),
          c("Key metrics emitted: latency, throughput, error rate, saturation (RED/USE)", "crit"),
          c("Distributed tracing across service boundaries", "rec", "OpenTelemetry"),
          c("Health & readiness endpoints for orchestrators", "crit", "/health, /ready"),
          c("Dashboards exist for the golden signals", "rec"),
        ],
      },
      {
        title: "Alerting",
        items: [
          c("Alerts on SLO violations route to a human / on-call", "crit"),
          c("Alerts are actionable, not noisy (no alert fatigue)", "rec"),
          c("Synthetic uptime checks from outside your network", "rec"),
        ],
      },
    ],
  },
  {
    id: "perf",
    icon: "⚡",
    title: "Performance & Caching",
    blurb: "Fast is a feature. Measure, set budgets, and cache the right things at the right layers.",
    subs: [
      {
        title: "Caching",
        items: [
          c("HTTP caching headers (Cache-Control, ETag) set deliberately", "rec"),
          c("Application cache for expensive computations / hot reads (e.g. Redis)", "rec"),
          c("Cache invalidation strategy is explicit and correct", "crit", "the hard problem — name a strategy"),
        ],
      },
      {
        title: "Backend performance",
        items: [
          c("Load tested against expected + peak traffic", "rec", "k6 / oha / vegeta"),
          c("Async I/O used correctly; no blocking calls on the async runtime", "crit", "tokio: spawn_blocking for CPU/blocking work"),
          c("Pagination on all list endpoints; no unbounded responses", "crit"),
          c("Response compression enabled (gzip/brotli)", "rec"),
          c("Connection keep-alive / HTTP2 where it helps", "rec"),
        ],
      },
    ],
  },
  {
    id: "ratelimit",
    icon: "🚦",
    title: "Rate Limiting & Abuse Protection",
    blurb: "Protect capacity and fairness. Throttle, quota, and shed load before you fall over.",
    subs: [
      {
        title: "Limits",
        items: [
          c("Per-IP / per-user rate limiting on public & auth endpoints", "crit", "tower-governor middleware"),
          c("429 responses return Retry-After and a clear error body", "rec"),
          c("Quotas / tiering for different client classes", "rec"),
          c("Request size & payload limits enforced", "crit", "reject huge bodies early"),
          c("Load shedding / backpressure under overload instead of collapse", "rec"),
        ],
      },
    ],
  },
  {
    id: "api",
    icon: "🔌",
    title: "API Design & Contracts",
    blurb: "A REST API is a public contract. Make it consistent, versioned, and documented.",
    subs: [
      {
        title: "Design",
        items: [
          c("Consistent resource naming, verbs, and status codes", "crit"),
          c("Versioning strategy so breaking changes don't break clients", "crit", "/v1, header, or media-type versioning"),
          c("Consistent error response shape across all endpoints", "crit"),
          c("Pagination, filtering, sorting conventions are uniform", "rec"),
          c("Idempotency for POST where retries can occur", "rec"),
        ],
      },
      {
        title: "Contracts & docs",
        items: [
          c("OpenAPI/schema spec generated and kept in sync", "rec", "utoipa for axum"),
          c("Typed client or codegen so frontend ↔ backend types can't drift", "rec"),
          c("Contract / integration tests guard the API surface", "rec"),
          c("Deprecation policy & sunset headers for retiring endpoints", "rec"),
        ],
      },
    ],
  },
  {
    id: "i18n",
    icon: "🌐",
    title: "Localization & Accessibility",
    blurb: "Reach more people. Externalize strings, respect locale, and handle time zones correctly.",
    subs: [
      {
        title: "Localization",
        items: [
          c("Dates, numbers, currencies formatted via locale-aware APIs", "rec", "Intl / chrono"),
          c("Server returns localizable error codes, not pre-formatted English", "rec"),
          c("Time zones handled correctly; store UTC, render local", "crit"),
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
          c("Integration tests across real boundaries (DB, HTTP)", "crit"),
          c("Tests run in CI and block merge on failure", "crit"),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (clippy / rustfmt)", "crit"),
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
          c("Safe rollout: blue-green, canary, or staged rollout", "rec"),
          c("One-click / automated rollback path that's been tested", "crit"),
          c("DB migrations run safely in the deploy (backward compatible)", "crit"),
          c("Changelog / release notes generated", "rec"),
        ],
      },
    ],
  },
  {
    id: "containers",
    icon: "📦",
    title: "Containerization & Infrastructure",
    blurb: "Package once, run anywhere, define infrastructure as code.",
    subs: [
      {
        title: "Containers",
        items: [
          c("Multi-stage Dockerfile producing a slim final image", "rec", "build in one stage, copy binary to distroless/scratch"),
          c("Runs as non-root user; minimal attack surface", "crit"),
          c("Image scanned for vulnerabilities in CI", "rec", "trivy / grype"),
          c(".dockerignore keeps build context lean", "rec"),
          c("Health checks & resource limits (cpu/mem) defined", "rec"),
          c("Graceful shutdown on SIGTERM; in-flight requests drained", "crit", "tokio graceful shutdown + axum"),
        ],
      },
      {
        title: "Infrastructure",
        items: [
          c("Infrastructure defined as code, reviewed & versioned", "rec", "terraform / pulumi / cdk"),
          c("Autoscaling configured for expected load patterns", "rec"),
          c("Network policy / firewall: only required ports exposed", "crit"),
          c("Disaster recovery plan documented & rehearsed", "rec"),
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
          c("Data processing agreements with third-party vendors", "rec"),
          c("Audit log for sensitive/admin actions", "rec"),
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
          c("Runbooks for common incidents & on-call procedures", "rec"),
          c("Onboarding gets a new dev productive in under a day", "rec"),
          c("API docs published for consumers", "rec"),
        ],
      },
      {
        title: "Operability",
        items: [
          c("On-call rotation & escalation path defined", "rec"),
          c("SLOs/SLIs defined and tracked", "rec"),
          c("Blameless postmortems for incidents", "rec"),
          c("Cost monitoring & budget alerts on cloud spend", "rec"),
        ],
      },
    ],
  },
];
