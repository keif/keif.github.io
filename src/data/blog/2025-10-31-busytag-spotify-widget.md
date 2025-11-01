---
title: Making a Spotify Widget Work on macOS (and Fixing the Bugs)
pubDatetime: 2025-10-31T00:00:00.000Z
modDatetime: 2025-11-01T02:55:51.571Z
slug: busytag-spotify-widget
featured: true
draft: false
tags:
    - Python
    - Spotify API
    - BusyTag
    - Cross-Platform
    - macOS
    - Windows
description: Took a Windows-only BusyTag widget and made it work on macOS. Found some fun bugs involving file buffering and learned why fsync() matters.
---

![BusyTag Spotify Widget](@/assets/images/album-change-busy-tag.gif)

I wanted to use a [BusyTag](https://www.busy-tag.com/) [Spotify Widget](https://github.com/busy-tag/Busy_Tag_Spotify_Widget) with my Mac. Problem: it was originally coded to work on Windows. So I fixed that, and ran into some interesting bugs along the way.

## What It Does

The widget:

- Grabs currently playing track info from Spotify's API
- Shows album art, track name, and artist on the BusyTag screen
- Pulls colors from the album art to set the LED colors
- Updates whenever the track changes

## The Windows Problem

Original version only worked on Windows. It assumed drive letters (`D:\`, `E:\`, etc.) for accessing the BusyTag, which mounts as a USB device.

The core idea was good, but macOS doesn't use drive letters. Needed to fix that.

## Making It Work on macOS

### Volume Paths Are Different

On macOS, USB devices mount at `/Volumes/<NAME>` instead of drive letters. Added platform detection:

- **macOS/Linux**: Defaults to `/Volumes/NO NAME` (you can override)
- **Windows**: Asks for drive letter and builds the path

Python's `os.path` made most of this straightforward. Tested it on macOS and it works.

## The Intermittent Bug

Got the platform stuff working, but then hit a weird issue: config file would write, but the BusyTag wouldn't always update. Sometimes it worked. Sometimes it didn't.

Intermittent bugs are the worst.

**The problem:** File buffering.

Python doesn't immediately flush writes to disk. On a regular hard drive, you don't notice. On a USB device that's actively reading its config file? Timing matters.

The fix:

```python
with open(config_path, 'w') as f:
    json.dump(config_data, f, indent=2)
    f.flush()
    os.fsync(f.fileno())
```

`flush()` tells Python to write the buffer. `fsync()` tells the OS to actually commit it to the device. Now the BusyTag sees updates immediately.

No remounting needed. Just proper file synchronization.

## LED Colors That Match the Album

Once things were stable, I wanted to make it more interesting: auto-set the BusyTag LEDs to match the album art.

### Picking a Color

Album art has lots of colors. Which one do you pick?

- **Dominant**: Most common color
- **Vibrant**: Most saturated/eye-catching
- **Complementary**: Matches the dominant tones
- **Bright**: Brightest available

I built it to support different modes. Default is "vibrant" because it looks the coolest.

### How It Works

1. Download album art from Spotify
2. Analyze using HSV color space
3. Find pixels matching the mode criteria
4. Average those colors
5. Write to BusyTag config

For vibrant mode, it looks for high saturation and moderate brightness. Avoids muddy colors and washed-out ones.

### Config Format Gotcha

Took me a few tries to get the config structure right. BusyTag needs:

```json
{
    "solid_color": {
        "color": "#FF5733"
    }
}
```

Made some reference configs, did trial and error, got it working. Now the LEDs pulse with colors from each album.

## What I Ended Up With

Works on macOS now. Updates reliably. LEDs shift from deep blues for jazz albums to vibrant reds for rock. It's oddly satisfying to watch.

(Should still work on Windows too—I kept the original logic intact—but I didn't test it.)

## The Stack

- Python 3.6+
- Pillow (image processing and color extraction)
- Spotify Web API (track info)
- OAuth 2.0 (authentication)
- HSV color space (color picking)

## What I Learned

**Platform assumptions are everywhere.** Simple path handling can hide platform-specific quirks.

**File buffering matters for USB devices.** You need explicit `fsync()` calls. USB doesn't behave like a regular filesystem.

**Picking colors from images is harder than it looks.** There's no single "right" answer—it depends what you're going for.

**Config formats are finicky.** Always validate against the actual device behavior, not what you think it should be.

## Links

Original source: [busy-tag/Busy_Tag_Spotify_Widget](https://github.com/busy-tag/Busy_Tag_Spotify_Widget)

My fork (macOS support + LED colors): [keif/Busy_Tag_Spotify_Widget](https://github.com/keif/Busy_Tag_Spotify_Widget)
