/**
 * Dedicated Worker for Session Timer
 * Tracks and broadcasts the time since the client was started
 */

let sessionStartTime = null;
let timerInterval = null;
let isRunning = false;

// Handle messages from main thread
self.onmessage = function (event) {
  const { type, data } = event.data;

  console.log("DedicatedWorker: Received message:", type);

  switch (type) {
    case "START_SESSION":
      startSession(data?.startTime);
      break;

    case "STOP_SESSION":
      stopSession();
      break;

    case "GET_SESSION_TIME":
      sendSessionTime();
      break;

    case "SET_INTERVAL":
      const interval = data?.interval || 1000;
      setUpdateInterval(interval);
      break;

    case "RESET_SESSION":
      resetSession();
      break;

    default:
      self.postMessage({
        type: "ERROR",
        message: `Unknown message type: ${type}`,
      });
  }
};

/**
 * Start the session timer
 */
function startSession(providedStartTime) {
  if (isRunning) {
    console.log("DedicatedWorker: Session already running");
    return;
  }

  // Use provided start time or current time
  sessionStartTime = providedStartTime
    ? new Date(providedStartTime)
    : new Date();
  isRunning = true;

  console.log(
    "DedicatedWorker: Session started at",
    sessionStartTime.toISOString()
  );

  // Send initial session time
  sendSessionTime();

  // Start periodic updates
  startPeriodicUpdates();

  self.postMessage({
    type: "SESSION_STARTED",
    data: {
      startTime: sessionStartTime.toISOString(),
      timestamp: sessionStartTime.getTime(),
    },
  });
}

/**
 * Stop the session timer
 */
function stopSession() {
  if (!isRunning) {
    console.log("DedicatedWorker: Session not running");
    return;
  }

  isRunning = false;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const sessionDuration = sessionStartTime
    ? Date.now() - sessionStartTime.getTime()
    : 0;

  console.log(
    "DedicatedWorker: Session stopped, duration:",
    sessionDuration,
    "ms"
  );

  self.postMessage({
    type: "SESSION_STOPPED",
    data: {
      sessionDuration: sessionDuration,
      formattedDuration: formatDuration(sessionDuration),
    },
  });
}

/**
 * Reset the session timer
 */
function resetSession() {
  stopSession();
  sessionStartTime = null;

  self.postMessage({
    type: "SESSION_RESET",
  });

  console.log("DedicatedWorker: Session reset");
}

/**
 * Start periodic updates
 */
function startPeriodicUpdates(interval = 1000) {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (isRunning && sessionStartTime) {
      sendSessionTime();
    }
  }, interval);
}

/**
 * Set update interval
 */
function setUpdateInterval(interval) {
  if (isRunning) {
    startPeriodicUpdates(interval);
  }

  self.postMessage({
    type: "INTERVAL_SET",
    data: { interval },
  });
}

/**
 * Send current session time to main thread
 */
function sendSessionTime() {
  if (!sessionStartTime) {
    self.postMessage({
      type: "SESSION_TIME_UPDATE",
      data: {
        sessionDuration: 0,
        formattedDuration: "00:00:00",
        isRunning: false,
      },
    });
    return;
  }

  const now = new Date();
  const sessionDuration = now.getTime() - sessionStartTime.getTime();
  const formattedDuration = formatDuration(sessionDuration);

  self.postMessage({
    type: "SESSION_TIME_UPDATE",
    data: {
      sessionDuration: sessionDuration,
      formattedDuration: formattedDuration,
      isRunning: isRunning,
      startTime: sessionStartTime.toISOString(),
      currentTime: now.toISOString(),
    },
  });
}

/**
 * Format duration in milliseconds to HH:MM:SS format
 */
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

/**
 * Format duration in a human-readable way
 */
function formatHumanDuration(durationMs) {
  if (durationMs < 0) return "No time";

  const totalSeconds = Math.floor(durationMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    return `${totalDays} day${totalDays !== 1 ? "s" : ""}, ${
      totalHours % 24
    } hour${totalHours % 24 !== 1 ? "s" : ""}`;
  } else if (totalHours > 0) {
    return `${totalHours} hour${totalHours !== 1 ? "s" : ""}, ${
      totalMinutes % 60
    } minute${totalMinutes % 60 !== 1 ? "s" : ""}`;
  } else if (totalMinutes > 0) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? "s" : ""}, ${
      totalSeconds % 60
    } second${totalSeconds % 60 !== 1 ? "s" : ""}`;
  } else {
    return `${totalSeconds} second${totalSeconds !== 1 ? "s" : ""}`;
  }
}

// Handle worker errors
self.onerror = function (error) {
  console.error("DedicatedWorker: Error occurred:", error);
  self.postMessage({
    type: "WORKER_ERROR",
    message: error.message,
    filename: error.filename,
    lineno: error.lineno,
  });
};

// Log that worker is ready
console.log("DedicatedWorker: Session timer worker loaded and ready");

// Notify main thread that worker is ready
self.postMessage({
  type: "WORKER_READY",
});
