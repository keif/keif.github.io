---
title: "Building PRivity: A macOS Menu Bar App for Every GitHub PR I Care About"
pubDatetime: 2026-06-22T20:00:00.000Z
modDatetime: 2026-06-23T02:04:29.267Z
slug: building-privity
featured: true
draft: false
tags:
    - Swift
    - SwiftUI
    - macOS
    - GitHub
    - Menu Bar
    - Sparkle
    - Developer Tools
description: |
    Built PRivity, a native macOS menu bar app that surfaces every GitHub pull request that matters across personal and work accounts. Notifications, multi-account, Issues + Dashboard tabs, Sparkle auto-update, Developer ID signed and notarized. Hosted on my own site because the repo is private.
---

> **TL;DR**: PRivity is a native macOS menu bar app that puts every GitHub PR I care about — mine, ones I'm reviewing, ones assigned to me — one click away. Swift + SwiftUI + Sparkle, Developer ID signed and notarized, free (for now), hosted at [fullybakedlabs.com/privity](https://fullybakedlabs.com/privity/). Three bug stories at the bottom for the people who like that kind of thing.

Like a lot of side projects, this one started with that little bit of friction that makes a developer say "we can fix this."

I work across two GitHub accounts — personal and work — and a stack of repos that varies on each. I keep my work separated - a work laptop, a personal laptop - but the number of PRs I get are insane. My inbox is full of requests for code reviews - some directly tied to me, some because of repos I monitor. And the NUMBER of repos I work in seem to exponentially grow every day. It's an irritating problem, and I didn't feel like sorting through options, and I needed an excuse to play with Swift, and test my prejudices against CoPilot AI.

I wanted something that lived in the menu bar, refreshed quietly in the background, and showed me — at a glance — every PR I should care about. At the time, I was unimpressed with CoPilot - it was a glorified code completion tool, its AI "discussions" always left me irritated and wasting time (if it was the only AI I used, I would likely still hate on AI). So I decided - let's run with this and see, and have CoPilot start the repo.

It generated a working POC on the first go - not perfect, mind you, but _workable._ I was impressed. But I also didn't intend to keep using CoPilot, so I took over.

## The Goal

A menu bar icon that's red when something needs my attention, blue when something needs my review, purple when something I authored is ready to merge, and grey when there's nothing actionable. Click the icon, see the list. That was the bar.

It grew into:

- **PRs tab** — every PR across every account, with role-aware sorting (Review / Pending / Approved / Changes / Drafts)
- **Issues tab** — open Issues from a per-account watched-repos list
- **Dashboard tab** — per-repo summary cards showing open PR count, last commit, today's deploys, configured environments
- **Settings as an inline tab**, not a modal, like CoPilot originally coded — the gear icon toggles it, clicking any data tab dismisses it.
- **First-launch welcome screen** with a one-click sign-in via GitHub's OAuth device flow
- **Block by org/user** so I can hide work repos on my personal laptop and side-project orgs on my work laptop
- **Keyboard shortcuts** for everything — `⌘1/2/3` switch tabs, `⌘R` refreshes, `↑/↓` navigate the list, `⌘ + ,` opens settings, Return opens the selected PR

## The Stack

Native all the way down:

- **Swift 5.9 + SwiftUI** targeting macOS 14+
- **Sparkle** for auto-updates, with EdDSA-signed appcasts
- **macOS Keychain** for token storage (more on that below — it almost cost me a day)
- **GitHub REST API v3** — search, repos, commits, check-runs, deployments, environments, actions
- **`async`/`await` + `TaskGroup`** for parallel API fanouts (Issues fetches across all watched repos run concurrently, same for Dashboard)
- **`Combine`** for view-model account observation
- **`UNUserNotificationCenter`** for system notifications

The whole thing is one Swift Package, one executable target. Three view models — one per tab — sharing a small `WatchedRepoStore` and a `GitHubService`. Nothing exotic, but I'd never written a SwiftUI menu bar app before and the popover lifecycle has some sharp edges (more below).

## How It Works

### Polling, not webhooks

