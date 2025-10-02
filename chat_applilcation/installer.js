document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#install-button")
    .addEventListener("click", installApp);
});

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  // prevent the default mini-infobar or install dialog
  // from appearing on mobile
  e.preventDefault();
  // save the event because you'll need to trigger it later.
  deferredPrompt = e;
  // show button
  document.querySelector("#install-button").removeAttribute("hidden");
});

async function installApp() {
  if (deferredPrompt) {
    // launch installer
    deferredPrompt.prompt();
    deferredPrompt = null;
    // hide the install button
    document.querySelector("#install-button").setAttribute("hidden", "");
  }
}
