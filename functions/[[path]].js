const linkedinHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="1;url=https://www.linkedin.com/in/keithbaker/">
    <script data-goatcounter="https://stats.baker.is/count"
            data-goatcounter-settings='{"path": "/out/linkedin"}'
            async src="https://stats.baker.is/count.js"></script>
</head>
<body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
    <div>
        <p>Redirecting to LinkedIn...</p>
        <p><a href="https://www.linkedin.com/in/keithbaker/">Click here if you are not redirected</a></p>
    </div>
    <script>
        setTimeout(function() {
            window.location.replace('https://www.linkedin.com/in/keithbaker/');
        }, 100);
    </script>
</body>
</html>`;

const githubHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="1;url=https://github.com/keif">
    <script data-goatcounter="https://stats.baker.is/count"
            data-goatcounter-settings='{"path": "/out/github"}'
            async src="https://stats.baker.is/count.js"></script>
</head>
<body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
    <div>
        <p>Redirecting to GitHub...</p>
        <p><a href="https://github.com/keif">Click here if you are not redirected</a></p>
    </div>
    <script>
        setTimeout(function() {
            window.location.replace('https://github.com/keif');
        }, 100);
    </script>
</body>
</html>`;

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  if (hostname.startsWith('linkedin.')) {
    return new Response(linkedinHTML, {
      headers: { 'Content-Type': 'text/html' },
    });
  } else if (hostname.startsWith('github.')) {
    return new Response(githubHTML, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new Response('Not Found', { status: 404 });
}
