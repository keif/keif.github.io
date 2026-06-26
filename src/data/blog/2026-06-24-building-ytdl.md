---
title: "Building ytdl: A Self-Hosted yt-dlp Queue You Run Yourself"
pubDatetime: 2026-06-24T22:00:00.000Z
modDatetime: 2026-06-26T21:35:19.014Z
slug: building-ytdl
featured: true
draft: false
tags:
    - Python
    - FastAPI
    - SQLite
    - React
    - TypeScript
    - Tailwind
    - yt-dlp
    - Self-hosted
    - Claude Code
    - Codex
description: |
    Built ytdl, a single-operator self-hosted yt-dlp queue with a FastAPI backend and a React web UI. SQLite-backed jobs, SSE progress, auto-submit countdown, eager Queue button, per-job audio-only and output dirs. Walks through the architecture, the AI-assisted development workflow, and the dozens of races Codex caught before merge.
---

> **TL;DR**: ytdl is a self-hosted yt-dlp queue. Paste a URL, hit Queue (or Enter), the input clears, the job downloads. SQLite-backed queue survives restarts, SSE pushes progress to the UI, a 30s probe timeout means a hung YouTube edge node can't wedge the worker. Built in a few intense sessions with Claude Code + Codex review as the development loop. Repo is public; this post is the design and process writeup. Bug stories at the bottom.

Vibe-coding is all the rage right now, and it's sad. I feel like impostor syndrome has been replaced by a sense of false bravado, and that every project has a cash value. (Hence my start of calling them "[Fridge Projects](/overthinking/fridge-projects)").

This was born because downr.net - it said it would do what it claimed, except it errored. And I found the subreddit, reached out to the developer - and they ignored me and deleted my post. If you're going to ask for cash and then NOT communicate with your "community" then - bye. A comment on my post I saw before deletion mentioned "it's just using yt-dlp behind the scenes anyways." I kept reading about this library, so I figured - it's time to actually tackle it, for myself.

yt-dlp seems to be the only tool in this space that actually keeps up with YouTube's anti-scraping moves. What I wanted was the rest of it: a small persistent queue, retry on transient failures, a way to preview a playlist and pick the entries I wanted before committing, and a UI I could leave running so I could paste and walk away.

The other constraint was scope. This is a tool for me. Not a service. A self-hosted, single-operator downloader I run on my own setup. Something that _anyone_ could run on their own setup. Y'know, the way code used to be treated online - showing off what you built, maybe it's worth something, maybe it's just fun. This framing shows up everywhere in the design — and in the `SECURITY.md` warning telling you not to host it publicly.

## The Goal

