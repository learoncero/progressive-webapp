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
  const installBtn = document.querySelector("#install-button");
  console.log("beforeinstallprompt fired");
  console.log("installBtn", installBtn);
  installBtn.removeAttribute("hidden");
});

async function installApp() {
  if (deferredPrompt) {
    // launch installer
    deferredPrompt.prompt();
    deferredPrompt = null;
    // hide the install button
    const installBtn = document.querySelector("#install-button");
    installBtn.setAttribute("hidden", "");
    console.log("Install button clicked");
    console.log("installBtn", installBtn);
    // document.querySelector("#install-button").setAttribute("hidden", "");
  }
}
