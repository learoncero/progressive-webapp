const ports = new Set();

onconnect = (connectEvent) => {
  ports.add(connectEvent.ports[0]);
};

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

setInterval(() => {
  const now = new Date();
  const formattedTime = formatDateTime(now);
  broadcastMessage({ currentValue: formattedTime });
}, 1000);

function broadcastMessage(message) {
  for (const port of ports) {
    try {
      port.postMessage(message);
    } catch (err) {
      ports.delete(port);
    }
  }
}
