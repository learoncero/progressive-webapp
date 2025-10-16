const ports = new Set();

onconnect = (connectEvent) => {
  const port = connectEvent.ports[0];
  port.onmessage = processMessage;
  ports.add(port);
};

onerror = (errorEvent) => {
  console.debug(`Error in sharedWorker: ${errorEvent.message}`);
};
let counter = 0;

setInterval(() => {
  counter++;
  if (counter % 1000 === 0) {
    broadcastMessage({ currentValue: counter });
  }
}, 0);
function broadcastMessage(message) {
  for (const port of ports) {
    try {
      port.postMessage(message);
    } catch (err) {
      ports.delete(port);
    }
  }
}

function processMessage(message) {
  if (message.data.command === "reset") {
    counter = 0;
  }
}
