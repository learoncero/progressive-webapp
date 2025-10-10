export function initDb() {
  if (!("indexedDB" in window)) {
    console.log("This browser doesn't support IndexedDB");
    return;
  }

  const request = indexedDB.open("ChatAppDB", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("conversations", { keyPath: "id" });
    db.createObjectStore("messages", { keyPath: "id" });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    console.log("Database initialized:", db);
  };

  request.onerror = (event) => {
    console.error("Database error:", event.target.error);
  };
}
