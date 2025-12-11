import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'localhost', // Always include localhost if you're developing locally
      'unglaring-gianna-noneligibly.ngrok-free.dev', 
      '.another-allowed-subdomain.com' // You can use a leading dot for subdomains
    ],
  },
});
