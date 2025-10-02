if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#test1").addEventListener("click", async () => {
    request("/test1.txt");
  });

  document.querySelector("#test2").addEventListener("click", async () => {
    request("/test2.txt");
  });

  document.querySelector("#test3").addEventListener("click", async () => {
    request("/test3.txt");
  });

  document.querySelector("#test4").addEventListener("click", async () => {
    request("/test4.txt");
  });

  document.querySelector("#test5").addEventListener("click", async () => {
    request("/test5.txt");
  });

  document.querySelector("#test6").addEventListener("click", async () => {
    request("/test6.txt");
  });
});

function request(site) {
  fetch(site)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      showResult(data);
    })
    .catch((error) => {
      showResult(`Error ${error}`);
    });
}

function showResult(text) {
  document
    .querySelector("#result")
    .appendChild(document.createElement("div")).textContent = text;
}
