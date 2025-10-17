---
title: "Building Image Optimizer: From Personal Tool to Developer API"
pubDatetime: 2025-10-16T19:00:00.000Z
modDatetime: 2025-10-17T03:44:44.778Z
slug: image-optimizer
featured: true
draft: true
tags:
    - Go
    - API
    - Image Optimization
    - Developer Tools
    - Performance
    - Next.js
description: |
    A deep dive into building Image Optimizer — a privacy-focused image optimization service that started as a simple utility and grew into a full-featured API with CLI tools and developer-friendly features.
---

> **TL;DR**: Built a production-ready image optimization service with Go + libvips, featuring a Next.js UI, CLI tool, API key authentication, rate limiting, and comprehensive Swagger documentation. Zero server storage, fully ephemeral processing, live at [squish.baker.is](https://squish.baker.is).

Like most side projects, this one started with frustration.

We started this to help my son out, who was working on images for his own projects and trying to squeeze every byte out he could from the loading process. He kept running into the same limitations: subscription walls, file size caps, or tools that destroyed image quality. I needed something better, something I could control, and something that respected my privacy.

So I built it.

## The Goal

Initially, I wanted a straightforward utility: take any image, make it smaller and faster without sacrificing quality. But once I saw the results from libvips — the performance, the quality, the flexibility — I realized this could be more than just a personal tool.

It evolved into:

- A **web UI** for drag-and-drop optimization
- A **REST API** for programmatic access
- A **CLI tool** for batch processing
- A **developer platform** with API keys, rate limiting, and Swagger docs

All while maintaining a core principle: **zero server-side storage**. Images are processed entirely in-memory and discarded immediately. No logs, no history, no tracking.

## Tech Stack: Why Go + libvips?

### The Backend: Go + Fiber

I chose **Go** for the API backend for several reasons:

1. **Performance**: Go's concurrency model handles multiple image processing requests efficiently
2. **libvips integration**: The [bimg](https://github.com/h2non/bimg) library provides excellent Go bindings for libvips
3. **Deployment simplicity**: Single binary, small Docker images, minimal runtime dependencies
4. **Type safety**: No runtime surprises when handling API parameters

The [Fiber framework](https://gofiber.io/) provided a familiar Express-like API with Go's performance characteristics.

### Why libvips?

Initially, I considered ImageMagick (via Go bindings), but libvips proved superior:

- **Speed**: 4-8x faster than ImageMagick for typical operations
- **Memory efficiency**: Streaming pipeline architecture uses minimal RAM
- **Quality**: Produces visually superior results, especially for resizing
- **Format support**: JPEG, PNG, WebP, AVIF, GIF with format-specific optimizations

The combination of libvips + **oxipng** for PNG post-processing delivers an additional 15-40% compression on top of libvips' already excellent PNG optimization.

### The Frontend: Next.js + TypeScript

The web UI needed to be fast, responsive, and easy to deploy. Next.js provided:

- **Static export capability**: Deploy to GitHub Pages as static files
- **TypeScript safety**: Type-safe API client with auto-completion
- **Modern React patterns**: Hooks, context, and clean component architecture
- **Tailwind CSS**: Rapid UI development with consistent design

Key UI features:

- Interactive before/after comparison slider
- Zoom and pan functionality (up to 4x magnification)
- Dark mode with automatic detection
- Shareable results via Web Share API
- Real-time file size reporting

## Architecture and Features

### Image Processing Core

The service supports multiple optimization strategies:

**Formats Supported:**

- JPEG (progressive encoding, Huffman optimization, chroma subsampling)
- PNG (compression levels 0-9, interlacing, palette mode, **oxipng post-processing**)
- WebP (lossless mode, compression effort tuning, encoding method selection)
- **AVIF** (20-30% better compression than WebP, cutting-edge format support)
- GIF (animated GIF preservation)

**Processing Features:**

- Quality/compression control (1-100 scale)
- Intelligent resizing with aspect ratio preservation
- Metadata stripping (EXIF removal for privacy)
- Color space management (automatic sRGB conversion)
- Smart optimization (returns original if optimized version is larger)

### API Design

The REST API exposes three primary endpoints:

```bash
# Single image optimization (file upload or URL)
POST /optimize
Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY

# Batch optimization (multiple images)
POST /batch-optimize
Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY

# Health check
GET /health
```

**Input flexibility:**

- File uploads via multipart/form-data
- URL-based fetching with domain whitelist validation (cloudinary, imgur, unsplash, pexels)
- 10MB maximum file size limit
- 10-second timeout for URL requests

**Security and rate limiting:**

- SQLite-backed API key management with cryptographically secure generation
- Bearer token authentication
- Sliding window rate limiter (100 requests/minute per IP)
- Comprehensive SSRF protection (domain whitelist + private IP blocking)
- Configurable via environment variables

### CLI Tool: imgopt

For developers who prefer command-line workflows, the `imgopt` CLI provides batch processing:

```bash
# Optimize all images in a directory
imgopt -input ./photos -output ./optimized -quality 85 -format webp

# Custom API endpoint
imgopt -input ./photos -api https://squish-api.baker.is/optimize
```

Features:

- Progress tracking for batch operations
- Configurable quality, dimensions, and output format
- Configuration file support (`.imgoptrc`) for project-specific defaults
- Human-readable output with file size formatting
- Summary statistics (total saved, compression ratio)

### Developer Experience: Swagger/OpenAPI Documentation

Every endpoint is fully documented with interactive Swagger UI at [`/swagger/index.html`](https://squish-api.baker.is/swagger/index.html).

The documentation includes:

- Request/response schemas with examples
- Parameter descriptions and validation rules
- Error response formats
- Authentication requirements
- Rate limiting information

Generated automatically from code annotations using [swaggo/swag](https://github.com/swaggo/swag), ensuring docs stay synchronized with implementation.

## Privacy and Security by Design

One of the core principles of this project: **your images are your business, not mine**.

**Zero Server Storage:**

- All image processing happens entirely in-memory
- Images are never written to disk (except temporary OS buffers managed by libvips)
- No optimization logs, no analytics, no tracking
- Ephemeral processing with automatic cleanup

**Security Measures:**

- **HTTP Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, and HSTS (over HTTPS)
- **SSRF Protection**: Domain whitelist combined with private IP blocking (loopback, RFC 1918 ranges, cloud metadata endpoints)
- **Production Error Handling**: Environment-aware error responses prevent internal details from leaking
- **API Key Security**: Cryptographically secure key generation (256-bit entropy) with SQLite-backed storage
- **Input Validation**: Comprehensive validation on all parameters with content-type verification
- **Resource Limits**: Size limits (10MB) and request timeouts prevent memory exhaustion and slowloris attacks

**GDPR Compliant:**

- No personal data collection
- No cookies
- No persistent storage of user content
- No third-party analytics or tracking scripts

## Deployment and Infrastructure

**Frontend: GitHub Pages**

- Next.js static export via GitHub Actions
- Custom domain: [squish.baker.is](https://squish.baker.is)
- Zero server costs for frontend hosting

**API: Render.com**

- Docker container deployment
- Persistent SQLite database on mounted disk volume
- Environment variable configuration
- Automatic HTTPS
- Custom domain: `squish-api.baker.is`

**Local Development:**

- Docker Compose for full-stack setup
- Tilt support for enhanced development workflow
- Hot reloading for both frontend and backend

## Real-World Performance

Testing with typical web images shows significant improvements:

**JPEG Optimization:**

- Original: 2.4 MB (high-quality photo)
- Optimized (quality 85): 389 KB
- Savings: **83.8%** with minimal perceptual quality loss

**PNG to WebP Conversion:**

- Original PNG: 1.1 MB
- WebP (quality 90): 156 KB
- Savings: **85.8%**

**PNG + oxipng Post-Processing:**

- libvips PNG: 245 KB
- After oxipng: 167 KB
- Additional savings: **31.8%**

## Lessons Learned

### 1. libvips is Vastly Underappreciated

Coming from a Node.js background where `sharp` (which wraps libvips) is popular, I underestimated how much better the performance would be in Go. The streaming architecture and memory efficiency made handling concurrent requests trivial.

### 2. Privacy as a Feature

Not storing images wasn't just a security decision — it became a selling point. Users care about privacy, especially when dealing with potentially sensitive images. Making ephemeral processing a core feature eliminated entire categories of security concerns.

### 3. API-First Design Enables Flexibility

Building the API first (before the UI) forced better design decisions. The web interface became just one client of the API, making it trivial to add the CLI tool later. The Swagger documentation became the single source of truth.

### 4. Go's Deployment Story is Excellent

Single-binary deployment with minimal dependencies made Docker images tiny (~50MB) and deployments bulletproof. No dependency hell, no runtime version mismatches, no surprise breaking changes.

### 5. Static Export for Frontends Reduces Complexity

Using Next.js static export eliminated the need for a Node.js server. The entire frontend is just HTML/CSS/JS served from GitHub Pages. Zero server maintenance, zero costs, infinite scalability for the UI.

## What's Next

The service is live and production-ready, but there are areas for enhancement:

**Planned Features:**

- **Smart format selection**: Automatically choose optimal format based on image content (photo vs. graphic vs. transparency needs)
- **Batch API improvements**: Better error reporting for partial failures
- **Usage analytics**: Per-API-key metrics dashboard (requests, bandwidth saved, optimization stats)
- **Advanced filtering**: Custom optimization profiles (e.g., "social media", "hero image", "thumbnail")

**Maybe Someday:**

- Monetization tiers (currently completely free)
- CDN integration for cached, optimized image delivery
- WebSocket support for real-time progress on large batch operations

## Try It Out

**Web UI:** [squish.baker.is](https://squish.baker.is)
**API Docs:** [squish-api.baker.is/swagger/index.html](https://squish-api.baker.is/swagger/index.html)
**Source Code:** [github.com/keif/image-optimizer](https://github.com/keif/image-optimizer)

The project demonstrates that it's possible to build a fast, privacy-focused image optimization service without complex infrastructure or expensive third-party services. The combination of Go's performance, libvips' quality, and modern frontend tooling creates a developer-friendly platform that respects user privacy.

If you're building something that processes images, I hope this serves as a practical reference for balancing performance, privacy, and developer experience.
