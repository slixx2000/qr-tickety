import fs from "fs";
import os from "os";

const LOG_PATH = `${os.homedir()}/.ngrok2/ngrok.log`;
const VITE_CONFIG = "vite.config.js";

if (!fs.existsSync(LOG_PATH)) {
  console.error("Ngrok log file not found. Start ngrok first: ngrok http 5173");
  process.exit(1);
}

const log = fs.readFileSync(LOG_PATH, "utf8");

// Find last https://xxxxx.ngrok-free.dev URL
const match = log.match(/https:\/\/([a-zA-Z0-9\-]+\.ngrok-free\.dev)/g);
if (!match) {
  console.error("No public ngrok URL found in log.");
  process.exit(1);
}

const url = match.pop().replace("https://", "");
console.log("Detected ngrok domain:", url);

// Edit vite.config.js
let config = fs.readFileSync(VITE_CONFIG, "utf8");

const regex = /allowedHosts:\s*\[[^\]]*\]/;
const newBlock = `allowedHosts: ["localhost", "127.0.0.1", ".ngrok-free.dev", "${url}"]`;

if (regex.test(config)) {
  config = config.replace(regex, newBlock);
} else {
  config = config.replace(/server:\s*\{/, `server: { ${newBlock},`);
}

fs.writeFileSync(VITE_CONFIG, config);
console.log("Vite config updated successfully.");
