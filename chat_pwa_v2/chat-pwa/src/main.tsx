import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Start the shared worker for time updates
if ("SharedWorker" in window) {
  const timeWorker = new SharedWorker(
    new URL("./workers/sharedWorker.js", import.meta.url),
    { type: "module" }
  );

  timeWorker.port.start();

  timeWorker.onerror = (error) => {
    console.error("Shared Worker error:", error);
  };
} else {
  console.warn("SharedWorker is not supported in this browser");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
