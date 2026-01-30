# Vanity Redirects

Production-ready vanity URL redirects with analytics tracking, hosted on Cloudflare Pages.

## Live Redirects

- **linkedin.baker.is** → [LinkedIn Profile](https://www.linkedin.com/in/keithbaker/)
- **github.baker.is** → [GitHub Profile](https://github.com/keif)

All redirects track click-throughs via GoatCounter at `stats.baker.is`.

## How It Works

### Architecture

1. **Cloudflare Pages Function** (`/functions/[[path]].js`) intercepts all requests
2. Routes based on subdomain hostname (linkedin.baker.is vs github.baker.is)
3. Returns redirect HTML with:
   - GoatCounter tracking script
   - JavaScript redirect (100ms delay for beacon)
   - Meta refresh fallback for non-JS browsers
4. Tracks as `/out/linkedin` or `/out/github` in analytics

### File Structure

```
/functions/
  [[path]].js           # Pages Function - hostname-based routing (MUST be at repo root)

/vanity-redirects/
  index.html            # Root fallback page
  github/
    index.html          # GitHub redirect HTML
  linkedin/
    index.html          # LinkedIn redirect HTML
```

**IMPORTANT:** The `functions/` directory MUST be at the repository root, not inside `vanity-redirects/`. Cloudflare Pages only detects Functions at `/functions`.

## Adding New Redirects

### 1. Create HTML redirect page

```bash
mkdir -p vanity-redirects/newservice
```

Create `vanity-redirects/newservice/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="1;url=https://example.com/profile">
    <script data-goatcounter="https://stats.baker.is/count"
            data-goatcounter-settings='{"path": "/out/newservice"}'
            async src="https://stats.baker.is/count.js"></script>
</head>
<body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
    <div>
        <p>Redirecting to Service...</p>
        <p><a href="https://example.com/profile">Click here if you are not redirected</a></p>
    </div>
    <script>
        setTimeout(function() {
            window.location.replace('https://example.com/profile');
        }, 100);
    </script>
</body>
</html>
```

### 2. Update routing function

Edit `/functions/[[path]].js` and add new hostname check:

```javascript
} else if (hostname.startsWith('newservice.')) {
  return new Response(newserviceHTML, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

Add the HTML constant at the top of the file.

### 3. Commit and push

```bash
git add vanity-redirects/newservice functions/[[path]].js
git commit -m "feat(redirects): add newservice.baker.is redirect"
git push
```

### 4. Configure Cloudflare

1. Wait for Pages deployment to complete
2. Go to Cloudflare → Workers & Pages → keif-github-io
3. Settings → Domains → "Set up a custom domain"
4. Add `newservice.baker.is`
5. Cloudflare auto-creates DNS record

### 5. Test

- Visit `https://newservice.baker.is` (should redirect)
- Check `https://stats.baker.is` for `/out/newservice` tracking

## Cloudflare Pages Configuration

**Project:** keif-github-io

**Build Settings:**
- Framework preset: None
- Build command: (empty)
- Build output directory: `vanity-redirects`
- Root directory: `/` (empty)

**Why this works:**
- Pages serves static files from `/vanity-redirects/`
- Pages detects and compiles `/functions/[[path]].js`
- Function intercepts all requests and routes by hostname
- No build process needed - files deploy as-is

## Deployment

Automatic via GitHub webhook:
1. Push to `main` branch
2. Cloudflare Pages auto-deploys
3. Function compiles (check logs for "Found Functions directory")
4. New version goes live (~30 seconds)

**Verify deployment:**
```
Cloning repository...
Found Functions directory at /functions. Uploading.
✨ Success! Uploaded N files
Success: Your site was deployed!
```

## Analytics

All redirects send tracking beacons to GoatCounter:
- Dashboard: https://stats.baker.is
- Tracked paths: `/out/{service}`
- 100ms delay ensures beacon completes before redirect

## Technical Notes

- **302 semantics:** Using `window.location.replace()` (no browser history entry)
- **Fallback:** Meta refresh for users without JavaScript
- **Performance:** 100ms delay imperceptible to users, ensures analytics beacon
- **Privacy:** GoatCounter is privacy-friendly (no cookies, GDPR compliant)
- **No backend:** Pure static hosting + edge function

## Troubleshooting

**404 on custom domain:**
- Check domain is added in Cloudflare Pages settings
- Verify DNS record exists (CNAME to Pages)
- Wait 1-2 minutes for DNS propagation

**Function not deploying:**
- Verify `/functions/` is at repo root (not `/vanity-redirects/functions/`)
- Check deployment logs for "Found Functions directory"
- Ensure file is named `[[path]].js` (double brackets = catch-all)

**Tracking not working:**
- Verify `stats.baker.is` DNS points to `baker.goatcounter.com`
- Check browser console for script loading errors
- Confirm GoatCounter custom domain is configured
