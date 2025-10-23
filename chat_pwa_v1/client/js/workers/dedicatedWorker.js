self.onerror = (errorEvent) => {
  console.debug(`Error in worker: ${errorEvent.message}`);
};

const startTime = Date.now();

function formatDuration(durationMs) {
  if (durationMs < 0) return "00:00:00";

  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

setInterval(() => {
  const sessionDuration = Date.now() - startTime;
  const formattedDuration = formatDuration(sessionDuration);
  postMessage({ currentValue: formattedDuration });
}, 1);
