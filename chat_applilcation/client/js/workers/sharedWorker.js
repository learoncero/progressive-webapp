// Keep track of all connected ports
const connectedPorts = new Set();
let timeInterval = null;

// Handle new connections
onconnect = function (event) {
  const port = event.ports[0];

  console.log("SharedWorker: New connection established");
  connectedPorts.add(port);

  sendTimeUpdate(port);

  if (connectedPorts.size === 1) {
    startTimeUpdates();
  }

  // Handle messages from the main thread
  port.onmessage = function (e) {
    const { type, data } = e.data;

    switch (type) {
      case "GET_TIME":
        sendTimeUpdate(port);
        break;

      case "SET_INTERVAL":
        const interval = data.interval || 1000;
        restartTimeUpdates(interval);
        break;

      case "STOP_UPDATES":
        stopTimeUpdates();
        break;

      case "START_UPDATES":
        const updateInterval = data.interval || 1000;
        startTimeUpdates(updateInterval);
        break;

      default:
        port.postMessage({
          type: "ERROR",
          message: `Unknown message type: ${type}`,
        });
    }
  };

  // Handle port disconnection
  port.addEventListener("close", () => {
    handlePortDisconnection(port);
  });

  // Start the port
  port.start();
};

function startTimeUpdates(interval = 1000) {
  if (timeInterval) {
    clearInterval(timeInterval);
  }

  console.log(`SharedWorker: Starting time updates every ${interval}ms`);

  timeInterval = setInterval(() => {
    broadcastTimeUpdate();
  }, interval);
}

function stopTimeUpdates() {
  if (timeInterval) {
    console.log("SharedWorker: Stopping time updates");
    clearInterval(timeInterval);
    timeInterval = null;
  }
}

function restartTimeUpdates(interval = 1000) {
  stopTimeUpdates();
  startTimeUpdates(interval);
}

function sendTimeUpdate(port) {
  const now = new Date();
  const timeData = {
    type: "TIME_UPDATE",
    timestamp: now.getTime(),
    formatted: {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      iso: now.toISOString(),
      relative: getRelativeTime(now),
    },
  };

  try {
    port.postMessage(timeData);
  } catch (error) {
    console.error("SharedWorker: Error sending time update:", error);
    handlePortDisconnection(port);
  }
}

function broadcastTimeUpdate() {
  const now = new Date();
  const timeData = {
    type: "TIME_UPDATE",
    timestamp: now.getTime(),
    formatted: {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      iso: now.toISOString(),
      relative: getRelativeTime(now),
    },
  };

  // Send to all connected ports
  const disconnectedPorts = [];

  connectedPorts.forEach((port) => {
    try {
      port.postMessage(timeData);
    } catch (error) {
      console.error("SharedWorker: Error broadcasting to port:", error);
      disconnectedPorts.push(port);
    }
  });

  // Clean up disconnected ports
  disconnectedPorts.forEach((port) => {
    handlePortDisconnection(port);
  });
}

/**
 * Handle port disconnection
 */
function handlePortDisconnection(port) {
  connectedPorts.delete(port);
  console.log(
    `SharedWorker: Port disconnected. Active connections: ${connectedPorts.size}`
  );

  // Stop updates if no more connections
  if (connectedPorts.size === 0) {
    stopTimeUpdates();
    console.log("SharedWorker: No active connections, stopping time updates");
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
}

console.log("SharedWorker: Date/Time worker loaded and ready");
