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
          c("Config is externalized from code (env vars / config service), never committed", "crit", "Connection strings, ports, and toggles should come from the environment so the same binary runs in any environment without a rebuild."),
          c("Separate environments: local, dev/staging, production", "crit", "Distinct environments and databases mean testing can never touch production data, and a staging change can't take down prod."),
          c("Secrets live in a secret manager / vault, not in .env committed to git", "crit", "A committed .env leaks DB passwords and API keys into git history forever — keep them in a managed store and inject at runtime.", "aws secrets mgr, vault, doppler, 1password"),
          c("A committed .env.example documents every required variable", "rec", "A checked-in example with placeholders tells the next developer exactly which variables the service needs, without leaking real values."),
          c("App fails fast on startup if required config is missing or malformed", "rec", "Parse and validate all config at boot and refuse to start on error, rather than crashing on the first request that needs a missing value."),
          c("Feature flags decouple deploy from release", "rec", "Ship code behind a flag and enable it remotely — allowing gradual rollout and instant rollback without redeploying.", "unleash, launchdarkly"),
        ],
      },
      {
        title: "Build-time config",
        items: [
          c("12-factor style config via env for the service binary", "rec", "Layer config from defaults, files, and environment variables into a single typed struct loaded once at startup.", "figment / config crate"),
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
          c("A consistent error model / type across the codebase", "crit", "One error type the whole service uses makes mapping failures to HTTP responses and logs predictable instead of ad hoc.", "enum AppError { NotFound, Unauthorized, ... }"),
          c("Errors are caught at boundaries, never swallowed silently", "crit", "Don't discard a `Result` or log-and-continue past a real failure — handle it or propagate it so bugs don't hide."),
          c("User-facing messages are friendly; internals (stack traces) never leak to users", "crit", "Return a clean message and an error code; never expose stack traces, SQL, or internal paths — they confuse clients and aid attackers."),
          c("Centralized error handler maps errors → HTTP responses", "crit", "Convert your error type to the right status and body in one place so every endpoint returns consistent, correct errors.", "axum: IntoResponse on a custom AppError enum"),
          c("Use Result + thiserror for libraries, anyhow/eyre at the binary edge", "rec", "Typed errors with `thiserror` let callers match and handle specific cases; `anyhow`/`eyre` add context where you just propagate to the top."),
        ],
      },
      {
        title: "Resilience patterns",
        items: [
          c("Timeouts on every outbound network call", "crit", "A downstream service or DB that hangs will exhaust your connections and threads — bound every call with a timeout so failures stay contained.", "tower::timeout, client timeouts"),
          c("Retries with exponential backoff + jitter for transient failures", "rec", "Retry transient errors with increasing, randomized delays so a brief downstream blip recovers without a synchronized retry stampede."),
          c("Circuit breakers / bulkheads for flaky downstream dependencies", "rec", "Stop calling a failing dependency for a cooldown so you fail fast instead of piling up requests — and isolate it so it can't sink everything else."),
          c("Graceful degradation when a non-critical dependency is down", "rec", "If the recommendation service is down, return the core response without it — one optional dependency shouldn't fail the whole request."),
          c("Idempotency keys for unsafe operations that may be retried", "rec", "Let clients send a unique key so a retried payment or order is processed once, not twice, when a response is lost in transit.", "Idempotency-Key header"),
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
          c("Authentication implemented with a vetted standard (OAuth2/OIDC), not hand-rolled", "crit", "Auth has countless subtle failure modes — use a proven standard and library rather than inventing token issuance and validation yourself."),
          c("Authorization checked server-side on every protected route", "crit", "The client can be bypassed entirely — verify on the server that this user may perform this action on this specific resource, every time.", "never trust the client to enforce access"),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec", "Short-lived access tokens plus rotating, revocable refresh tokens limit the damage from a leaked token and allow forced logout."),
          c("Passwords hashed with argon2/bcrypt; never stored or logged in plaintext", "crit", "Use a slow, salted password hash so a database breach doesn't hand attackers everyone's password — and never log the raw value.", "argon2 / bcrypt"),
        ],
      },
      {
        title: "Input & transport",
        items: [
          c("All input validated & sanitized server-side against a schema", "crit", "Treat every request body, header, and query param as hostile — validate types, lengths, and ranges before use, regardless of client checks.", "serde + validator"),
          c("Parameterized queries / ORM — no string-concatenated SQL", "crit", "Building SQL by concatenating user input is the classic injection hole — use bound parameters so input can never become executable SQL.", "sqlx compile-checked queries help here"),
          c("HTTPS/TLS everywhere; HTTP redirects to HTTPS; HSTS set", "crit", "Encrypt all traffic in transit; redirect HTTP to HTTPS and set HSTS so clients refuse to ever connect in plaintext."),
          c("CORS configured to an explicit allow-list, not *", "crit", "A wildcard CORS policy lets any website call your API with the user's credentials — allow only the specific origins you trust.", "tower-http CorsLayer"),
          c("Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)", "crit", "Set protective response headers so browsers consuming your API/HTML enforce framing, MIME, and content-source restrictions."),
          c("CSRF protection for cookie-based auth", "rec", "If you authenticate with cookies, add anti-CSRF tokens or SameSite cookies so a malicious site can't make state-changing requests as the user.", "SameSite=Lax/Strict"),
        ],
      },
      {
        title: "Supply chain & hardening",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "Crates pull in transitive dependencies that ship vulnerabilities — scan on every build so a known CVE doesn't sit in production unnoticed.", "cargo audit / dependabot"),
          c("Lockfiles committed; dependency versions pinned", "rec", "A committed Cargo.lock guarantees every build and developer compiles the exact same, audited dependency versions."),
          c("Rate limiting + abuse protection on auth & public endpoints", "crit", "Without limits, login and public endpoints invite credential-stuffing, scraping, and brute force — throttle by IP/user to blunt abuse."),
          c("Secrets scanning prevents credentials from being committed", "rec", "A pre-commit/CI scan blocks a key from reaching git history, where it's effectively public the instant it's pushed.", "gitleaks / trufflehog"),
          c("Principle of least privilege on all service/cloud credentials", "rec", "Give each service only the permissions it actually needs so a compromised credential can't reach unrelated data or infrastructure."),
          c("Secrets are rotatable; rotation procedure documented & rehearsed", "rec", "When a key leaks or staff leave, you need to rotate fast — design for it and practice it so rotation isn't a frightening, untested event."),
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
          c("Schema lives in version control; migrations are reviewed code", "crit", "Define schema changes as committed, reviewed migration files so every environment applies the same changes in the same order — never hand-edit prod.", "sqlx migrate / refinery / diesel"),
          c("Migrations are forward-only and reversible/tested", "rec", "Test that migrations apply cleanly (and can be rolled back) against production-like data before they run on real users' data."),
          c("Constraints (FK, unique, not-null, checks) enforced at the DB level", "rec", "The database is the last line of defense for data integrity — encode rules as constraints so bad data can't be written even by a buggy code path."),
          c("Indexes cover hot query paths; N+1 queries identified", "rec", "Index the columns your frequent queries filter and join on, and collapse N+1 query loops, or latency degrades sharply as data grows.", "EXPLAIN ANALYZE"),
        ],
      },
      {
        title: "Integrity & lifecycle",
        items: [
          c("Automated, tested backups with a known restore procedure (RPO/RTO defined)", "crit", "Back up automatically and actually practice restoring — and know your targets for data loss (RPO) and downtime (RTO).", "an untested backup is not a backup"),
          c("Connection pooling tuned; pool exhaustion handled", "rec", "Size the pool to your DB's limits and handle the case when it's empty (queue or fail fast) so a traffic spike doesn't deadlock the service.", "sqlx pool / deadpool"),
          c("Statement / query timeouts set so runaway queries can't pin the DB", "rec", "A single slow or accidental full-table-scan query can saturate the database for everyone — cap query time so it's killed instead.", "statement_timeout"),
          c("Data retention & deletion policy implemented (GDPR/CCPA right to erasure)", "rec", "Define how long you keep each kind of data and be able to actually delete a user's data on request, including from backups over time."),
          c("PII identified, encrypted at rest, and access-audited", "crit", "Know exactly where personal data lives, encrypt it at rest, and log who accesses it — so a breach is contained and auditable."),
          c("Transactions wrap multi-step writes; partial failures roll back", "rec", "Group related writes in a transaction so a mid-operation failure leaves no half-applied state, like a debit without its matching credit."),
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
          c("Structured logging (JSON) with consistent fields, not raw println", "crit", "Machine-parseable logs with consistent fields can be searched, filtered, and aggregated by your log platform — raw prints can't.", "tracing + tracing-subscriber"),
          c("Log levels used meaningfully (error/warn/info/debug)", "rec", "Distinct levels let you keep production quiet at info while still capturing debug detail when you turn it up to investigate."),
          c("Correlation/request IDs flow through logs end-to-end", "rec", "Tag every log line in a request with a shared ID so you can trace one user's request across services when debugging.", "trace_id / request_id"),
          c("No secrets, tokens, or PII written to logs", "crit", "Logs are widely accessible and long-lived — a password or token logged once is a real, lasting leak. Redact sensitive fields."),
        ],
      },
      {
        title: "Metrics, traces & errors",
        items: [
          c("Crash/error reporting wired up (Sentry, etc.)", "crit", "Aggregated error reporting groups failures with stack traces and context so you find and fix issues without grepping raw logs.", "Sentry"),
          c("Key metrics emitted: latency, throughput, error rate, saturation (RED/USE)", "crit", "These are the vital signs of a service — without them you're blind to whether it's slow, failing, or about to fall over.", "RED / USE methods"),
          c("Distributed tracing across service boundaries", "rec", "Traces show where time goes across services for a single request, turning \"the app is slow\" into a specific slow span.", "OpenTelemetry"),
          c("Health & readiness endpoints for orchestrators", "crit", "Liveness and readiness probes let your orchestrator restart a dead instance and stop routing traffic to one that isn't ready yet.", "/health, /ready"),
          c("Dashboards exist for the golden signals", "rec", "A standing dashboard of latency, traffic, errors, and saturation lets anyone assess service health at a glance during an incident.", "Grafana"),
        ],
      },
      {
        title: "Alerting",
        items: [
          c("Alerts on SLO violations route to a human / on-call", "crit", "When the service breaches its objectives, a real person must be paged — metrics nobody is alerted on won't save you at 3am."),
          c("Alerts are actionable, not noisy (no alert fatigue)", "rec", "Every alert should mean \"a human must act now.\" Noisy, ignorable alerts train people to dismiss the one that matters."),
          c("Synthetic uptime checks from outside your network", "rec", "An external probe hitting your API on a schedule catches outages your internal metrics can't see — like a broken load balancer.", "pingdom, checkly"),
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
          c("HTTP caching headers (Cache-Control, ETag) set deliberately", "rec", "Correct cache headers let clients and proxies skip redundant requests and let you serve 304s for unchanged data, cutting load.", "Cache-Control, ETag"),
          c("Application cache for expensive computations / hot reads (e.g. Redis)", "rec", "Cache costly query results or computations so repeated hot reads come from memory instead of recomputing or hitting the DB each time.", "Redis"),
          c("Cache invalidation strategy is explicit and correct", "crit", "Stale cache serves wrong data; never invalidating it makes caching pointless — name your strategy (TTL, write-through, event-based).", "the hard problem — name a strategy"),
        ],
      },
      {
        title: "Backend performance",
        items: [
          c("Load tested against expected + peak traffic", "rec", "Find your limits before users do — load test to peak so you know where latency degrades and what your real capacity is.", "k6 / oha / vegeta"),
          c("Async I/O used correctly; no blocking calls on the async runtime", "crit", "A blocking call on an async worker thread stalls many other tasks — move CPU-heavy or blocking work off the runtime.", "tokio: spawn_blocking for CPU/blocking work"),
          c("Pagination on all list endpoints; no unbounded responses", "crit", "An endpoint that returns every row will eventually try to serialize millions and exhaust memory — always cap and paginate results.", "limit/offset or cursor pagination"),
          c("Response compression enabled (gzip/brotli)", "rec", "Compressing responses cuts bandwidth and speeds up clients on slow links for a small CPU cost.", "tower-http CompressionLayer"),
          c("Connection keep-alive / HTTP2 where it helps", "rec", "Reusing connections avoids repeated TLS handshakes; HTTP/2 multiplexing helps clients that make many concurrent requests."),
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
          c("Per-IP / per-user rate limiting on public & auth endpoints", "crit", "Caps per client stop one abuser (or buggy retry loop) from consuming all capacity and blunt brute-force and scraping attacks.", "tower-governor middleware"),
          c("429 responses return Retry-After and a clear error body", "rec", "Tell throttled clients how long to wait and why, so well-behaved clients back off correctly instead of hammering harder.", "Retry-After header"),
          c("Quotas / tiering for different client classes", "rec", "Give free, paid, and internal callers different limits so heavy users don't starve others and limits match what each tier paid for."),
          c("Request size & payload limits enforced", "crit", "Reject oversized bodies early so a giant or malicious upload can't exhaust memory or become a denial-of-service vector.", "reject huge bodies early"),
          c("Load shedding / backpressure under overload instead of collapse", "rec", "When overwhelmed, shed excess requests fast (return 503) so the service stays up for some users rather than collapsing for all."),
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
          c("Consistent resource naming, verbs, and status codes", "crit", "Predictable conventions (plural nouns, correct HTTP verbs and 2xx/4xx/5xx codes) make the API learnable and let clients handle responses uniformly."),
          c("Versioning strategy so breaking changes don't break clients", "crit", "Old clients keep calling the old contract — version the API so you can evolve it without breaking apps you don't control.", "/v1, header, or media-type versioning"),
          c("Consistent error response shape across all endpoints", "crit", "Every error should share one structure (code, message, details) so clients can parse and handle failures generically.", "RFC 7807 problem+json"),
          c("Pagination, filtering, sorting conventions are uniform", "rec", "Use the same query parameters and response envelope for these across endpoints so clients learn the pattern once."),
          c("Idempotency for POST where retries can occur", "rec", "Let clients safely retry a creating request via an idempotency key so a dropped response doesn't create duplicate records.", "Idempotency-Key header"),
        ],
      },
      {
        title: "Contracts & docs",
        items: [
          c("OpenAPI/schema spec generated and kept in sync", "rec", "A machine-readable spec generated from the code (not hand-written) stays accurate and powers docs, clients, and contract tests.", "utoipa for axum"),
          c("Typed client or codegen so frontend ↔ backend types can't drift", "rec", "Generating clients from the schema means a backend change that breaks the contract breaks the consumer's build, not production."),
          c("Contract / integration tests guard the API surface", "rec", "Tests that exercise real endpoints catch accidental breaking changes to the public contract before clients hit them."),
          c("Deprecation policy & sunset headers for retiring endpoints", "rec", "Signal upcoming removals (Sunset/Deprecation headers, docs, notice period) so consumers can migrate before an endpoint disappears.", "Sunset header"),
        ],
      },
    ],
  },
  {
    id: "jobs",
    icon: "🛠️",
    title: "Background Jobs & Async Work",
    blurb: "Work that outlives a request needs its own reliability story: queues, retries, and idempotency.",
    subs: [
      {
        title: "Async processing",
        items: [
          c("Long-running work is offloaded to background workers, not the request path", "rec", "Sending email, generating reports, or calling slow third parties inline ties up request capacity — hand it to a queue and respond fast.", "queue + worker"),
          c("Jobs are idempotent and safe to run more than once", "crit", "Queues deliver at least once, so the same job can run twice — design handlers so a re-run doesn't double-charge or duplicate work.", "at-least-once delivery is the norm"),
          c("Failed jobs retried with backoff; a dead-letter queue catches poison messages", "rec", "Retry transient failures with growing delays, but after N attempts move the job aside so one bad message doesn't loop forever or block the queue."),
          c("Scheduled / cron tasks use locking so they don't double-run across instances", "rec", "When several instances run the same scheduler, a lock or leader election ensures a nightly job fires once, not once per instance.", "advisory lock / leader election"),
          c("Queue depth, job latency & failure rate are monitored", "rec", "A silently growing backlog or rising failure rate is invisible until users notice — alert on queue health like any other vital signal."),
          c("Graceful shutdown drains or re-queues in-flight jobs", "rec", "On deploy or scale-down, let running jobs finish or return to the queue so work isn't lost or left half-done when a worker stops."),
        ],
      },
      {
        title: "Webhooks & integrations",
        items: [
          c("Inbound webhooks verify signatures before trusting the payload", "crit", "A webhook URL is publicly reachable — verify the provider's signature so an attacker can't forge events like \"payment succeeded.\"", "HMAC signature check"),
          c("Outbound webhooks / notifications retried with backoff; failures are visible", "rec", "Receivers go down — retry deliveries with backoff and surface persistent failures so a missed notification doesn't vanish silently."),
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
          c("Dates, numbers, currencies formatted via locale-aware APIs", "rec", "When the backend formats values for display, respect the requester's locale rather than hardcoding one region's conventions.", "Intl / chrono / icu"),
          c("Server returns localizable error codes, not pre-formatted English", "rec", "Return a stable machine code (and params) so the client can translate the message — don't bake English strings the client can't localize.", "{ code: \"insufficient_funds\" }"),
          c("Time zones handled correctly; store UTC, render local", "crit", "Store all timestamps in UTC and convert to local time only at the edge — mixing zones causes off-by-hours bugs and DST disasters."),
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
          c("Unit tests for business logic & edge cases", "crit", "Cover the logic that's costly to get wrong — pricing, permissions, state transitions — including empty, boundary, and error inputs."),
          c("Integration tests across real boundaries (DB, HTTP)", "crit", "Test against a real database and real HTTP layer (not just mocks) so query, serialization, and wiring bugs surface before production.", "testcontainers / sqlx test"),
          c("Tests run in CI and block merge on failure", "crit", "Tests protect you only if they run automatically on every PR and stop a red build from merging."),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (clippy / rustfmt)", "crit", "Clippy catches real correctness and performance footguns and rustfmt ends formatting debates — run both in CI as gates.", "clippy -D warnings, rustfmt"),
          c("Coverage tracked with a sane threshold (not 100% theater)", "rec", "Use coverage to spot untested critical paths, not as a vanity number — testing trivial code adds maintenance, not safety.", "cargo-llvm-cov / tarpaulin"),
          c("Pre-commit hooks catch issues before they hit CI", "rec", "Run fmt and clippy on commit so trivial failures are fixed locally in seconds rather than after a slow CI round-trip.", "lefthook / pre-commit"),
          c("Flaky tests quarantined and fixed, not ignored", "rec", "A randomly failing test trains the team to ignore red CI — isolate it, fix the root cause (often shared state or timing), then re-enable."),
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
          c("CI runs build + lint + test on every PR", "crit", "Build, clippy, and test automatically on every pull request so broken code is caught before merge, not in production.", "github actions"),
          c("Reproducible builds; dependencies locked & cached", "rec", "A committed lockfile plus cached dependencies makes builds deterministic and fast — same inputs, same binary, every time."),
          c("Automated deploy pipeline — no manual steps", "crit", "Manual deploy steps are where outages start — automate the whole path from merge to running so releases are repeatable and boring."),
          c("Artifacts versioned & traceable to a git SHA", "rec", "Tag each built image/binary with its commit so you always know exactly which code is running and can reproduce it.", "image tag = git sha"),
          c("Secrets in CI come from a secret store, not plaintext yaml", "crit", "Never commit tokens into workflow files — pull them from the CI secret store so they're masked and never land in the repo."),
        ],
      },
      {
        title: "Release strategy",
        items: [
          c("Safe rollout: blue-green, canary, or staged rollout", "rec", "Release to a slice of traffic or a parallel environment first so a bad deploy is caught on a few users, not all of them at once."),
          c("One-click / automated rollback path that's been tested", "crit", "When a deploy breaks prod, you need a fast, rehearsed way back to the last good version — don't improvise it mid-incident."),
          c("DB migrations run safely in the deploy (backward compatible)", "crit", "Make schema changes that work with both old and new code (expand-then-contract) so a deploy or rollback doesn't break running instances."),
          c("Changelog / release notes generated", "rec", "A record of what shipped in each release helps correlate behavior changes to deploys during debugging and incidents."),
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
          c("Multi-stage Dockerfile producing a slim final image", "rec", "Compile in a builder stage and copy only the binary into a tiny runtime image — smaller images pull faster and have less to attack.", "build in one stage, copy binary to distroless/scratch"),
          c("Runs as non-root user; minimal attack surface", "crit", "A container breakout as root is far worse than as an unprivileged user — drop to a non-root user and include only what you need.", "USER appuser"),
          c("Image scanned for vulnerabilities in CI", "rec", "Scan the final image for known CVEs in OS packages and dependencies so you don't ship a base layer with a critical hole.", "trivy / grype"),
          c(".dockerignore keeps build context lean", "rec", "Exclude target/, .git, and secrets from the build context so builds are faster and you don't accidentally bake sensitive files into the image."),
          c("Health checks & resource limits (cpu/mem) defined", "rec", "Declare CPU/memory limits so one container can't starve its neighbors, and a healthcheck so the orchestrator can detect and replace a sick one."),
          c("Graceful shutdown on SIGTERM; in-flight requests drained", "crit", "On SIGTERM, stop accepting new requests but finish in-flight ones before exiting so a deploy or scale-down doesn't drop live connections.", "tokio graceful shutdown + axum"),
        ],
      },
      {
        title: "Infrastructure",
        items: [
          c("Infrastructure defined as code, reviewed & versioned", "rec", "Declare servers, networks, and databases in code so environments are reproducible, auditable, and changed via review — not clicked in a console.", "terraform / pulumi / cdk"),
          c("Autoscaling configured for expected load patterns", "rec", "Scale instances up and down with demand so you handle peaks without paying for peak capacity around the clock."),
          c("Network policy / firewall: only required ports exposed", "crit", "Expose only the ports and services that must be public; everything else stays private so the attack surface stays minimal."),
          c("Disaster recovery plan documented & rehearsed", "rec", "Know and practice how you'd recover from a region outage or data loss — an untested DR plan tends to fail when you finally need it."),
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
          c("Privacy policy & terms of service in place and linked", "crit", "A reachable privacy policy and terms are legally expected and set the rules for how you handle user data."),
          c("Data processing agreements with third-party vendors", "rec", "When vendors process personal data on your behalf (analytics, email, hosting), a DPA is typically legally required under GDPR and similar laws."),
          c("Audit log for sensitive/admin actions", "rec", "Record who did what and when for privileged actions so you can investigate incidents and prove compliance.", "who, what, when"),
          c("Open-source license compliance reviewed", "rec", "Some dependency licenses impose obligations (attribution, copyleft) — review them before shipping commercially."),
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
          c("README: what it is, how to run it locally, how to deploy", "crit", "A newcomer (or you in six months) should get the service running and deployed from the README alone, without asking around."),
          c("Architecture overview / decision records (ADRs)", "rec", "Record why key choices were made (database, framework, sync vs async) so future changes don't relitigate settled decisions.", "lightweight ADR markdown files"),
          c("Runbooks for common incidents & on-call procedures", "rec", "Step-by-step guides for known failures (DB failover, queue backup) let whoever is on-call act fast at 3am without deep context."),
          c("Onboarding gets a new dev productive in under a day", "rec", "Scripted setup and clear docs let a new engineer ship a small change on day one instead of losing a week to environment issues."),
          c("API docs published for consumers", "rec", "Whoever calls your API needs current, accurate docs — endpoints, auth, examples, and errors — ideally generated from the spec.", "Swagger UI / Redoc"),
        ],
      },
      {
        title: "Operability",
        items: [
          c("On-call rotation & escalation path defined", "rec", "A clear rotation and escalation chain means someone is always responsible when something breaks, and they know who to pull in."),
          c("SLOs/SLIs defined and tracked", "rec", "Define measurable reliability targets (e.g. 99.9% availability, p99 latency) so \"is it healthy?\" has an objective, tracked answer."),
          c("Blameless postmortems for incidents", "rec", "After an outage, write up what happened and what to change — focus on the system, not blame, so the same failure doesn't recur."),
          c("Cost monitoring & budget alerts on cloud spend", "rec", "Watch cloud spend and alert on anomalies so a runaway query, leak, or misconfig doesn't become a surprise five-figure bill."),
        ],
      },
    ],
  },
];
