onerror = (errorEvent) => {
  console.debug(`Error in worker: ${errorEvent.message}`);
};
let counter = 0;
setInterval(() => {
  counter++;
  if (counter % 1000 === 0) {
    postMessage({ currentValue: counter });
  }
}, 0);

onmessage = (message) => {
  if (message.data.command === "reset") {
    counter = 0;
  }
};
