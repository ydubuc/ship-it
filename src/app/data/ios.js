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
          c("Config is externalized from code, never committed", "crit", "Endpoints, keys, and toggles should come from build settings or a config service so you can change them without shipping a new build. Hardcoded values mean a code change (and an App Store review) for every tweak."),
          c("Separate environments: local, dev/staging, production", "crit", "Keep distinct configs so testing against staging can never accidentally hit real users' production data — and so a staging bug can't corrupt prod."),
          c("Secrets live in a secret manager / vault, not in committed plist or source", "crit", "API keys baked into the app binary can be extracted by anyone — treat client secrets as public and keep real secrets server-side or in a managed store.", "keychain, doppler, 1password"),
          c("App fails fast on startup if required config is missing or malformed", "rec", "Validate config at launch and crash loudly in debug rather than discovering a missing key three screens deep in production."),
          c("Feature flags / remote config decouple deploy from release", "rec", "Ship code dark and flip features on remotely — lets you roll out gradually or kill a broken feature without an App Store update.", "firebase remote config, launchdarkly"),
        ],
      },
      {
        title: "Build-time config",
        items: [
          c("Build configs (.xcconfig) per scheme: Debug / Staging / Release", "rec", "Drive per-environment values from xcconfig files tied to schemes so settings aren't scattered through code or the project file."),
          c("Base API URLs resolve per environment automatically", "rec", "The Staging scheme points at staging, Release at production — no manual URL swapping before a build."),
          c("Bundle ID, app icon & display name differ per env so builds install side-by-side", "rec", "A distinct bundle ID per environment lets testers keep prod and staging on the same device without overwriting each other.", "com.app.dev / com.app"),
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
          c("A consistent error model / type across the codebase", "crit", "One error type the whole app understands beats ad-hoc strings and scattered enums — it makes mapping errors to UI and logs predictable.", "enum AppError: Error { case network, auth, ... }"),
          c("Errors are caught at boundaries, never swallowed silently", "crit", "An empty `catch {}` hides bugs that resurface later as mysterious behavior. Handle it, surface it, or log it — never drop it."),
          c("User-facing messages are friendly; internals never leak to users", "crit", "Show \"Couldn't load your feed — tap to retry,\" not a raw decoding error or stack trace that confuses users and leaks implementation detail."),
          c("Swift errors typed; no force-unwraps in production paths", "crit", "`try!` and `!` crash the whole app on the unexpected. Use optional binding, `guard`, or typed throws so failures degrade instead of terminating.", "avoid try! and ! on optionals"),
          c("Async errors propagated, not dropped in detached Tasks", "rec", "An error thrown inside a fire-and-forget `Task {}` vanishes silently — capture and handle it, or the failure goes unnoticed."),
        ],
      },
      {
        title: "Resilience patterns",
        items: [
          c("Timeouts on every outbound network call", "crit", "Without a timeout a stalled request hangs a spinner forever on a flaky connection. Set a sensible deadline and fail gracefully.", "URLSessionConfiguration.timeoutIntervalForRequest"),
          c("Retries with exponential backoff + jitter for transient failures", "rec", "Retry once or twice with increasing, randomized delays so a brief blip recovers without hammering a struggling server in lockstep."),
          c("Offline / poor-connectivity states handled in UI", "crit", "Mobile networks drop constantly — show cached content or a clear \"You're offline\" state instead of a blank screen or endless spinner."),
          c("Network reachability monitored; UI reacts to connectivity changes", "rec", "Detect when connectivity returns and auto-refresh or re-enable actions rather than forcing the user to retry manually.", "NWPathMonitor"),
          c("In-flight requests cancelled when their view disappears", "rec", "Cancel work when the user navigates away to save bandwidth and battery and to avoid updating a screen that's gone."),
          c("Graceful degradation when a non-critical dependency is down", "rec", "If recommendations fail to load, still show the core content — one optional feature shouldn't take down the whole screen."),
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
          c("Authentication implemented with a vetted standard (OAuth2/OIDC), not hand-rolled", "crit", "Auth is easy to get subtly, dangerously wrong. Use a proven flow or SDK (Sign in with Apple, Auth0) instead of inventing your own."),
          c("Tokens stored in Keychain, never in UserDefaults or plain storage", "crit", "Keychain is encrypted and hardware-backed; UserDefaults is a plaintext plist any backup or jailbroken device can read."),
          c("Sessions/tokens expire and can be revoked; refresh rotation in place", "rec", "Short-lived access tokens plus rotating refresh tokens limit the blast radius if a token is stolen, and let you log out a compromised device."),
          c("Biometric gate (Face ID / Touch ID) for sensitive actions", "rec", "Require a biometric check before revealing saved cards or approving a transfer so a borrowed unlocked phone can't access them.", "LocalAuthentication"),
          c("HTTPS/TLS everywhere; no cleartext traffic", "crit", "Plain HTTP can be read and modified on any shared Wi-Fi. Every request must be TLS-encrypted."),
          c("Certificate pinning for sensitive mobile APIs", "rec", "Pin the server's certificate/public key so a malicious or compromised CA can't man-in-the-middle your traffic. Plan for cert rotation."),
        ],
      },
      {
        title: "Data protection & hardening",
        items: [
          c("Keychain items use appropriate access-control & data-protection classes", "rec", "Set accessibility like `WhenUnlockedThisDeviceOnly` so secrets aren't readable while locked and don't migrate via backups to other devices."),
          c("Sensitive files encrypted at rest via Data Protection (NSFileProtection)", "rec", "File Protection ties on-disk files to the device passcode so they're unreadable when the device is locked or stolen.", "FileProtectionType.complete"),
          c("Sensitive screens hidden in the app switcher / on backgrounding", "rec", "iOS snapshots your UI for the multitasking switcher — overlay or blur sensitive screens so balances and messages don't leak there."),
          c("App Transport Security enforced; no arbitrary-loads exception", "rec", "Avoid `NSAllowsArbitraryLoads` in Info.plist — it disables TLS enforcement app-wide. Add narrow exceptions only when truly unavoidable."),
          c("Tamper / jailbreak awareness for high-risk apps", "rec", "Banking and similar apps may detect a jailbroken/rooted device and limit functionality — defense in depth, not a silver bullet."),
        ],
      },
      {
        title: "Supply chain",
        items: [
          c("Dependencies scanned for known CVEs in CI", "crit", "Third-party packages ship vulnerabilities too — scan them automatically so a known CVE doesn't sit unnoticed in your app."),
          c("Lockfiles committed; versions pinned", "rec", "Committing resolved versions guarantees every build and every developer gets identical, audited dependencies.", "Package.resolved / Podfile.lock"),
          c("Secrets scanning prevents credentials from being committed", "rec", "A pre-commit/CI scan blocks an API key or token from ever reaching git history, where it's effectively public forever.", "gitleaks / trufflehog"),
        ],
      },
    ],
  },
  {
    id: "data",
    icon: "🗄️",
    title: "Data & Persistence",
    blurb: "Local data outlives app updates. Plan for migrations and a clean slate on logout.",
    subs: [
      {
        title: "Local storage",
        items: [
          c("Local persistence has a migration story (Core Data / SwiftData / SQLite)", "crit", "When your data model changes in an update, existing users' stored data must migrate cleanly — without a plan the app crashes on launch after the update."),
          c("Schema migrations tested across upgrade paths, not just fresh installs", "rec", "Test upgrading from older versions, not only clean installs — real users jump several versions and hit migration edge cases you won't on a fresh device."),
          c("UserDefaults used only for small, non-sensitive preferences", "crit", "UserDefaults is for flags and settings, not tokens or large data — it's unencrypted and loaded into memory on launch."),
          c("Large / binary assets cached on disk with eviction & size limits", "rec", "Cap the on-disk cache and evict old entries so a media-heavy app doesn't silently consume gigabytes and get its data purged by iOS.", "URLCache / NSCache"),
        ],
      },
      {
        title: "Sync & integrity",
        items: [
          c("Server is authoritative; client-side conflict resolution defined", "rec", "Decide what wins when the same record is edited offline on two devices — last-write-wins, merge, or prompt — so data doesn't silently diverge."),
          c("Background sync handles interruption & resumes / retries", "rec", "Syncs get killed when the app is backgrounded or the network drops — make them resumable so partial syncs don't corrupt or lose data."),
          c("All local data & caches cleared on logout / account switch", "crit", "On logout, wipe cached data, tokens, and files — otherwise the next user (or account) on the device sees the previous one's private data."),
        ],
      },
    ],
  },
  {
    id: "lifecycle",
    icon: "📲",
    title: "App Lifecycle & Platform Integration",
    blurb: "Native apps live inside the OS. Permissions, links, and lifecycle events all need handling.",
    subs: [
      {
        title: "Permissions",
        items: [
          c("Every requested capability has its Info.plist usage description string", "crit", "iOS hard-crashes the app the moment you access the camera, location, etc. without the matching usage-description key — and review rejects builds missing them.", "NSCameraUsageDescription"),
          c("Permissions requested in context, with graceful handling when denied", "crit", "Ask for location right when the user taps \"Find nearby,\" not at launch — and handle denial without breaking, since users say no."),
          c("App stays usable (degraded) when an optional permission is denied", "rec", "If notifications are declined, the app should still work — guide the user to Settings if they want it, don't dead-end them."),
        ],
      },
      {
        title: "System integration",
        items: [
          c("Push notifications: APNs registration, permission prompt & payload handling", "rec", "Register for APNs, request permission at a sensible moment, and route taps to the right screen — including when the app was killed."),
          c("Deep links / universal links route to the right screen", "rec", "A tapped link or shared URL should open directly to the relevant content, whether the app is cold-launched or already running.", "associated domains / apple-app-site-association"),
          c("Scene / app lifecycle & state restoration handled correctly", "rec", "Save and restore UI state across background/foreground and termination so users return to where they left off, not the home screen."),
          c("Background modes / refresh used only where genuinely needed", "rec", "Background execution drains battery and invites App Store scrutiny — declare only the modes you truly use (audio, location, fetch)."),
          c("Low-memory warnings handled; app survives backgrounding & termination", "rec", "Release caches on memory pressure and persist state before suspension so iOS doesn't jettison and the user loses nothing.", "didReceiveMemoryWarning"),
          c("Supports required device sizes & orientations; safe areas respected", "rec", "Lay out against safe-area insets so content isn't clipped by the notch, Dynamic Island, or home indicator across iPhone and iPad sizes."),
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
          c("Log levels used meaningfully (error/warn/info/debug)", "rec", "Distinct levels let you filter noise from signal — surface errors in production while keeping debug chatter out of release logs.", "OSLog / unified logging"),
          c("No secrets, tokens, or PII written to logs", "crit", "Logs get collected, shared in bug reports, and synced — a token or email address printed there is a real leak."),
          c("Verbose / debug logging stripped from release builds", "rec", "Excess logging in release builds hurts performance, leaks internals, and clutters Console — gate it behind debug compilation flags."),
        ],
      },
      {
        title: "Crash & error reporting",
        items: [
          c("Crash reporting wired up (Crashlytics, Sentry, etc.)", "crit", "You won't see most crashes on your own device — automated reporting is the only way to know what's breaking for real users in the field.", "Crashlytics / Sentry"),
          c("dSYMs uploaded so crash stack traces are symbolicated", "crit", "Without the build's debug symbols, crash reports are unreadable hex addresses instead of file names and line numbers — useless for debugging."),
          c("Non-fatal errors & breadcrumbs reported, not just hard crashes", "rec", "Caught errors and a trail of recent actions reveal problems that frustrate users without crashing — and give context for the ones that do."),
          c("Hangs / watchdog terminations (ANRs) tracked", "rec", "A frozen main thread feels as broken as a crash to users. Track hangs and 0x8badf00d watchdog kills, not only classic crashes."),
        ],
      },
    ],
  },
  {
    id: "perf",
    icon: "⚡",
    title: "Performance & Caching",
    blurb: "Fast is a feature. Measure launch, memory, and battery — then cache the right things.",
    subs: [
      {
        title: "Runtime performance",
        items: [
          c("Smooth 60/120fps scrolling; heavy work kept off the main thread", "crit", "Janky, stuttering scrolling reads as a cheap app. Move image decoding, parsing, and disk/network work off the main thread.", "async/await, background queues"),
          c("Cold & warm launch time measured and budgeted", "rec", "Slow launches lose users and draw a watchdog kill if too slow. Measure both cold and warm starts and set a target.", "MetricKit, Instruments App Launch"),
          c("Memory footprint bounded; retain cycles audited", "rec", "Unbounded growth and retain-cycle leaks get the app killed in the background or while loading large content. Profile and use `[weak self]`.", "Instruments Leaks/Allocations"),
          c("Battery, network & location usage kept minimal", "rec", "Frequent wakeups, polling, and continuous GPS drain the battery and earn 1-star reviews — coalesce work and request only the precision you need."),
        ],
      },
      {
        title: "Assets & app size",
        items: [
          c("Image & list caching on device; avoid re-downloading", "rec", "Cache decoded images and reuse cells so scrolling back doesn't refetch and re-decode — faster and far less data usage.", "SDWebImage / Kingfisher / Nuke"),
          c("App size monitored; app thinning / on-demand resources where useful", "rec", "A bloated download deters installs and may exceed the cellular limit — use asset slicing and on-demand resources for rarely needed assets."),
          c("Large downloads are resumable and can run in the background", "rec", "Big media or content packs should continue if the app is backgrounded and resume after interruption instead of restarting from zero.", "URLSession background configuration"),
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
          c("Client respects 429/Retry-After and backs off", "rec", "When the server says \"too many requests,\" honor the Retry-After delay instead of retrying immediately and making the overload worse."),
          c("User-triggered requests debounced / throttled (search, refresh)", "rec", "Wait until the user stops typing before firing a search, and ignore rapid pull-to-refresh spamming — saves the server and the battery.", "debounce ~300ms"),
          c("Duplicate in-flight requests coalesced to avoid stampedes", "rec", "If the same fetch is already running, attach to it rather than launching a second identical request — common when several views load at once."),
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
          c("User-facing strings externalized via String Catalogs, never hardcoded", "rec", "Pulling strings into a catalog lets you translate without touching code and keeps copy consistent and reviewable.", "String Catalogs (.xcstrings)"),
          c("Dates, numbers, currencies formatted via locale-aware APIs", "rec", "Never hand-format — \"1,000.50\" vs \"1.000,50\" and date order differ by region. Let the system format for the user's locale.", "FormatStyle / NumberFormatter"),
          c("Layout handles longer translations & RTL languages", "rec", "German runs long and Arabic/Hebrew flow right-to-left — use Auto Layout and leading/trailing constraints so UI doesn't clip or mirror wrong."),
        ],
      },
      {
        title: "Accessibility (a11y)",
        items: [
          c("VoiceOver / screen-reader labels on all interactive elements", "rec", "Icon-only buttons read as nothing to VoiceOver users — give every control a clear accessibility label describing what it does.", "accessibilityLabel"),
          c("Color contrast passes; not relying on color alone", "rec", "Don't signal state with color only — add text or icons so color-blind and low-vision users (and bright sunlight) aren't left guessing."),
          c("Respects Dynamic Type / font scaling", "rec", "Honor the user's chosen text size so the app stays readable — use scalable fonts and avoid fixed point sizes and truncation.", "UIFont.preferredFont / .dynamicTypeSize"),
          c("Respects reduced-motion preferences", "rec", "Some users get motion sickness from parallax and large transitions — provide a subtler alternative when Reduce Motion is on.", "UIAccessibility.isReduceMotionEnabled"),
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
          c("Unit tests for business logic & edge cases (XCTest)", "crit", "Cover the logic that's expensive to get wrong — pricing, parsing, validation — including empty, nil, and boundary inputs.", "XCTest / Swift Testing"),
          c("UI tests for critical flows (XCUITest)", "rec", "Automate the make-or-break journeys (sign-up, checkout) so a refactor can't silently break them between releases.", "XCUITest"),
          c("Tests run in CI and block merge on failure", "crit", "Tests only protect you if they run automatically on every PR and stop a red build from merging — local-only tests get skipped."),
          c("Snapshot/visual regression where UI stability matters", "rec", "Snapshot tests catch unintended layout shifts — a stray padding change or clipped label — that logic tests never would.", "swift-snapshot-testing"),
          c("Tested across a range of devices & the minimum supported OS version", "rec", "A layout that's fine on your iPhone Pro may break on a smaller SE or older iOS — test the spread you actually support."),
        ],
      },
      {
        title: "Quality gates",
        items: [
          c("Linter + formatter enforced (SwiftLint)", "crit", "Automated linting and formatting kill style debates and catch real footguns (force-unwraps, retain cycles) before review.", "SwiftLint / swift-format"),
          c("Coverage tracked with a sane threshold (not 100% theater)", "rec", "Track coverage to spot untested critical paths, but don't chase 100% — trivial getters and generated code don't need tests."),
          c("Pre-commit hooks catch issues before they hit CI", "rec", "Run format and lint on commit so trivial failures are fixed in seconds locally instead of after a slow CI round-trip.", "git hooks / lefthook"),
          c("Flaky tests quarantined and fixed, not ignored", "rec", "A test that fails randomly trains the team to ignore red builds — isolate it, fix the root cause, then re-enable it."),
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
          c("CI runs build + lint + test on every PR", "crit", "Every pull request should be built, linted, and tested automatically so broken code is caught before it merges, not after.", "xcode cloud / github actions"),
          c("Reproducible builds; dependencies locked & cached", "rec", "Pinned versions and cached dependencies make builds deterministic and fast — the same inputs always produce the same app."),
          c("Automated build & deploy to TestFlight / App Store — no manual steps", "crit", "Manual archive-and-upload is slow and error-prone. Automate the whole path so releases are one command and repeatable.", "fastlane"),
          c("Code signing & provisioning automated; certs/secrets from a store", "crit", "Signing is the classic release-day blocker — automate certificate and profile management so it just works on every machine and in CI.", "fastlane match / cloud signing"),
          c("Artifacts versioned & traceable to a git SHA", "rec", "Every build should map back to the exact commit it came from so you can reproduce and debug precisely what users are running."),
        ],
      },
      {
        title: "Release strategy",
        items: [
          c("Tested release/rollback path — can expedite or pull a bad build", "crit", "You can't un-ship an App Store build, so know your recovery moves: expedited review, phased-release pause, kill switches, and forced-update prompts."),
          c("Phased App Store rollout enabled", "rec", "Release to a small percentage of users first so a serious bug surfaces in crash reports before it reaches everyone."),
          c("Reviewed against App Store Review Guidelines before submission", "rec", "A pre-submit guideline check (permissions, IAP, privacy, data use) avoids rejections that can cost days of review turnaround."),
          c("Changelog / release notes generated", "rec", "Clear notes tell users what changed and give your team a record of what shipped in each version."),
          c("App Store metadata & screenshots managed (and ideally versioned)", "rec", "Treat screenshots, descriptions, and keywords as release artifacts — automate and version them so updates are consistent.", "fastlane deliver"),
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
          c("Privacy policy & terms of service in place and linked", "crit", "A reachable privacy policy is required for App Store submission and most regulations — link it in-app and on your store page."),
          c("App privacy nutrition labels filled accurately", "crit", "The \"App Privacy\" section on your store listing must truthfully declare what data you collect and how it's used — inaccuracies risk removal."),
          c("App Tracking Transparency prompt shown if you track users", "crit", "If you track users across other apps/sites (e.g. for ad attribution), you must show the ATT prompt and respect the answer.", "AppTrackingTransparency"),
          c("In-app account deletion path provided", "crit", "Apple requires apps that let users create an account to also let them delete it — and the data — from within the app."),
          c("Privacy manifest declares data use & Required Reason API usage", "rec", "A PrivacyInfo.xcprivacy manifest is now mandatory: declare collected data types and your reason for using certain sensitive APIs.", "PrivacyInfo.xcprivacy"),
          c("Data collection minimized to what the feature needs", "rec", "Collect only what a feature genuinely requires — less data means less risk, simpler compliance, and more user trust."),
          c("Open-source license compliance reviewed", "rec", "Some licenses require attribution or impose obligations — review your dependencies' licenses before shipping commercially."),
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
          c("README: what it is, how to run it locally, how to release", "crit", "A newcomer (or you in six months) should get the project building and a release out by following the README alone."),
          c("Architecture overview / decision records (ADRs)", "rec", "Capture why key choices were made (e.g. SwiftUI vs UIKit, the networking layer) so future changes don't relitigate settled decisions.", "lightweight ADR markdown files"),
          c("Onboarding gets a new dev productive in under a day", "rec", "Scripted setup and clear docs mean a new engineer ships a small change on day one instead of fighting environment issues for a week."),
          c("Blameless postmortems for incidents", "rec", "After a bad release, write up what happened and what to change — focus on the system, not blame, so the same mistake doesn't recur."),
        ],
      },
    ],
  },
];
