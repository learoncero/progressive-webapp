/**
 * Time Service - Interface for Shared Worker
 * Manages connection to the shared worker for real-time date/time updates
 */

class TimeService {
  constructor() {
    this.worker = null;
    this.port = null;
    this.isConnected = false;
    this.callbacks = new Set();
    this.lastTimeData = null;
  }

  /**
   * Initialize connection to shared worker
   */
  async init() {
    if (this.isConnected) {
      console.log("TimeService: Already connected to shared worker");
      return true;
    }

    try {
      // Check if SharedWorker is supported
      if (typeof SharedWorker === "undefined") {
        console.warn("TimeService: SharedWorker not supported in this browser");
        return false;
      }

      // Create shared worker connection
      this.worker = new SharedWorker("/js/workers/sharedWorker.js");
      this.port = this.worker.port;

      // Set up message handler
      this.port.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      // Handle connection errors
      this.worker.onerror = (error) => {
        console.error("TimeService: SharedWorker error:", error);
        this.isConnected = false;
      };

      // Start the connection
      this.port.start();
      this.isConnected = true;

      console.log("TimeService: Connected to shared worker");
      return true;
    } catch (error) {
      console.error("TimeService: Failed to initialize shared worker:", error);
      return false;
    }
  }

  /**
   * Handle messages from shared worker
   */
  handleMessage(data) {
    const { type, ...payload } = data;

    switch (type) {
      case "TIME_UPDATE":
        this.lastTimeData = payload;
        this.notifyCallbacks(payload);
        break;

      case "ERROR":
        console.error("TimeService: Worker error:", payload.message);
        break;

      default:
        console.warn("TimeService: Unknown message type:", type);
    }
  }

  /**
   * Notify all registered callbacks
   */
  notifyCallbacks(timeData) {
    this.callbacks.forEach((callback) => {
      try {
        callback(timeData);
      } catch (error) {
        console.error("TimeService: Error in callback:", error);
      }
    });
  }

  /**
   * Subscribe to time updates
   */
  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("TimeService: Callback must be a function");
    }

    this.callbacks.add(callback);

    // Send last known time data immediately if available
    if (this.lastTimeData) {
      try {
        callback(this.lastTimeData);
      } catch (error) {
        console.error("TimeService: Error in immediate callback:", error);
      }
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Unsubscribe from time updates
   */
  unsubscribe(callback) {
    this.callbacks.delete(callback);
  }

  /**
   * Request immediate time update
   */
  requestTimeUpdate() {
    if (!this.isConnected) {
      console.warn("TimeService: Not connected to shared worker");
      return;
    }

    this.port.postMessage({ type: "GET_TIME" });
  }

  /**
   * Set update interval (in milliseconds)
   */
  setUpdateInterval(interval = 1000) {
    if (!this.isConnected) {
      console.warn("TimeService: Not connected to shared worker");
      return;
    }

    this.port.postMessage({
      type: "SET_INTERVAL",
      data: { interval },
    });
  }

  /**
   * Start time updates
   */
  startUpdates(interval = 1000) {
    if (!this.isConnected) {
      console.warn("TimeService: Not connected to shared worker");
      return;
    }

    this.port.postMessage({
      type: "START_UPDATES",
      data: { interval },
    });
  }

  /**
   * Stop time updates
   */
  stopUpdates() {
    if (!this.isConnected) {
      console.warn("TimeService: Not connected to shared worker");
      return;
    }

    this.port.postMessage({ type: "STOP_UPDATES" });
  }

  /**
   * Get last known time data
   */
  getLastTime() {
    return this.lastTimeData;
  }

  /**
   * Disconnect from shared worker
   */
  disconnect() {
    if (this.port) {
      this.port.close();
    }

    this.worker = null;
    this.port = null;
    this.isConnected = false;
    this.callbacks.clear();
    this.lastTimeData = null;

    console.log("TimeService: Disconnected from shared worker");
  }
}

// Create singleton instance
const timeService = new TimeService();

// Export the service and utility functions
export default timeService;

export { timeService };

/**
 * Utility function to format time for display
 */
export function formatTime(timestamp, options = {}) {
  const date = new Date(timestamp);
  const {
    showDate = true,
    showTime = true,
    showSeconds = true,
    use24Hour = false,
  } = options;

  let formatted = "";

  if (showDate) {
    formatted += date.toLocaleDateString();
    if (showTime) formatted += " ";
  }

  if (showTime) {
    const timeOptions = {
      hour12: !use24Hour,
      hour: "2-digit",
      minute: "2-digit",
    };

    if (showSeconds) {
      timeOptions.second = "2-digit";
    }

    formatted += date.toLocaleTimeString(undefined, timeOptions);
  }

  return formatted;
}
