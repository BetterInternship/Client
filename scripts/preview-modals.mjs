import { spawn } from "node:child_process";
import { platform } from "node:process";

const port = process.env.PORT || "3000";
const previewUrl =
  process.env.MODAL_PREVIEW_URL ||
  `http://hire.localhost:${port}/modal-preview`;

const browserCommand =
  platform === "win32"
    ? ["cmd.exe", ["/c", "start", "", previewUrl]]
    : platform === "darwin"
      ? ["open", [previewUrl]]
      : ["xdg-open", [previewUrl]];

const browser = spawn(...browserCommand, { detached: true, stdio: "ignore" });
browser.unref();

console.log(`Opened ${previewUrl}`);
console.log("Make sure the client dev server is running with npm run dev.");
