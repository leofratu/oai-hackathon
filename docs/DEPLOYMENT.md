# Deployment

## Cloudflare Pages

Connect the public GitHub repository to Cloudflare Pages with these settings:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
```

Cloudflare installs dependencies, builds the Vite project, and publishes the contents of `dist`. The `public/_headers` file is copied into that directory during the build.

## Verify the deployment

1. Open the `*.pages.dev` URL and confirm the full chart renders.
2. Check that `Origin-Agent-Cluster`, `Permissions-Policy`, and `Content-Security-Policy` are present in the response.
3. Open the URL in ChatGPT's built-in browser and confirm the address bar lists six site tools.
4. Run one survey, answer one human question, accept a patch, and finish the expedition.

## Other hosts

The app can also be deployed to Netlify or Vercel. It requires static-file hosting with support for the headers in `public/_headers` or equivalent provider configuration.
