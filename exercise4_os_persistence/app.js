if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  // check initial if online
  document.querySelector("#status").textContent = navigator.onLine
    ? "online"
    : "offline";

  document
    .querySelector("#increaseBadgeBtn")
    .addEventListener("click", increaseBadgeCounter);
  document
    .querySelector("#clearBadgeBtn")
    .addEventListener("click", clearBadgeCounter);
  clearBadgeCounter();

  document.querySelector("#openFileBtn").addEventListener("click", openFile);
  document.querySelector("#saveFileBtn").addEventListener("click", saveFile);
  document
    .querySelector("#showFolderBtn")
    .addEventListener("click", showFolder);

  document
    .querySelector("#saveOPFSFileBtn")
    .addEventListener("click", saveOPFSFile);
  document
    .querySelector("#openOPFSFileBtn")
    .addEventListener("click", openOPFSFile);
  document
    .querySelector("#showOPFSFolderBtn")
    .addEventListener("click", showOPFSFolder);

  document.querySelector("#initDbBtn").addEventListener("click", initDB);
  document.querySelector("#writeDbBtn").addEventListener("click", writeDB);
  document.querySelector("#extendDbBtn").addEventListener("click", extendDB);
  document.querySelector("#updateDbBtn").addEventListener("click", updateDB);

  document.querySelector("#getDbByIdBtn").addEventListener("click", getDById);
  document
    .querySelector("#getDbByNameIndexBtn")
    .addEventListener("click", getDbByNameIndex);
  document
    .querySelector("#getDbByCursorBtn")
    .addEventListener("click", getDbByCursor);
  document
    .querySelector("#deleteEntryIdZeroBtn")
    .addEventListener("click", deleteEntryIdZero);

  window.addEventListener("online", handleConnection);
  window.addEventListener("offline", handleConnection);
});

function handleConnection(event) {
  document.querySelector("#status").textContent = event.type;
}

var badgeCounter = 0;
function increaseBadgeCounter() {
  if (navigator.setAppBadge) {
    navigator.setAppBadge(++badgeCounter);
  }
}
function clearBadgeCounter() {
  if (navigator.clearAppBadge) {
    navigator.clearAppBadge();
    badgeCounter = 0;
  }
}

var isBrowser = matchMedia("(display-mode: browser)").matches;
if (!isBrowser) {
  window.moveTo(16, 16);
  window.resizeTo(800, 600);
}

let handle;
async function openFile() {
  const pickerOpts = {
    types: [
      { description: "Texts", accept: { "text/plain": [".txt", ".md"] } },
    ],
  };

  const handle = (await window.showOpenFilePicker(pickerOpts))[0];
  const file = await handle.getFile();
  const content = await file.text();
  document.querySelector("#fileContentArea").value = content;
}

async function saveFile() {
  if (!handle) {
    handle = await window.showSaveFilePicker();
  }

  const writable = await handle.createWritable();
  const content = document.querySelector("#fileContentArea").value;
  await writable.write(content);
  await writable.close();
}

async function showFolder() {
  // Have the user select a file
  const dirHandle = await window.showDirectoryPicker();
  for await (const handle of dirHandle.values()) {
    console.log(handle.name);
  }
}

async function saveOPFSFile() {
  const opfsRoot = await navigator.storage.getDirectory();
  const handle = await opfsRoot.getFileHandle("myfile.txt", { create: true });
  const writable = await handle.createWritable();
  const content = document.querySelector("#fileContentArea").value;
  await writable.write(content);
  await writable.close();
}

async function openOPFSFile() {
  const opfsRoot = await navigator.storage.getDirectory();
  const handle = await opfsRoot.getFileHandle("myfile.txt");
  const file = await handle.getFile();
  const content = await file.text();
  document.querySelector("#fileContentArea").value = content;
}

async function showOPFSFolder() {
  const dirHandle = await navigator.storage.getDirectory();
  for await (const handle of dirHandle.values()) {
    console.log(handle.name);
  }
}

function initDB() {
  const request = window.indexedDB.open("MyTestDatabase", 1);
  request.onupgradeneeded = (event) => {
    console.log("Upgrade needed...");
    const db = event.target.result;
    const objectStore = db.createObjectStore("objectStore", { keyPath: "id" });
    objectStore.createIndex("nameIndex", "name", { unique: false });
  };
  request.onsuccess = (event) => {
    console.log("Initialization successful!");
  };
}

function writeDB() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = function () {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readwrite"
    );
    const store = transaction.objectStore("objectStore");
    const addRequest = store.add({ id: 0, name: "Erika Mustermann" });
    addRequest.onsuccess = function () {
      console.log("Entry successfully added!");
    };
    addRequest.onerror = function () {
      console.log("Something went wrong!");
    };
    transaction.oncomplete = function () {
      console.log("The transaction has completed!");
    };
  };
}

function extendDB() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = function () {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readwrite"
    );
    const store = transaction.objectStore("objectStore");
    const addRequest = store.add({ id: 1, name: "Max Mustermann" });
    addRequest.onsuccess = function () {
      const addRequest2 = store.add({ id: 2, name: "Erika Mustermann" });
      addRequest2.onsuccess = function () {
        console.log("Both entries have been inserted!");
      };
    };
  };
}

function updateDB() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = function () {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readwrite"
    );
    const store = transaction.objectStore("objectStore");
    const putRequest = store.put({ id: 1, name: "Mad Max Mustermann" });
    putRequest.onsuccess = function () {
      console.log("Entry successfully updated or added!");
    };
    putRequest.onerror = function () {
      console.log("Something went wrong!");
    };
  };
}

function getDById() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = function () {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readonly"
    );
    const store = transaction.objectStore("objectStore");
    const getRequest = store.get(1);
    getRequest.onsuccess = function () {
      const entry = getRequest.result;
      console.log(entry);
    };
    getRequest.onerror = function () {
      console.log("Something went wrong!");
    };
  };
}

function getDbByNameIndex() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = function () {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readonly"
    );
    const store = transaction.objectStore("objectStore");
    const index = store.index("nameIndex");
    const getRequest = index.get("Erika Mustermann");
    getRequest.onsuccess = function () {
      const entry = getRequest.result;
      console.log(`The ID of ${entry.name} is ${entry.id}`);
    };
    getRequest.onerror = function () {
      console.log("Something went wrong!");
    };
  };
}

function getDbByCursor() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = () => {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readonly"
    );
    transaction
      .objectStore("objectStore")
      .index("nameIndex")
      .openCursor(IDBKeyRange.only("Erika Mustermann")).onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        console.log(cursor.value);
        cursor.continue();
      }
    };
  };
}

function deleteEntryIdZero() {
  const openRequest = indexedDB.open("MyTestDatabase", 1);
  openRequest.onsuccess = () => {
    const transaction = openRequest.result.transaction(
      "objectStore",
      "readwrite"
    );
    transaction.objectStore("objectStore").delete(0).onsuccess = (event) => {
      console.log("Element deleted");
    };
  };
}
