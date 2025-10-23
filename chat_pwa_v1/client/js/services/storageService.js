const LAST_CHAT_ID_KEY = "lastChatId";

// Check if localStorage is available
function isStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("localStorage is not available:", e);
    return false;
  }
}

export function getLastChatId() {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(LAST_CHAT_ID_KEY);
  } catch (error) {
    console.error("Error getting last chat ID:", error);
    return null;
  }
}

export function setLastChatId(chatId) {
  if (!isStorageAvailable()) {
    console.warn("Storage not available, cannot save last chat ID");
    return false;
  }

  try {
    localStorage.setItem(LAST_CHAT_ID_KEY, chatId);
    return true;
  } catch (error) {
    console.error("Error setting last chat ID:", error);
    return false;
  }
}

export function clearLastChatId() {
  if (!isStorageAvailable()) {
    console.warn("Storage not available, cannot clear last chat ID");
    return false;
  }

  try {
    localStorage.removeItem(LAST_CHAT_ID_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing last chat ID:", error);
    return false;
  }
}
