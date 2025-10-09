---
title: "Goodbye Jib: Modernizing Container Builds for a Simpler CI/CD Workflow"
pubDatetime: 2025-10-07T21:00:00.000Z
modDatetime: 2025-10-09T06:24:26.399Z
slug: goodbye-jib-modernizing-builds
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

## The Backstory: When Build Tools Do “Too Much”

When you first start containerizing Java applications, [**Jib**](https://github.com/GoogleContainerTools/jib) feels like a miracle.  
No Dockerfile. No Docker daemon. Just a plugin that builds optimized images straight from our Gradle project. It removes friction and “just works.”

That convenience is intoxicating — until it wasn’t. Who doesn't love long `kubectl` commands that can be simplified with a simple `jib switch <env>`?

As the project entered a maintenance phase, its build tooling fell behind. Pinned Jib versions and out-of-date <abbr title="Google Cloud Platform">GCP</abbr> integrations made updates increasingly difficult. The need to modernize authentication (via updated `gcloud` tooling) and remove Jib altogether became a matter of aligning with existing developer tools and eliminating unnecessary dependencies.

Small plugin upgrades would change image layers unexpectedly. Caching behaved differently between CI and local builds. And debugging image-build issues meant spelunking through opaque plugin internals instead of simply reading a Dockerfile.

Over time, the cost of that abstraction started to outweigh its benefits.

---

## Where It Started to Hurt

The pain really began when we discovered that our GitLab-to-GCP deployment process was broken — and worse, there were no clear error logs explaining what had happened.

When we attempted to deploy the UI project (a custom Express app paired with an older Next.js framework), the build failed unexpectedly. Tracing the failure led us back through the CI pipeline and revealed that the problem wasn’t isolated to one repository - Jib was still in use across several layers, including the UI, caching, and API services. Each of these projects depended on the same outdated Jib configuration and shared plugin version.

Compounding the problem was the use of a custom Git token that was scoped too narrowly, causing authentication failures during image pushes. This token was embedded in the CI environment and not refreshed regularly, leading to silent failures that were difficult to diagnose.

That investigation made it clear: Jib had become the common bottleneck. Its pinned version, opaque build behavior, and silent failures in the cloud environment were blocking updates and preventing deployments. Once identified, the only real path forward was to remove Jib entirely and streamline deployments by adopting a direct `kubectl`-based workflow, aligning all affected repositories under a consistent, transparent deployment process.

---

## Defining the Modernization Goal

We didn’t want to just “get off Jib.” We wanted to **simplify** and **standardize**.

The modernization goals were clear:

1. **Transparency** — Every image should be reproducible from a visible, editable Dockerfile.
2. **Consistency** — The same pattern should apply across all languages and services.
3. **Observability** — CI logs should show every build step, not just plugin output.
4. **Portability** — Local builds should be identical to what runs in production.

In practice, these goals took shape through the modernization effort itself. Docker builds were already part of the system, but removing Jib brought transparency to how those images were built and deployed. The transition to direct `kubectl` deployments unified the process across multiple repositories—creating consistent pipelines, clearer logs, and an easier path to troubleshoot or reproduce deployments. Updating `gcloud` authentication (with `USE_GKE_CLOUD_AUTH_PLUGIN=true`) completed the picture, aligning CI and developer environments under the same tooling and meeting the goals of transparency, consistency, observability, and portability in one unified workflow.

---

## The Migration Plan

We rolled out the change in deliberate stages, focusing on one service at a time.

1. **Recreate the base image.**

We inspected what Jib was actually building under the hood and codified it in a Dockerfile:

```
FROM eclipse-temurin:17-jre-slim
COPY build/libs/app.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

2. Migrate secrets and configuration.

Environment variables replaced plugin-managed properties, aligning with Helm’s `env_secrets` convention.

3. Update pipelines.

Gradle tasks invoking Jib were swapped for standard docker build and docker push commands.
Helm (or plain kubectl) handled deployment uniformly across environments.

4. Automate and clean up.

Old plugin references, Jib cache folders, and redundant <abbr title="Yet Another Markup Language">YAML</abbr> fragments were removed.
We added validation scripts to ensure each image had a Dockerfile and Helm values configured properly.

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

The results were immediate:

- Simpler debugging. A broken build was now just a Docker build — readable, reproducible, and fixable.
- Faster pipelines. Consistent caching across services reduced build times by roughly 30–40%.
- Unified approach. The process was brought in line with existing internal development standards—no custom commands, no pinned versions, and no deviations from standard tooling.
- Cleaner onboarding. New engineers didn’t need to learn Jib’s internals or setup custom integrations and scripts; the Dockerfile told the whole story.
- CI/CD reliability. Local and CI builds produced identical images, removing environment drift.

---

## Lessons Learned

- Magic tools trade transparency for convenience. That’s fine early on, but can become a liability if it is not maintained.
- CI/CD is part of your codebase. Treat it like production code — review, test, and evolve it.
- Explicit beats implicit. A short Dockerfile is easier to maintain than a complex plugin.
- Consistency compounds. Standardizing one layer of your stack often simplifies three others.

---

## Closing Thoughts

Migrating away from Jib wasn’t about outgrowing the tool — it was about aligning our projects with existing internal tools and processes.  
The reliance on pinned, outdated versions and custom integrations had become a hidden risk, one that made deployments unpredictable and maintenance more difficult.

By simplifying the process and adopting the same workflow used across our other projects, we reduced friction, eliminated unnecessary dependencies, and gained consistency across environments.  
The result wasn’t just easier builds — it was a more maintainable, transparent, and reliable system.

Sometimes progress isn’t about moving faster or adopting new tools.  
It’s about realigning with the ones that already work best.
