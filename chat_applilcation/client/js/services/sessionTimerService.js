/**
 * Session Timer Service - Interface for Dedicated Worker
 * Manages session time tracking using a dedicated worker
 */

class SessionTimerService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.callbacks = new Set();
    this.sessionData = {
      startTime: null,
      duration: 0,
      formattedDuration: "00:00:00",
      isRunning: false,
    };
  }

  /**
   * Initialize the dedicated worker
   */
  async init() {
    if (this.isInitialized) {
      console.log("SessionTimerService: Already initialized");
      return true;
    }

    try {
      // Check if Worker is supported
      if (typeof Worker === "undefined") {
        console.warn(
          "SessionTimerService: Web Workers not supported in this browser"
        );
        return false;
      }

      // Create dedicated worker
      this.worker = new Worker("/js/workers/dedicatedWorker.js");

      // Set up message handler
      this.worker.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      // Handle worker errors
      this.worker.onerror = (error) => {
        console.error("SessionTimerService: Worker error:", error);
      };

      this.isInitialized = true;
      console.log("SessionTimerService: Dedicated worker initialized");
      return true;
    } catch (error) {
      console.error("SessionTimerService: Failed to initialize worker:", error);
      return false;
    }
  }

  /**
   * Handle messages from the dedicated worker
   */
  handleMessage(data) {
    const { type, ...payload } = data;

    switch (type) {
      case "WORKER_READY":
        console.log("SessionTimerService: Worker is ready");
        break;

      case "SESSION_STARTED":
        this.sessionData.startTime = payload.data.startTime;
        this.sessionData.isRunning = true;
        console.log(
          "SessionTimerService: Session started at",
          this.sessionData.startTime
        );
        this.notifyCallbacks(this.sessionData);
        break;

      case "SESSION_STOPPED":
        this.sessionData.isRunning = false;
        console.log("SessionTimerService: Session stopped");
        this.notifyCallbacks(this.sessionData);
        break;

      case "SESSION_RESET":
        this.sessionData = {
          startTime: null,
          duration: 0,
          formattedDuration: "00:00:00",
          isRunning: false,
        };
        console.log("SessionTimerService: Session reset");
        this.notifyCallbacks(this.sessionData);
        break;

      case "SESSION_TIME_UPDATE":
        this.sessionData = {
          ...this.sessionData,
          ...payload.data,
        };
        this.notifyCallbacks(this.sessionData);
        break;

      case "INTERVAL_SET":
        console.log(
          "SessionTimerService: Update interval set to",
          payload.data.interval,
          "ms"
        );
        break;

      case "ERROR":
        console.error("SessionTimerService: Worker error:", payload.message);
        break;

      case "WORKER_ERROR":
        console.error("SessionTimerService: Worker runtime error:", payload);
        break;

      default:
        console.warn("SessionTimerService: Unknown message type:", type);
    }
  }

  /**
   * Notify all registered callbacks
   */
  notifyCallbacks(sessionData) {
    this.callbacks.forEach((callback) => {
      try {
        callback(sessionData);
      } catch (error) {
        console.error("SessionTimerService: Error in callback:", error);
      }
    });
  }

  /**
   * Subscribe to session time updates
   */
  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("SessionTimerService: Callback must be a function");
    }

    this.callbacks.add(callback);

    // Send current session data immediately
    callback(this.sessionData);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Unsubscribe from session time updates
   */
  unsubscribe(callback) {
    this.callbacks.delete(callback);
  }

  /**
   * Start the session timer
   */
  startSession(startTime = null) {
    if (!this.isInitialized) {
      console.warn("SessionTimerService: Service not initialized");
      return;
    }

    this.worker.postMessage({
      type: "START_SESSION",
      data: { startTime: startTime || new Date().toISOString() },
    });
  }

  /**
   * Stop the session timer
   */
  stopSession() {
    if (!this.isInitialized) {
      console.warn("SessionTimerService: Service not initialized");
      return;
    }

    this.worker.postMessage({
      type: "STOP_SESSION",
    });
  }

  /**
   * Reset the session timer
   */
  resetSession() {
    if (!this.isInitialized) {
      console.warn("SessionTimerService: Service not initialized");
      return;
    }

    this.worker.postMessage({
      type: "RESET_SESSION",
    });
  }

  /**
   * Get current session time
   */
  getSessionTime() {
    if (!this.isInitialized) {
      console.warn("SessionTimerService: Service not initialized");
      return;
    }

    this.worker.postMessage({
      type: "GET_SESSION_TIME",
    });
  }

  /**
   * Set update interval
   */
  setUpdateInterval(interval = 1000) {
    if (!this.isInitialized) {
      console.warn("SessionTimerService: Service not initialized");
      return;
    }

    this.worker.postMessage({
      type: "SET_INTERVAL",
      data: { interval },
    });
  }

  /**
   * Get current session data
   */
  getCurrentSessionData() {
    return { ...this.sessionData };
  }

  /**
   * Check if session is running
   */
  isSessionRunning() {
    return this.sessionData.isRunning;
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration() {
    return this.sessionData.duration;
  }

  /**
   * Get formatted session duration
   */
  getFormattedDuration() {
    return this.sessionData.formattedDuration;
  }

  /**
   * Terminate the worker and cleanup
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isInitialized = false;
    this.callbacks.clear();
    this.sessionData = {
      startTime: null,
      duration: 0,
      formattedDuration: "00:00:00",
      isRunning: false,
    };

    console.log("SessionTimerService: Service destroyed");
  }
}

// Create singleton instance
const sessionTimerService = new SessionTimerService();

// Export the service
export default sessionTimerService;

export { sessionTimerService };

/**
 * Utility function to format duration from milliseconds
 */
export function formatSessionDuration(durationMs, format = "HH:MM:SS") {
  if (durationMs < 0) return "00:00:00";

  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  switch (format) {
    case "HH:MM:SS":
      return [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");

    case "human":
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }

    case "verbose":
      const parts = [];
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
      if (minutes > 0)
        parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
      if (seconds > 0 || parts.length === 0)
        parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
      return parts.join(", ");

    default:
      return formatSessionDuration(durationMs, "HH:MM:SS");
  }
}
