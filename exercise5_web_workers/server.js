const express = require("express");
const webpush = require("web-push");
const jsonParser = require("body-parser").json();
const app = express();
app.use(express.static("client"));
app.listen(8080);
const KEYS = {
  publicKey:
    "BH3-DzvVmRy3QnrDjr6S8C6QEssTy3dNk_O6SjV-yuKewZV6_SaAoTxBz3ZNfxrh50nariLtXUOApuL3Q3-Son0",
  privateKey: "SUrGSGHmbirXkGtoCTGRqG2piqVu0ttt8MdjnfvUC5M",
};

let subscription;
app.post("/subscribe", jsonParser, (req, res) => {
  console.log(`got subscription ${JSON.stringify(req.body)}`);
  subscription = req.body;
  res.status(200).send({ message: "Subscribed successfully" });
});

app.post("/message", jsonParser, (req, res) => {
  push(subscription, req.body.payload, res);
});
app.get("/message", (req, res) => {
  push(subscription, req.query.text, res);
});

function push(subscription, message, res) {
  webpush.setVapidDetails(
    "mailto:dontbugmenow@gmail.com",
    KEYS.publicKey,
    KEYS.privateKey
  );
  return webpush
    .sendNotification(subscription, JSON.stringify(message))
    .then(() => {
      console.log(`Message '${message}' pushed`);
      res.status(200).send();
    })
    .catch((err) => {
      res.status(500).send();
    });
}
