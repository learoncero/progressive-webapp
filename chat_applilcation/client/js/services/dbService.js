const DATABASE_NAME = "ChatAppDB";
const DATABASE_VERSION = 2;
const CONVERSATION_OBJECT_STORE = "conversations";
const MESSAGES_OBJECT_STORE = "messages";
const USER_OBJECT_STORE = "users";

export function initDb() {
  if (!("indexedDB" in window)) {
    return;
  }

  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(CONVERSATION_OBJECT_STORE)) {
      db.createObjectStore(CONVERSATION_OBJECT_STORE, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(MESSAGES_OBJECT_STORE)) {
      db.createObjectStore(MESSAGES_OBJECT_STORE, {
        keyPath: "conversationId",
      });
    }
    if (!db.objectStoreNames.contains(USER_OBJECT_STORE)) {
      db.createObjectStore(USER_OBJECT_STORE, { keyPath: "username" });
    }
  };

  request.onsuccess = (event) => {
    console.log("Database initialized:", event.target.result);
  };

  request.onerror = (event) => {
    console.error("Database error:", event.target.error);
  };
}

export function saveUsers(users) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction(USER_OBJECT_STORE, "readwrite");
      const store = transaction.objectStore(USER_OBJECT_STORE);

      users.forEach((user) => {
        store.put({
          username: user.username,
          fullname: user.fullname,
          image: user.image,
        });
      });

      transaction.oncomplete = () => {
        console.log("Users saved to IndexedDB");
        resolve();
      };
      transaction.onerror = (e) => reject(e);
    };
  });
}

export function saveConversations(conversations) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    openRequest.onsuccess = function () {
      const db = openRequest.result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(CONVERSATION_OBJECT_STORE)) {
        console.error("Conversation object store does not exist");
        reject(new Error("Conversation object store does not exist"));
        return;
      }

      const transaction = db.transaction(
        CONVERSATION_OBJECT_STORE,
        "readwrite"
      );
      const store = transaction.objectStore(CONVERSATION_OBJECT_STORE);

      conversations.forEach((conv) => {
        store.put({
          id: conv.id,
          participants: conv.participants,
          messages: conv.messages,
        });
      });

      transaction.oncomplete = () => {
        console.log("Conversations saved lazily to IndexedDB");
        resolve();
      };
      transaction.onerror = (e) => {
        console.error("Transaction error:", e);
        reject(e);
      };
    };

    openRequest.onerror = (e) => {
      console.error("Database open error:", e);
      reject(e);
    };
  });
}

export function getConversationsByUsername(username) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction(CONVERSATION_OBJECT_STORE, "readonly");
      const store = transaction.objectStore(CONVERSATION_OBJECT_STORE);
      const conversations = [];

      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const conv = cursor.value;
          if (conv.participants.includes(username)) {
            conversations.push(conv);
          }
          cursor.continue();
        } else {
          resolve(conversations);
        }
      };

      request.onerror = (e) => reject(e);
    };
  });
}

export function saveMessages(conversationId, messages) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    openRequest.onsuccess = function () {
      const db = openRequest.result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(MESSAGES_OBJECT_STORE)) {
        console.error("Messages object store does not exist");
        reject(new Error("Messages object store does not exist"));
        return;
      }

      const transaction = db.transaction(MESSAGES_OBJECT_STORE, "readwrite");
      const store = transaction.objectStore(MESSAGES_OBJECT_STORE);

      store.put({
        conversationId: parseInt(conversationId),
        messages: messages,
        lastUpdated: new Date().toISOString(),
      });

      transaction.oncomplete = () => {
        console.log(
          "Messages saved to IndexedDB for conversation",
          conversationId
        );
        resolve();
      };
      transaction.onerror = (e) => {
        console.error("Transaction error:", e);
        reject(e);
      };
    };

    openRequest.onerror = (e) => {
      console.error("Database open error:", e);
      reject(e);
    };
  });
}

export function getMessagesByConversationId(conversationId) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction(MESSAGES_OBJECT_STORE, "readonly");
      const store = transaction.objectStore(MESSAGES_OBJECT_STORE);

      const request = store.get(parseInt(conversationId));

      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result && result.messages) {
          console.log(
            "Retrieved cached messages for conversation",
            conversationId
          );
          resolve(result.messages);
        } else {
          console.log(
            "No cached messages found for conversation",
            conversationId
          );
          resolve([]);
        }
      };

      request.onerror = (e) => reject(e);
    };

    openRequest.onerror = (e) => reject(e);
  });
}
