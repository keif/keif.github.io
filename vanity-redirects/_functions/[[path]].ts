interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Route based on subdomain
  if (hostname.startsWith('linkedin.')) {
    // Serve the LinkedIn redirect page
    const assetUrl = new URL('/linkedin/index.html', url.origin);
    const assetRequest = new Request(assetUrl, request);
    return env.ASSETS.fetch(assetRequest);
  } else if (hostname.startsWith('github.')) {
    // Serve the GitHub redirect page
    const assetUrl = new URL('/github/index.html', url.origin);
    const assetRequest = new Request(assetUrl, request);
    return env.ASSETS.fetch(assetRequest);
  }

  // Default: return 404
  return new Response('Not Found', { status: 404 });
}
