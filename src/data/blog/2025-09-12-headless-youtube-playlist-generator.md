---
title: Building a Headless YouTube Playlist Generator with OAuth and Quota Management
author: Keith Baker
pubDatetime: 2025-09-11T19:32:00.000Z
modDatetime: 2025-10-09T06:53:52.680Z
slug: headless-youtube-playlist-generator
featured: false
tags:
    - YouTube
    - API
    - Python
    - CLI
    - OAuth
    - Google API
    - DevTools
    - Automation
description: How I built a CLI tool to create YouTube playlists from my subscriptions, with quota-aware API calls, OAuth caching, and no frontend.
image: ""
---

> **TL;DR**: I built a CLI tool that creates YouTube playlists from your subscriptions without a frontend. It uses OAuth, respects API quota, handles caching and retries, and works great as a cron job. [Source code on GitHub](https://github.com/keif/playlist-from-subs).

As someone subscribed to _too many_ YouTube channels, I wanted a simple way to keep up with new content while I worked—a reliable, personal channel of new(ish) videos from the creators I actually care about. YouTube’s feed couldn’t keep up, and manual playlisting was a tedious mess. I wanted a better solution. So I built one! A headless CLI tool that turns my recent subscriptions into an actual playlist, with intelligent caching and quota-aware design.

This post chronicles the technical journey: from understanding YouTube's API constraints to implementing intelligent quota management and designing a user-friendly headless experience.

## The Problem: YouTube's Subscription Overload

I feel like my kids reflect the modern YouTube users - subscribed to dozens or hundreds of channels. The platform's algorithm-driven feed doesn't reliably show all new content, especially from smaller creators. I needed a system that could:

- Automatically fetch recent uploads from all my subscriptions
- Filter content based on my preferences (duration, content type)
- Create and maintain a curated playlist
- Run unattended as a scheduled job
- Minimize YouTube API quota usage (the daily limit is **only 10,000 units**)

## Understanding YouTube's Data API v3

The YouTube Data API v3 is powerful but comes with strict [quota limitations](https://developers.google.com/youtube/v3/determine_quota_cost). Each operation consumes "quota units":

### Key Endpoints and Their Costs

```json
{
    "subscriptions.list": 1, // Get user subscriptions
    "channels.list": 1, // Get channel details
    "playlistItems.list": 1, // List playlist contents
    "videos.list": 1, // Get video metadata
    "playlistItems.insert": 50, // Add video to playlist
    "search.list": 100 // Search for videos (expensive!)
}
```

The quota system immediately highlighted the challenge: naive implementations could easily burn through the 10,000 daily units with just a few operations - much like I did with my first iteration of my script.

### The Expensive Operations

Initially, I considered using `search.list` to find recent videos, but at 100 units per call, this approach was unsustainable. Instead, I worked to create a more efficient pattern:

1. Use `subscriptions.list` to get all subscribed channels (1 unit per ~50 channels)
2. Extract each channel's "uploads playlist ID" via `channels.list` (1 unit per ~50 channels)
3. Fetch recent videos from uploads playlists via `playlistItems.list` (1 unit per ~50 videos)
4. Batch video details through `videos.list` (1 unit per ~50 videos)

This approach reduced quota consumption by **approximately 98%** compared to search-based methods.

## OAuth Flow with Refresh Tokens and Caching

YouTube API access requires OAuth 2.0 authentication. For a headless tool that runs on cron schedules, the authentication flow needed to be robust and automatic.

### Initial Authentication

The first-time setup requires user interaction:

```python
def get_authenticated_service():
    creds = None

    # Load existing token if available
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as token:
            creds = pickle.load(token)

    # Refresh expired tokens automatically
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                logger.info("Token refreshed successfully")
            except RefreshError:
                creds = None  # Force new auth flow
```

### Handling Refresh Token Expiration

Google's refresh tokens can expire after extended periods of inactivity or if the user changes their password. The authentication module gracefully handles this:

```python
# If refresh fails, fall back to interactive flow
if not creds:
    flow = InstalledAppFlow.from_client_secrets_file(
        CREDENTIALS_FILE, SCOPES
    )
    creds = flow.run_local_server(port=0)

# Always save credentials for future runs
with open(TOKEN_FILE, "wb") as token:
    pickle.dump(creds, token)
```

### Security Considerations

The implementation stores tokens locally using Python's `pickle` module. For production deployments, consider:

- Encrypting stored tokens
- Using cloud-based secret management
- Implementing token rotation policies

## Intelligent Quota Management

With only 10,000 quota units per day, every API call needed to be optimized and tracked.

### Real-Time Quota Tracking

Every API call is automatically instrumented:

```python
def track_api_call(method_name: str) -> None:
    """Track an API call for quota analysis."""
    global api_call_counter
    api_call_counter[method_name] = api_call_counter.get(method_name, 0) + 1
    logger.debug(f"API call tracked: {method_name} (count: {api_call_counter[method_name]})")
```

This creates a real-time log of API usage patterns.

### Batching Strategy

The most significant optimization I ran into, was implementing proper batching:

```python
def _get_videos_details(self, video_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """Fetch video details for up to 50 video IDs per API call."""
    details = {}
    batch_size = 50

    for i in range(0, len(video_ids), batch_size):
        batch = video_ids[i:i + batch_size]

        # Single API call for up to 50 videos
        request = self.service.videos().list(
            part="contentDetails,snippet",
            id=",".join(batch)
        )
        response = request.execute()
        track_api_call("videos.list")

        # Process batch results...
```

This approach reduced video detail fetching from potentially hundreds of API calls to just a few batched requests.

### Intelligent Caching

To avoid redundant API calls, the system implements multiple caching layers:

1. **Playlist Content Cache**: Existing playlist contents are cached for 12 hours
2. **Processed Video Cache**: Maintains a persistent list of previously processed videos
3. **Duplicate Detection**: Pre-filters videos already in the playlist before attempting insertion

```python
def fetch_existing_playlist_items(self, playlist_id: str) -> Set[str]:
    """Fetch playlist contents with 12-hour TTL disk cache."""
    cache_file = os.path.join(self.data_dir, "playlist_cache", f"existing_playlist_items_{playlist_id}.json")

    # Check cache validity
    if os.path.exists(cache_file):
        cache_age = time.time() - os.path.getmtime(cache_file)
        if cache_age < 12 * 3600:  # 12 hours
            # Return cached data
            pass

    # Fresh fetch if cache miss/expired
    # ... API call and cache update
```

## Retry Logic and CLI Design

### Robust Error Handling

YouTube API calls can fail for various reasons: quota exceeded, network issues, or temporary service problems. So in this implementation, I added comprehensive error handling:

```python
def _get_videos_details_batch(self, video_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    max_retries = 1
    for attempt in range(max_retries + 1):
        try:
            response = request.execute()
            track_api_call("videos.list")
            return batch_details

        except HttpError as e:
            if e.resp.status == 403 and "quotaExceeded" in str(e):
                self.quota_exceeded = True
                logger.error("YouTube API quota exceeded. Try again after 12AM Pacific Time.")
                return {}
            elif attempt < max_retries:
                logger.warning(f"API error (attempt {attempt + 1}/{max_retries + 1}): {e}")
                time.sleep(1)  # Brief delay before retry
                continue
```

When quota limits are hit, the system gracefully terminates and provides clear instructions to the user.

### CLI Flags and User Experience

For a headless tool, the command-line interface needed to be both powerful and intuitive:

```bash
# Basic operation
python -m yt_sub_playlist

# Development and testing
python -m yt_sub_playlist --dry-run --verbose

# Production with limits
python -m yt_sub_playlist --limit 20 --report output.csv
```

Key UX decisions:

- **Dry-run mode** for safe testing without API quota consumption
- **Verbose logging** for debugging and monitoring
- **CSV reporting** for analyzing processed videos
- **Limit flags** for quota-conscious operation

### Shell Script Wrappers

To simplify common operations, the project includes convenience scripts:

```bash
#!/bin/bash
# dryrun.sh - Safe testing
cd "$(dirname "$0")/../.." || exit 1
python -m yt_sub_playlist --dry-run --verbose --report "reports/dryrun_$(date +%Y%m%d_%H%M%S).csv"

#!/bin/bash
# run.sh - Production execution
cd "$(dirname "$0")/../.." || exit 1
python -m yt_sub_playlist --report "reports/videos_added_$(date +%Y%m%d_%H%M%S).csv"
```

These scripts handle common patterns and provide consistent logging/reporting.

## Lessons Learned

### 1. API Quota is a First-Class Constraint

Traditional database-backed applications rarely need to worry about read quotas, but API-based tools must treat quota as a primary constraint. Every feature decision should consider
quota implications.

**Key insight**: Implement quota tracking from day one. It's nearly impossible to optimize what you can't measure.

### 2. Caching Strategy Matters More Than Performance

With API quotas, caching isn't about speed—it's about feasibility. A cache miss could mean the difference between a successful run and hitting daily limits.

**Key insight**: Design cache invalidation policies around API economics, not just data freshness.

### 3. Error Handling Should Guide User Behavior

YouTube's quota errors come with specific guidance ("wait until 12AM Pacific"). The application should surface this information clearly:

```python
if e.resp.status == 403 and "quotaExceeded" in str(e):
    self.quota_exceeded = True
    logger.error("YouTube API quota exceeded. Try again after 12AM Pacific Time.")
```

### 4. Batch Operations Transform Economics

The difference between individual and batched API calls is often 50x in quota consumption. Always look for batching opportunities.

**Key insight**: API design patterns that work for small datasets can be catastrophically expensive at scale.

### 5. Headless Tools Need Excellent Observability

Without a GUI, logs and reports become the primary user interface. Invest heavily in:

- Clear, actionable error messages
- Progress indicators for long-running operations
- Comprehensive reporting for post-run analysis
- Structured logging for operational monitoring

## Real-World Performance

After optimization, typical runs show dramatic improvements:

- **Before optimization**: ~8,000-9,000 quota units per run
- **After optimization**: ~500-1,000 quota units per run
- **Quota reduction**: 85-90%

A sample quota report:

_yes, I asked AI to find me emojis to add! I like them in reports/logs_

```
📊 Quota Usage Analysis:
channels.list            :  15 calls ×  1 units =   15 units
subscriptions.list       :   3 calls ×  1 units =    3 units
playlistItems.list       :  12 calls ×  1 units =   12 units
videos.list              :   8 calls ×  1 units =    8 units
playlistItems.insert     :  45 calls × 50 units = 2250 units
playlists.list           :   1 calls ×  1 units =    1 units

🔢 Total Estimated Usage: 2289 / 10000 units
```

## The Result

The final system runs reliably on a cron schedule, processing hundreds of subscription channels while staying well within YouTube's API limits. It's been running in production for
months, automatically maintaining a playlist of recent content filtered by my preferences.

### Architecture Highlights

- **Modular Python package** with clear separation of concerns
- **Comprehensive configuration system** via environment variables
- **Multiple interfaces**: direct Python import, CLI, and shell scripts
- **Production-ready logging and monitoring**
- **Quota-aware design** throughout the application stack

## Contributing and Source Code

The complete source code is available on GitHub: [yt-sub-playlist](https://github.com/keif/playlist-from-subs)

Key areas for contribution:

- Web dashboard interface for non-technical users
- Advanced filtering rules (regex patterns, custom criteria)
- Multiple playlist targets and playlist cleanup features
- Docker containerization for cloud deployment
- Integration with other platforms (Plex, Jellyfin, etc.)

The project demonstrates that with careful API design and quota management, it's possible to build powerful automation tools that work within platform constraints. The key is treating
API quotas not as an afterthought, but as a fundamental architectural constraint that guides every design decision.

_Interested in building your own YouTube automation tools? The techniques described here apply broadly to any quota-limited API. Start with comprehensive tracking, implement intelligent caching, and always batch your operations._
