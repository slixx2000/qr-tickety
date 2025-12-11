#!/bin/bash

# -----------------------------
# Auto Ngrok + Vite Launcher
# -----------------------------

# REQUIREMENTS:
#   npm i -g ngrok   (or local ngrok binary)
#   export NGROK_API_KEY=xxxxx   (must be set)
# -----------------------------

# Check for API key
if [ -z "$NGROK_API_KEY" ]; then
  echo "❌ Missing NGROK_API_KEY environment variable."
  echo "Run:  export NGROK_API_KEY=your_key_here"
  exit 1
fi

echo "🔄 Starting ngrok..."
ngrok http 5173 --log=stdout > .ngrok.log 2>&1 &

NGROK_PID=$!
sleep 2

echo "⏳ Waiting for ngrok URL..."

# Poll ngrok API until URL is available
PUBLIC_URL=""
for i in {1..15}; do
  PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

  if [[ $PUBLIC_URL == http* ]]; then
    break
  fi

  sleep 1
done

# Stop if no URL
if [[ ! $PUBLIC_URL == http* ]]; then
  echo "❌ Could not get ngrok public URL."
  kill $NGROK_PID
  exit 1
fi

echo "🌍 Ngrok online: $PUBLIC_URL"

# Export URL for Vite
export PUBLIC_URL
export VITE_PUBLIC_URL=$PUBLIC_URL

echo "🚀 Launching Vite with host binding..."
npm run dev

# Cleanup when Vite exits
echo "🛑 Stopping ngrok..."
kill $NGROK_PID

