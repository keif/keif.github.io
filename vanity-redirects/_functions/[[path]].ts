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
    const html = await env.ASSETS.fetch(new URL('/linkedin/', url.origin));
    return html;
  } else if (hostname.startsWith('github.')) {
    // Serve the GitHub redirect page
    const html = await env.ASSETS.fetch(new URL('/github/', url.origin));
    return html;
  }

  // Default: return 404
  return new Response('Not Found', { status: 404 });
}
