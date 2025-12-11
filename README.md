# QR Tickety

This repo contains the full QR Ticketing app compatible with React 18 and Netlify Functions.

Local dev:
1. Create a .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
2. npm install
3. npm install -g netlify-cli
4. netlify dev

Deployment:
- Push to Git and connect to Netlify, set environment variables in site settings.

Security:
- Keep SUPABASE_SERVICE_ROLE_KEY secret; only used server-side in functions.
