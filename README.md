# QR Tickety

This repo contains the full QR Ticketing app compatible with React 18 and Netlify Functions.

Local dev:
1. Create a .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
2. npm install
3. npm install -g netlify-cli
4. netlify dev
   optional: run the automated script
   1. make it executable, chmod +x auto-ngrok-vite.sh
   2. run the file, ./auto-ngrok-vite.sh
   3. make sure you have made a ngrok account to add your link and sign into your terminal

Deployment:
- Push to Git and connect to Netlify, set environment variables in site settings.

Security:
- Keep SUPABASE_SERVICE_ROLE_KEY secret; only used server-side in functions.
