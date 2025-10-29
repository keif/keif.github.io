---
title: "Goodbye Jib: Modernizing Container Builds for a Simpler CI/CD Workflow"
pubDatetime: 2025-10-07T21:00:00.000Z
modDatetime: 2025-10-29T02:07:43.425Z
slug: goodbye-jib-modernizing-builds
featured: true
tags:
    - DevOps
    - CI/CD
    - Docker
    - Build Systems
    - Engineering
description: |
    How migrating from Jib to a transparent Docker-based workflow simplified and unified our build pipelines across multiple services.
---

> _A behind-the-scenes look at migrating multiple services away from Jib-based image builds toward a transparent, Docker-first workflow._

---

![Docker Modernization Cover](@/assets/images/docker-modernization-cover.webp)

## The Backstory: When Convenience Becomes a Liability

[**Jib**](https://github.com/GoogleContainerTools/jib) felt like magic at first.
No Dockerfile. No Docker daemon. Just a Gradle plugin that builds optimized images. It removes friction and "just works."

That convenience was great — until it wasn't.

The project entered maintenance mode, and the build tooling fell behind. Pinned Jib versions, outdated GCP integrations, authentication issues — updates got harder and harder.

Small plugin upgrades would change image layers unexpectedly. Caching worked differently in CI vs. local builds. Debugging meant digging through opaque plugin internals instead of just reading a Dockerfile.

The abstraction cost more than it saved.

---

## Where It Started to Hurt

The GitLab-to-GCP deployment process broke. No clear error logs, just failures.

Trying to deploy the UI project (custom Express + old Next.js) failed unexpectedly. Tracing it back revealed Jib was still in use across multiple services: UI, caching, API. All using the same outdated Jib config and plugin version.

Worse: a custom Git token scoped too narrowly caused auth failures during image pushes. It was embedded in CI, not refreshed regularly, and failed silently.

Jib became the bottleneck. Pinned versions, opaque behavior, silent cloud failures — blocking updates and preventing deployments. The fix? Rip it out entirely and move to a direct `kubectl` workflow.

---

## The Goal: Simplify and Standardize

We didn't just want to "get off Jib." We wanted simpler, more consistent builds.

What that meant:

1. **Transparency** — Every image reproducible from a visible Dockerfile
2. **Consistency** — Same pattern across all languages and services
3. **Observability** — CI logs showing every build step, not just plugin output
4. **Portability** — Local builds identical to production

Docker builds were already in the system. Removing Jib made them transparent. Moving to direct `kubectl` deployments unified the process across repos — consistent pipelines, clearer logs, easier troubleshooting. Updating `gcloud` auth (with `USE_GKE_CLOUD_AUTH_PLUGIN=true`) aligned everything under the same tooling.

---

## The Migration Plan

One service at a time, deliberately.

**1. Recreate the base image**

Inspected what Jib was building and codified it in a Dockerfile:

```
FROM eclipse-temurin:17-jre-slim
COPY build/libs/app.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**2. Migrate secrets and configuration**

Environment variables replaced plugin-managed properties. Aligned with Helm's `env_secrets` convention.

**3. Update pipelines**

Swapped Gradle tasks invoking Jib for standard `docker build` and `docker push`.
Helm (or plain kubectl) handled deployment uniformly.

**4. Automate and clean up**

Removed old plugin references, Jib cache folders, redundant YAML fragments. Added validation scripts to ensure each image had a Dockerfile and proper Helm values.

> **Cloud Authentication Updates:**  
> During the migration, we also discovered that our gcloud components were out of date. The older `gcloud` tooling no longer handled authentication correctly with newer Kubernetes clusters, which now require the `USE_GKE_CLOUD_AUTH_PLUGIN=true` environment variable. We updated the CI environment and local tooling to export this variable and align with the new gcloud authentication flow, ensuring seamless access to <abbr title="Google Kubernetes Engine">GKE</abbr> clusters during image deployment and Helm operations.

> **Callout:** Part of this cleanup was unpinning the build from the plugin version entirely. By moving to an explicit `Dockerfile`, base-image bumps (e.g., JRE updates or distroless refreshes) became small, isolated PRs instead of risky plugin upgrades.

---

## Before vs. After: CI Simplified

**Before (Jib-based Gradle Build)**

```yaml
build_job:
    image: gradle:8.5-jdk17
    script:
        # Using a pinned Jib plugin version to avoid breaking changes
        - ./gradlew clean jib \
          --image=myregistry.io/service:$CI_COMMIT_SHA \
          -Djib.to.auth.username=$REGISTRY_USER \
          -Djib.to.auth.password=$REGISTRY_PASSWORD
        - ./gradlew test
    only:
        - main
```

- Builds depended on the Gradle plugin version.
- Caching was opaque.
- Secrets had to be passed through Gradle properties.
- Hard to reproduce locally without the exact CI context.

**After (Docker-First Workflow)**

```yaml
build_job:
    image: docker:27.1.1
    services:
        - docker:dind
    script:
        - docker build -t myregistry.io/service:$CI_COMMIT_SHA .
        - docker push myregistry.io/service:$CI_COMMIT_SHA
        - docker run --rm myregistry.io/service:$CI_COMMIT_SHA pytest # or integration test
    only:
        - main
```

- Single Dockerfile defines the environment.
- Standard Docker caching applies across all projects.
- No build-tool coupling — works the same for any language.
- Local and CI builds are identical.

This shift cut CI build time by roughly 30–40%, eliminated version drift, and simplified debugging — the logs now show exactly what’s happening step-by-step.

---

## Diagram: Build Flow Before vs. After

```
          ┌──────────────────────────────┐
          │        Before (Jib)          │
          ├──────────────────────────────┤
          │ Gradle/Maven Plugin (Jib)    │
          │     ↓                        │
          │ Java Build → Jib Layers      │
          │     ↓                        │
          │ Jib Pushes to Registry       │
          │     ↓                        │
          │ Helm/K8s Deploy              │
          └──────────────────────────────┘

                     ▼ ▼ ▼

          ┌──────────────────────────────┐
          │        After (Docker)        │
          ├──────────────────────────────┤
          │ Dockerfile → docker build    │
          │     ↓                        │
          │ Standard Docker Image        │
          │     ↓                        │
          │ docker push to Registry      │
          │     ↓                        │
          │ Helm/K8s Deploy              │
          └──────────────────────────────┘
```

This shift not only simplified pipelines but unified how every team built and deployed services — regardless of language or framework.

---

## The Payoff

Immediate results:

- **Simpler debugging** — Broken build? Just a Docker build. Readable, reproducible, fixable.
- **Faster pipelines** — Consistent caching cut build times ~30-40%.
- **Unified approach** — Aligned with existing internal standards. No custom commands, no pinned versions.
- **Cleaner onboarding** — New engineers read the Dockerfile, not Jib internals.
- **CI/CD reliability** — Local and CI builds identical. No environment drift.

---

## What I Learned

- Magic tools trade transparency for convenience. Fine early on, liability later if unmaintained.
- CI/CD _is_ part of your codebase. Treat it like production code.
- Explicit beats implicit. Short Dockerfile > complex plugin.
- Consistency compounds. Standardize one layer, simplify three others.

---

## Closing Thoughts

This wasn't about outgrowing Jib. It was about aligning with existing internal tools and processes.

The pinned versions and custom integrations had become a hidden risk — unpredictable deployments, harder maintenance.

Simplifying the process and adopting the same workflow as other projects reduced friction, eliminated dependencies, and brought consistency across environments.

The result? More maintainable, transparent, reliable.

Sometimes progress isn't about moving faster or adopting new tools. It's about realigning with the ones that already work.