- Paste a YouTube URL (or playlist), get a queued job within seconds
- Persistent queue that survives restarts, with retry on transient failures (Less important, but it highlights a couple things I'm trying to figure out - the videos live on a media server, so I can prevent double downloads?)
- Live progress bar in the UI: percent, speed, ETA (this was just for me, I like communication in the UI)
- Preview a playlist's contents, pick a subset, queue only what I want
- Subtitle support (real ones, not auto-CC) embedded + sidecar `.vtt` for Plex
- Audio-only mode for podcasts and music (this was a callout from Claude, so I went ahead and added it)
- Per-job output directory override so `~/Music` is a paste away

It grew into:

- **Paste-and-go submit** — Queue button + Enter key submit instantly; preview keeps loading in parallel as context
- **5-second auto-submit countdown** as the hands-off fallback after preview resolves
- **30s probe timeout** that returns `504` instead of wedging the worker pool on a non-responsive YouTube edge
- **Cookies auto-detect** from your local browser store at server startup
- **Server-Sent Events** with persisted event IDs so the UI can resume mid-download after a reconnect
- **Threat model** — `SECURITY.md` leads with "do not host publicly" and explains why

## The Stack (at the time of writing)

- **Python 3.12 + uv** for the backend and dependency management
- **FastAPI + Uvicorn** for the HTTP API + SSE bus
- **SQLite** in WAL mode for the job queue, accessed via `sqlite3` (no ORM); persisted job IDs via [ULID](https://github.com/ulid/spec) for monotonic creation order
- **yt-dlp** as a library, not a subprocess. EJS challenge solver via `remote_components=["ejs:github"]` (yt-dlp 2026.x opt-in)
- **asyncio worker supervisor** with N workers (configurable), per-attempt backoff, cooperative cancellation
- **deno** as the JS runtime for YouTube's "n" signature challenge — yt-dlp shells out to it, so it needs to be on PATH
- **React 19 + TypeScript + Vite + Tailwind 3** for the frontend
- **Typer** for the CLI (`ytdl get`, `ytdl queue add`, `ytdl preview`, etc.)
- **Pydantic v2** for request/response schemas
- **Docker** multi-stage build: Node web-build stage → `uv` Python slim stage with ffmpeg

One repo, two vectors (CLI and web). The CLI and the web both call the same `enqueue`, `probe`, and `download` helpers — features that land in the web UI work in the CLI within the same PR. As fun as it is running everything through the CLI, sometimes I like playing in the UI as well.

## How It Works

### Queue persistence

Every job is a row in `jobs.db`. Schema version is tracked and migrated forward — adding a column means writing a migration with a version bump, no ORM gymnastics. The supervisor pulls pending jobs in creation order, claims them atomically via `UPDATE … RETURNING` (SQLite's CAS primitive), and dispatches to a worker thread.

Cancellation is cooperative: the cancel flag is checked between yt-dlp progress callbacks, and the worker tears down cleanly. Playlists expand into N child jobs whose `parent_job_id` points at the playlist row, and cancelling the parent cascades to every child via the same flag-and-poll pattern.

### Preview, then submit (or not)

When you paste a URL, the frontend debounces 500ms, then hits `/preview` which runs yt-dlp's flat probe (`extract_flat="in_playlist"`) for cheap metadata. The response carries the kind (`video` or `playlist`) and the list of entries.

If it's a single video, a 5-second countdown banner appears: "Downloading in 5… [Cancel]". If you do nothing, the job submits automatically. If you hit Cancel or paste a different URL, the countdown cancels. If you want to skip the wait entirely, the Queue button (or Enter on the input) submits the moment the URL passes a shape check — no preview wait at all.

For playlists, the picker replaces the auto-submit banner. You check the entries you want, hit "Download N," and each picked URL queues as its own job under the playlist parent.

### Live progress without polling

The backend exposes `/events` as an SSE stream. Workers push `progress`, `started`, `finished`, `failed`, `canceled` events as they happen, with persisted event IDs in SQLite so a reconnecting client can replay anything it missed via `Last-Event-ID`.

The frontend patches running rows in place from progress events — no full list refresh — and only triggers a `/jobs` refresh on lifecycle transitions (start, finish, etc.). Earlier in the project I had every event trigger a full refresh, and the UI would lock up under load on bursty progress updates. The fix was to be granular about which events warranted a network round-trip.

### The 30-second probe timeout

By default, yt-dlp's `socket_timeout` isn't set. A YouTube edge node that accepts the TCP connection but never sends data will hang forever. Python's `socket.recv()` is in C and can't be preempted from the event loop. Pile up a handful of hung requests and the executor pool fills, every endpoint times out, and Uvicorn's `--reload` supervisor wedges in signal-handler reentrancy because the worker can't be killed. I know all this because I lived it for a few hours one night (see "Bug stories" below).

The fix is belt-and-suspenders. Pass `socket_timeout=30` to yt-dlp's options so HTTP reads abort. Wrap the `asyncio.to_thread(probe, ...)` call in `asyncio.wait_for(..., timeout=35)` so even if yt-dlp ignores the socket timeout on some code path, the route gets control back. On timeout, return `504` with an actionable message. Configurable via `probe_timeout_s` in the config — 0 disables, anything else sets both layers.

There was a known limit I called out in that PR: `asyncio.wait_for` cancels the awaiter, not the thread. The thread keeps running yt-dlp in the background and the executor slot stays occupied until yt-dlp eventually gives up. Documented it, shipped it, moved on.

A few days of real use later, (post drafting this post, pre-posting elsewhere) a YouTube radio-mix URL hung the probe and the whole API wedged again. `py-spy dump` on the running process showed the same signal-handler reentrancy I'd seen the first time: uvicorn's reload supervisor in three nested `signal_handler` frames trying to kill a worker that couldn't be killed. The "known limit" had collected its tax.

The proper fix was to move probes out of the Python process entirely. `probe()` now shells out to `python -m ytdl._probe_worker` via `subprocess.run` with a timeout. When the timeout fires, the OS terminates the subprocess — yt-dlp's non-interruptible C calls become very interruptible when the kernel sends SIGKILL. No more stuck threads, no more executor leak, no more supervisor wedge on Ctrl-C! Same `probe()` signature so callers don't change.

Three layers of timeout now: yt-dlp's `socket_timeout` (HTTP reads abort), `subprocess.run`'s timeout (OS kills the subprocess at +5s), and `asyncio.wait_for` (cheap insurance at +10s for subprocess startup races). Each layer is the safety net for the next.

## The development loop

I built ytdl with the assistance of Claude Code, with OpenAI's Codex CLI as a mandatory pre-merge review gate. Every feature PR went through the same pattern:

1. **Spec → Plan → Dispatch**. I'd document what the feature should do, then send a detailed prompt to a subagent. The prompt being the most important artifact — it is where all the thought process and architecture come in to play. This is an iterative approach - pseudo code, documentation, discussion. Once I have a solid plan - we build.
2. **Subagent ships a PR**. The agent writes the code, tests, and commits, then opens the PR. I read what landed - and it's important I understand what's going on. I feel this is the step most people skip, so they lose sight of "what was built, and why, and what decisions were being made along the way." I don't care how much _you_ trust an AI model, I still see mistakes and bad assumptions from every model I've used. This is why you do not assume - you ask questions. And have a third pair of eyes.
3. **Review locally**. I run `/codex review` from the branch. Codex (with no context from the design conversation) reads the diff against `main` and reports findings tagged `[P1]` (block) or `[P2]` (advisory).
4. **Iterate**. Every P2 gets a small fix and a test. Run Codex again. Repeat until clean.
5. **Squash-merge**. Single feature commit on `main`.

This is why I doubt people that push any kind of "AI is so good, I don't bother reading code": **Across the several feature PRs in this project, Codex caught roughly twenty bugs that the implementing agent missed**. Across all the projects I've built, whether human or AI, in companies large and small - a third review always makes callouts that are (often) worth reviewing, or at the very least - make sure you understand WHY it was called out, and if it is actually a problem (or worth adding a comment about future functionality/concerns - sometimes your architecture can chance, and that "issue" can become a Big Fucking Problem™ or a non-issue™.)

Each round found a real race or edge case — this wasn't linter/black or isort issues. It was more-so things like "the failed-submit restore path silently drops audio-only and output-dir," "the URL-restore path racing with user typing clobbers their newer paste," "React StrictMode double-invokes the impure state updater."

The implementation had the correct code for the happy path; Codex thought adversarially about the timing. It works _so well_ together.

Two things this approach required:

- **A clear rule about when to stop.** P1 is non-negotiable. P2 is advisory; if Codex is on its nth iteration and still calling out "stale text could appear in this specific multi-step user flow," it's time to ship and let real-use bug reports drive the next pass. I baked that into my session notes.
- **Trusting Codex's adversarial framing over my gut.** Several findings looked like edge cases I would have dismissed in code review. Most of them turned out to be real, reproducible races that would have surfaced as flaky UI behavior. Letting Codex push back saved me from sloppy state machines - and that includes me pushing back. Occasionally, it was wrong - but the big part here is not "HA! AI WAS WRONG!" it's "AI was right more than it was wrong, and when pushed, it would validate itself for better or worse." It is _not_ a perfect execution, but it does take some back-and-forth at times - _kind of like how you should be dealing with PRs from people_.

It's also nice that Codex review is **local-only** by design. No CI, no per-PR API charges, no source code shipped through GitHub Actions logs. The gate runs against the branch's diff in my terminal, and I keep human-in-the-loop judgement explicit. When the rare false positive shows up, I document why I'm skipping it instead of "automating" the decision away. Documentation matters, people!

## The bug stories

Three of my "favorite" bugs from this build, speed-run style. I think I need to start journaling from the beginning instead of recounting… maybe the next fridge project. This originally started with three in draft, and after an annoying bug, I have one to add, now!

**1. yt-dlp probe hung the entire FastAPI loop and wedged Uvicorn's reload supervisor.** I pasted a YouTube URL, hit Queue, and the preview never returned. `curl http://127.0.0.1:8765/status` also hung. Ditto `/jobs`. Every endpoint accepted TCP but sent no data. `Ctrl-C` on `dev.sh` did nothing — the supervisor didn't terminate. `py-spy dump` on the supervisor PID showed three nested `signal_handler` frames at the top of the trace, waiting on `multiprocessing.Process.join`. The supervisor had received SIGTERM, tried to kill the worker child, and the worker was stuck in C code that couldn't be interrupted. More signals piled up (`SIGCHLD`, my repeated `Ctrl-Cs`), the signal handler reentered itself trying to take a `threading.Event` lock, and deadlocked the supervisor too.

**Fix:** the actual fix is the 30s `socket_timeout` + `asyncio.wait_for` belt-and-suspenders above. The recovery from that wedged state was `kill -9` on both PIDs, then `lsof -i :8765` to confirm the port had freed.

**2. Codex caught nine real races in one PR.** My eager-Queue-submit PR took nine rounds of Codex review before it returned clean. Every round found a real bug. The pattern was always the same: I'd add a feature, Codex would find a state machine edge-case I hadn't considered, I'd add a test plus a small fix, Codex would find the next-order interaction. The races included: a failed submit restoring the URL on top of the user's newer paste; a successful submit followed by a refresh failure being misclassified as a submit failure (which would have re-restored the URL and let the user double-enqueue); the preview's `useEffect` clearing the error state immediately after the failure-restore path set it; a URL-canonicalization mismatch ("youtu.be/X" vs "youtube.com/watch?v=X") that let the auto-submit timer re-arm after a failed manual submit. Each was one to three lines plus a test. By round nine I had a 113-test frontend suite that locks down a lot of corners I would have never thought to check out (the kind of thing that happens when you're the "sole-user/developer/tester" and have a limited pool of people interested in the tool, initially).

**Fix:** every round, one targeted fix and one new test. The PR description ended up as a list of nine races, which is more useful documentation than the code itself. The AI… default? to create these nice, and wordy commit messages and pull requests are a boon for me. Instead of hunting down conversations/tickets - it tends to put all the context in place, which makes future historical revisits (if it happens) FAR more informative. No "test fix" - "tesT" - "testing" - "final?" commits littering the logs. It types it up faster and more thorough than me, so I get fast PRs and plenty of details. AIs tend to do well summarizing work, because they have a tighter reference in their conext.

**3. The audio-only checkbox needed to know the difference between typing and pasting.** I wanted "audio-only" to be per-paste intent — when you paste URL A and check audio-only, then paste URL B, B should default back to video. The first version reset on any URL change, which broke the typing case (you'd lose your checkbox if you backspaced a character to fix a typo). Codex found the bug, I tightened the rule: reset only on non-typing transitions (paste-replace, multi-char extension, backspace, clear). A single appended character is the only thing that preserves the checkbox. That distinction sounds pedantic until you watch yourself paste a YouTube URL and immediately type "&t=30" to seek-on-load, and realize you don't want the checkbox to die between characters.

**Fix:** `isTypingExtension = value.startsWith(url) && value.length === url.length + 1`. Three lines of state-machine logic, six tests covering paste, replace, type-extend, paste-extend, backspace, and clear.

**4. The bug fix that was working as designed but still hurt.** PR #46 added the 30s probe timeout and I documented one known limit: `asyncio.wait_for` cancels the awaiter, not the thread. The thread keeps running until yt-dlp gives up. I shipped that with the caveat written down, and a few days later it bit me anyway — a YouTube radio mix probe hung for real, the executor pool filled with stuck threads, and even `/status` stopped responding because uvicorn's reload supervisor wedged on Ctrl-C trying to kill the unkillable worker. The signal-handler stack from `py-spy dump` was identical to the one I'd diagnosed the first time. The note left behind became the "okay, we need to fix this now."

**Fix:** moved probes to `subprocess.run`. The OS can kill what Python can't. The "known limit" is gone, not just written down in documentation. Lesson: a deferred fix in a known-limit comment is still a bug — write it down, sure, but also schedule it to be resolved! (I normally use github issues for personal projects for this reason - "I know it's a bug, I know it needs fixed eventually, but who knows when I'll get to it).

Each of these would have been pure suffering without the Codex-review gate as a forcing function. The implementing agent shipped code that looked right on inspection. And for me, the features were "gravy" - things that I had docuemnted as "future use-cases" but hadn't locked it down, but we found time to build it out - but Codex thinking about _how to break it_ found the corners I hadn't tested.

## Honest limits

`ytdl` is built for a single user, running it on their own machine. The `SECURITY.md` leads with "do not host publicly" — not as a license-style disclaimer, but as a real description of the threat model the codebase actually fits:

1. **YouTube's terms of service prohibit downloading.** [The RIAA filed a DMCA takedown](https://www.eff.org/deeplinks/2020/11/github-reinstates-youtube-dl-after-riaas-abuse-dmca) against `yt-dlp` on GitHub in 2020. Public yt-dlp proxies routinely receive cease-and-desist letters and lose their hosting providers. A self-hosted tool a single person runs on their own machine is a very different posture from a service strangers can hit.
2. **The cookies feature is operator-bound.** At startup, ytdl auto-detects the operator's local browser cookie store so age-gated and premium content "just works" against the operator's signed-in YouTube account. That's a great convenience for one person on their own laptop. The same feature on a public instance would mean every download a stranger triggered went out attached to whoever set the server up — their account banned within minutes, any private content they could access exfiltrated through their credentials. A real fix exists — per-user YouTube sign-in where each visitor authenticates and downloads run against _their_ tokens, not the operator's — but that's a substantial change: full auth, session management, per-user state isolation, YouTube OAuth integration (with its own Google approval gates), and a real potential for abuse. Doable, just not a small tweak - and again, this is a free service. We _could_ build this out and charge a fee for that implementation, which, maybe I will - so you can do it via a server, instead of locally - or you can just learn a little bit of code and do it for free!

If you're reading this and thinking "I want this for me" — that's the design. Run it on your machine, and it's yours. If you're thinking "I want this to be a service" — that's a different product with proper auth, abuse handling, rotating residential proxies for IP reputation, and a real legal posture. I built this - for me - and I'm sharing it because I used a lot of AI integration to assist in coding - and that seems fair, here - there's nothing remotely special about this, and anyone with a weekend and an AI agent could build the same.

## What's Next (as of publishing date)

- **Subprocess-based probes** so timeouts can actually kill the work, not just abandon it.
- **Synthetic playlist parent** for picker subsets — pick five videos from a fifty-video playlist, get one parent row with five children, cancel-all in one click.
- **Per-user output presets** so I can flip between `~/Music`, `~/Movies/YouTube`, and a one-off path without retyping.

But mostly, ytdl is at the point where the next improvements will come from using it. The remaining backlog items are nice-to-haves. The tool downloads videos. I run it locally. The codex-gate process helped teach me more about state-machine design than any side project in some time.

If you want to read the install walkthrough, it lives in the repo under `docs/install.md`: prereqs, first run, cookies setup, troubleshooting. The repo itself is public for now.
