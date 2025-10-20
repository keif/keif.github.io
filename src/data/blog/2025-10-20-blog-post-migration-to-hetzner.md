---
title: "From Localhost to Hetzner: A Love Story in Four Acts"
pubDatetime: 2025-10-20T02:30:00.000Z
modDatetime: 2025-10-20T07:04:23.770Z
slug: migration-to-hetzner
featured: true
draft: false
tags:
    - DevOps
    - Hosting
    - Migration
    - Hetzner
    - Fly.io
    - Go
    - Cost Optimization
    - VPS
description: How I became a hosting provider connoisseur by migrating from localhost to Render to Fly.io to Hetzner—all because of a memory-hungry sprite sheet and basic economics.
---

# From Localhost to Hetzner: A Love Story in Four Acts

_Or: How I Became a Hosting Provider Connoisseur Without Meaning To_

---

## Act I: The Humble Beginning (localhost)

It all started innocently enough. I built an image optimizer API in Go, slapped together a Next.js frontend, and ran it on my laptop while sipping coffee and feeling like a real developer. Life was simple. The app was fast. The costs were zero (well, except for the electricity bill and the therapy needed after debugging CORS for the third time).

But then came the inevitable question: "Can other people use this?"

Narrator: _They could not use this._

---

## Act II: The Render Romance (render.com)

"Deploy to Render!" the internet shouted. "It's free! It's easy! It has a cute dashboard!"

And it was! For about two weeks. Then I discovered that:

- Free tier goes to sleep after inactivity (rude)
- Waking up takes 30-60 seconds (very rude)
- Users don't appreciate waiting a minute to optimize a tiny PNG

So I did what any rational developer would do: I panic-searched "fast hosting" at 2 AM and found...

---

## Act III: The Fly.io Fling (fly.io)

Fly.io promised edge computing, global distribution, and vibes. The deployment was _chef's kiss_. The CLI was beautiful. The architecture diagrams in their docs made me feel smart.

Everything was perfect until one fateful day when a user uploaded a 10,766×9,913 pixel sprite sheet.

**Fly.io**: "Out of Memory"
**Me**: "But I gave you 2GB!"
**Fly.io**: "Yeah, about that..."

Turns out, processing massive images with libvips while auto-resizing and adding padding requires... more than 2GB of RAM. Who knew? (Spoiler: Everyone who's ever processed images knew.)

### The Pricing Revelation

I looked at upgrading to 4GB of RAM on Fly.io:

- **2GB VM**: ~$12/month
- **4GB VM**: ~$24/month

Then I looked at Hetzner:

- **4GB VPS (CX22)**: €5.83/month (~$6.50)

_Record scratch sound_

Wait. Let me get this straight. I can pay:

- **More** for less RAM and keep the cool kids hosting
- **Less** for more RAM but have to do actual DevOps

My wallet made the decision for me.

---

## Act IV: The Hetzner Homecoming (hetzner.com)

And so began the great migration. Armed with a 900-line migration guide (yes, I wrote it myself, yes, I'm fun at parties), I embarked on the journey from managed cloud utopia to "I own a server now, help."

### What I Learned

**Things that were harder than expected:**

- Remembering that `bimg` requires CGO so you can't just build on macOS and yeet the binary to Linux
- Creating `/var/log/caddy` before Caddy tries to write to it (who knew permissions mattered?)
- Explaining to myself why I needed to type `systemctl` so many times

**Things that were easier than expected:**

- Caddy automatically getting SSL certificates (thank you, Let's Encrypt overlords)
- Ubuntu 22.04 just... working
- The existential satisfaction of running `htop` and seeing YOUR processes on YOUR server

### The Results

**Before (Fly.io):**

- 2GB RAM
- OOM errors on large images
- $12/month
- Cool deployment story at meetups

**After (Hetzner):**

- 4GB RAM (2x!)
- No OOM errors
- €5.83/month (~$6.50)
- Slightly less cool deployment story, significantly cooler AWS bill... wait, wrong cloud

**Savings**: $66/year (that's like... 13 fancy coffees, or 66 regular coffees, or infinite water)

---

## The Stack (For the Nerds)

**Frontend**: GitHub Pages
_Status_: Never touched it, still works, 10/10

**Backend**: Hetzner Cloud CX22

- Ubuntu 22.04 (because I'm basic)
- Go 1.22 with libvips (for the image magic)
- Caddy (the reverse proxy that just works™)
- Systemd (because apparently I run a real server now)

**Deployment Process**:

```bash
rsync source-code hetzner-server:/tmp/
ssh hetzner-server
go build
mv binary /usr/local/bin/
systemctl restart image-optimizer
```

_Future me reading this_: "Why didn't you just use Docker?"
_Current me_: "BECAUSE WE'RE ITERATING, OKAY?"

---

## Lessons Learned

1. **Hosting loyalty is a myth** - Use what works, migrate when it doesn't
2. **Always have 2x the RAM you think you need** - Images are sneaky memory hogs
3. **Write migration docs DURING migration** - Future you will thank past you
4. **Managed services are worth it... until they're not** - The line is different for everyone
5. **Europe has better VPS pricing** - Sorry, American data centers

---

## What's Next?

Now that I'm no longer hemorrhaging money on RAM I don't have, I can focus on the important things:

- [ ] Actually use the extra 2GB of RAM
- [ ] Write more blog posts about migrations (kidding)
- [ ] Build features instead of moving servers
- [ ] Resist the urge to migrate to another provider just for fun
- [ ] Set up monitoring before something breaks

---

## The Real Moral of the Story

Sometimes the best solution isn't the shiniest one. Sometimes it's the boring VPS from a German company you've never heard of that just quietly works and costs half as much.

Also, if you're processing images: **buy more RAM than you think you need**. This is not a suggestion. This is a warning from someone who learned the hard way.

---

## Acknowledgments

- **Fly.io**: Thanks for the good times and the fancy CLI
- **Render.com**: You tried, buddy
- **Localhost**: You'll always be my first
- **Hetzner**: Welcome to the family
- **Let's Encrypt**: You're doing the lord's work
- **The 10,766×9,913 pixel sprite**: You monster

---

_P.S. - If you're reading this in 2026 and I've migrated again, no you didn't._

_P.P.S. - If I ever write "From Hetzner to [X]", someone please stage an intervention._

---

**Technical specs for the curious:**

- **Migration time**: ~2 hours (including fixing my own documentation bugs)
- **Downtime**: ~5 minutes (DNS propagation)
- **Lines of migration docs**: 900+
- **Bugs encountered**: 3 (CGO cross-compilation, log permissions, missing version variables)
- **Coffees consumed**: Yes

---

_Want to see the migration guide? It's [probably on GitHub](https://github.com) with more systemd commands than anyone should ever need._

_Have your own hosting horror story? I'd love to hear it. Misery loves company._

---

**Update 2025-10-20**: It's been 3 hours since migration. No OOM errors. Living the dream.
