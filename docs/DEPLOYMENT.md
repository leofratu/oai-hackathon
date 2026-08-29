# Deployment

Label Loop builds to static files and needs no runtime secrets.

## GitHub Pages

The repository workflow installs dependencies, runs the production build, and publishes `dist` from the `main` branch. The current project URL is:

https://leofratu.github.io/oai-hackathon/

## Cloudflare Pages

Connect the public repository with:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
```

## Netlify and Vercel

Netlify can use the included `netlify.toml`. Vercel detects Vite automatically; set the output directory to `dist` if required.

## Deployment check

1. Open the HTTPS URL and confirm the full training console renders.
2. Check that `Origin-Agent-Cluster`, `Permissions-Policy`, and `Content-Security-Policy` are present where the host supports custom headers.
3. Open the URL in a WebMCP-capable browser and confirm nine site tools register.
4. Complete one review, training, evaluation, and configuration proposal cycle.
5. Reload the page and confirm the deterministic seed state returns.