PRivity polls the GitHub Search API every 5 minutes (15 seconds in debug mode - it was irritating to get it to work on my personal, low-activity repos vs. my active work ones, but I couldn't just drop it on my work laptop on day one). Webhooks would be cleaner but require a public endpoint and a server to receive them. For a free menu bar app, polling felt like the right trade-off — GitHub's rate limits are generous (5,000 req/hr authenticated), and per-PR detail fetches (reviews, check-runs) are the bulk of the budget anyway.

### Three search queries per refresh

The PRs tab is built from three concurrent search queries:

- `type:pr state:open archived:false review-requested:USERNAME` — PRs you've been asked to review
- `type:pr state:open archived:false author:USERNAME` — your own open PRs
- `type:pr state:open archived:false assignee:USERNAME` — PRs assigned to you

`archived:false` was an unexpected addition that matters — without it, review requests on long-archived repos clutter your queue forever. Results are merged by ID (a PR can match multiple queries — you can be both author and assignee), then enriched with per-PR detail fetches in a loop.

### CI status from two endpoints

GitHub has two CI status APIs: the legacy `/commits/{sha}/status` (used by Travis-era providers) and the modern `/commits/{sha}/check-runs` (used by GitHub Actions). PRivity fires both in parallel and merges them — failures win over success (a green legacy status shouldn't hide a failing Actions run), pending beats success (any in-flight run keeps the badge orange). Most modern repos report exclusively via check-runs, so without this merge, CI showed "unknown" for them.

### Hosting your own DMG when your repo is private

The PRivity repo is private. I want to keep optionality around eventual App Store distribution, and I don't want to publish the source until I've made that call. But GitHub release assets on private repos return 404 for anonymous downloads — which means the Download button on a marketing page can't point at `github.com/.../releases/download/...`.

So the DMG lives on the marketing site itself, alongside the Sparkle appcast XML. The release script copies the notarized + stapled DMG into the site repo's `public/privity/` directory, rewrites both the appcast URL and the Astro page download URL to point at the site, and commits everything in one go. Free CDN courtesy of GitHub Pages, no auth required, and Sparkle just works.

## Distribution

This part took longer than the actual app code. Learning experience!

**Code signing**: every release requires a Developer ID Application certificate. The app, the framework, and every nested Sparkle binary (`Autoupdate`, `Updater.app`, `Downloader.xpc`, `Installer.xpc`) all need to be signed in inner-to-outer order with `--options runtime --timestamp`. The first time I shipped, Apple rejected notarization because Sparkle's nested binaries were still using the framework's original distribution signature instead of mine. The error message was helpful (specific paths, specific issues), but the fix is non-obvious if you haven't done it before.

**Notarization**: each release uploads the app and the DMG to Apple separately, waits for their notary service to scan (usually 2-5 minutes), then staples the resulting ticket. Both are required — the app for Gatekeeper trust at install time, the DMG for the same when users mount it.

**Sparkle auto-updates**: I generate a fresh EdDSA keypair, store the private key in 1Password, sign every release artifact with it, and embed the public key in the app's `Info.plist`. The appcast XML points at the DMG URL (hosted on my site) and carries the signature. On poll, Sparkle verifies the signature before downloading anything.

The whole release flow is one command: `./release.sh 1.2.0`. It bumps the `Info.plist` version, signs and notarizes, creates the DMG, signs and notarizes that too, tags + pushes the GitHub release, updates `CHANGELOG.md`, generates a signed appcast, copies the DMG to the site repo, updates the Astro download page, and commits everything. About 7 minutes end-to-end, mostly waiting on Apple's notarization service.

## The funny bugs

Three bugs from this build that drove me crazy, and I'm going to lump them together; here's the speed-run:

**1. Keychain reads on the main thread froze the UI on managed Macs.** `SecItemCopyMatching` is synchronous and blocks the calling thread. Under enterprise MDM policies it can stall for seconds while OS policy checks run. PRivity was calling it directly from `@MainActor`. On my personal Mac it returned instantly. On my work Mac the entire popover became unresponsive for 5+ seconds on every refresh.

**Fix:** wrap it in `withCheckedContinuation` and dispatch to a background queue.

**2. Polling perpetually cancelled my own refreshes.** The polling timer fired every 5 minutes (15s in debug) and called `currentRefreshTask?.cancel()` before starting its own. If the initial user-driven refresh was still in flight, polling would cancel it. The cancelled task's `guard !Task.isCancelled else { return }` short-circuited before resetting `isLoading = false`, so the UI was stuck on "Loading PRs..." even though new data was flowing in from the cancelling polling task.

**Fix:** a single `isRefreshing` flag — polling skips entirely if a refresh is already in flight, and every exit path (success, cancel, error, 401) routes through a `finish()` helper that clears the loading state.

**3. `onAppear` fired on every popover reopen and double-refreshed everything.** `AppDelegate.applicationDidFinishLaunching` was calling `viewModel.loadAccounts()` and `viewModel.startPolling()` once at launch. `ContentView.onAppear` was calling them again, every time the popover opened. That second call re-set `selectedAccount`, which fired the Combine sink, which kicked off another full refresh — racing with whatever was in flight. The result was the count badge updating from refresh A while the list was stuck on "Loading PRs..." from refresh B.

**Fix:** trust that AppDelegate's setup is sufficient; `onAppear` only needs to restart polling (since `onDisappear` stops it).

Each of these would have been fixed in seconds with a debugger and a managed Mac in front of me. Diagnosing them remotely — over a debug-log dump from a laptop in a (metaphorical) different city — was the actual project. The biggest single quality-of-life win was rewriting `Debug.swift` to append every log call to a file with timestamps, instead of only `NSLog`-ing to Console.app. Without that I'd still be guessing in the dark.

## What's Next

- **App Store distribution** — eventually. The pieces are mostly there (Developer ID signing, hardened runtime, notarization), but the sandbox is currently disabled (required for UserDefaults persistence without proper signing) and needs an audit before submission. Probably a week of focused work whenever I prioritize it.
- **GitHub Enterprise support** — a custom base URL in account setup. Small feature, hasn't blocked me yet. Maybe it'll be a request?
- **Search within the PR list** — text filter over title/repo for when a single noisy repo fills the screen.

The rest? Polish. PRivity is the kind of tool I have been using every day, so the backlog mostly self-generates from "wait, why does it do that?" moments while I'm trying to work.

Try it: [fullybakedlabs.com/privity](https://fullybakedlabs.com/privity/). Free, no account on my end, no telemetry, no crashlytics (at publish date). Just a menu bar icon that tells you when something needs your attention.
