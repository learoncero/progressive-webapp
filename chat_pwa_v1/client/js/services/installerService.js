let deferredPrompt;

export function initInstaller() {
  const installBtn = document.querySelector("#install-button");
  if (!installBtn) {
    return;
  }

  installBtn.addEventListener("click", installApp);

  window.addEventListener("beforeinstallprompt", (e) => {
    // prevent the default mini-infobar or install dialog
    // from appearing on mobile
    e.preventDefault();
    // save the event because you'll need to trigger it later.
    deferredPrompt = e;
    // show button
    installBtn.removeAttribute("hidden");
  });
}

async function installApp() {
  if (deferredPrompt) {
    // launch installer
    deferredPrompt.prompt();
    deferredPrompt = null;
    // hide the install button
    const installBtn = document.querySelector("#install-button");
    installBtn.setAttribute("hidden", "");
    // document.querySelector("#install-button").setAttribute("hidden", "");
  }
}
