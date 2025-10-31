onerror = (errorEvent) => {
  console.debug(`Error in sharedWorker: ${errorEvent.message}`);
};

function formatDateTime(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const timeChannel = new BroadcastChannel("time-updates");

setInterval(() => {
  const now = new Date();
  const formattedTime = formatDateTime(now);
  timeChannel.postMessage({
    timestamp: now.toISOString(),
    formatted: formattedTime,
  });
}, 1000);
