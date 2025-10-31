const express = require("express");
const ws = require("ws");
const webpush = require("web-push");
const jsonParser = require("body-parser").json();
const app = express();

app.use(express.static("dist"));
app.use(express.json());
app.listen({ port: 5000 });

const KEYS = {
  publicKey:
    "BMJXsOtT2dYG64ggKwp4FQ3ZZaslj0PjXNEi0mG6TwrkZpRb6jeb_bnzxbGWhzxlq5zg1ZGwpCi0vEhOpRHPrZQ",
  privateKey: "JJcqWDo5_d94jwjDNNdL1IiI5nQGhE4dnYtb-xM9l6s",
};

const users = [
  {
    username: "daniel",
    fullname: "Daniel Craig",
    image: "/images/users/daniel.jpg",
  },
  {
    username: "manuel",
    fullname: "Manuel Neuer",
    image: "/images/users/manuel.jpg",
  },
  {
    username: "guenther",
    fullname: "Günther Jauch",
    image: "/images/users/guenther.jpg",
  },
  {
    username: "franz",
    fullname: "Franz Kafka",
    image: "/images/users/franz.jpg",
  },
];

const conversations = [
  {
    id: 1,
    participants: ["daniel", "guenther"],
    messages: [
      { from: "daniel", message: "Hello Günther!" },
      { from: "guenther", message: "Hello Daniel!" },
    ],
  },
  {
    id: 2,
    participants: ["daniel", "manuel"],
    messages: [
      { from: "daniel", message: "Hello Manuel!" },
      { from: "manuel", message: "Hello Daniel!" },
    ],
  },
  {
    id: 3,
    participants: ["guenther", "manuel"],
    messages: [
      { from: "guenther", message: "Hello Manuel!" },
      { from: "manuel", message: "Hello Günther!" },
    ],
  },
  {
    id: 4,
    participants: ["daniel", "franz"],
    messages: [
      { from: "daniel", message: "Hello Franz!" },
      { from: "franz", message: "Hello Daniel!" },
    ],
  },
];

var newMessages = 0;

app.get("/users", (request, reply) => {
  reply.send(users);
});

app.get("/conversations", (request, reply) => {
  const { user } = request.query;

  reply.send(
    conversations
      .filter(({ participants }) => !user || participants.includes(user))
      .map(({ id, participants }) => ({ id, participants }))
  );
});

app.get("/conversations/:id/messages", (request, reply) => {
  const conversation = findConversation(request.params.id);

  if (!conversation) {
    reply.status(404).send();
    return;
  }

  reply.send(conversation.messages);
});

app.post("/conversations/:id/messages", (request, reply) => {
  const body = request.body;
  const conversation = findConversation(request.params.id);

  if (!conversation) {
    reply.status(404).send();
    return;
  }
  const { from, message } = request.body;

  if (!from || !message) {
    reply.status(404).send();
    return;
  }

  const newMessage = { from, message };

  conversation.messages.push(newMessage);
  newMessages++;
  console.log("New message added. Total new messages:", newMessages);
  reply.send(newMessage);
});

function findConversation(id) {
  return conversations.find((conversation) => conversation.id == id);
}

const sseClients = new Set();
function broadcastNewMessageCounter(counter) {
  for (const client of sseClients) {
    try {
      if (!client.destroyed) {
        client.write(`event:newMessageCount\ndata: ${counter}\n\n`);
      } else {
        sseClients.delete(client);
      }
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

app.get("/messageEvent", (req, res) => {
  // Send the SSE header.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  sseClients.add(res);
  broadcastNewMessageCounter(sseClients.size);
});

// WebSocket Server
const wsServer = new ws.Server({ port: 5001 });
wsServer.on("connection", (socket) => {
  socket.on("message", (message) => console.log(message));

  broadcastClientCountToWebSocketClients(wsServer.clients.size);

  socket.on("close", (socket) => {
    broadcastClientCountToWebSocketClients(wsServer.clients.size);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function broadcastClientCountToWebSocketClients(clientCount) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({ activeUsers: clientCount }));
    }
  });
}

// Web Push Notifications
const subscriptions = new Map();

app.post("/subscribe", jsonParser, (req, res) => {
  const subscription = req.body;
  subscriptions.set(subscription.endpoint, subscription);
  console.log(
    `New subscription added. Total subscriptions: ${subscriptions.size}`
  );
  res.status(200).send({ message: "Subscribed successfully" });
});

app.post("/new-version", jsonParser, (req, res) => {
  const versionMessage =
    "A new version of the app is available! Refresh to update.";
  pushToAll(versionMessage, res);
});

function pushToAll(message, res) {
  webpush.setVapidDetails(
    "mailto:dontbugmenow@gmail.com",
    KEYS.publicKey,
    KEYS.privateKey
  );

  if (subscriptions.size === 0) {
    console.log("No subscriptions available");
    return res.status(200).send({ message: "No subscribers" });
  }

  const promises = [];

  subscriptions.forEach((subscription, endpoint) => {
    const promise = webpush
      .sendNotification(subscription, JSON.stringify(message))
      .then(() => {
        console.log(`Message sent to: ${endpoint.substring(0, 50)}...`);
      })
      .catch((err) => {
        console.error(
          `Error sending to ${endpoint.substring(0, 50)}...:`,
          err.statusCode
        );
        // Remove invalid subscriptions (expired or unsubscribed)
        if (err.statusCode === 404 || err.statusCode === 410) {
          subscriptions.delete(endpoint);
          console.log(
            `Removed invalid subscription. Remaining: ${subscriptions.size}`
          );
        }
      });

    promises.push(promise);
  });

  Promise.all(promises)
    .then(() => {
      console.log(
        `Message '${message}' pushed to ${subscriptions.size} subscribers`
      );
      res
        .status(200)
        .send({ message: `Sent to ${subscriptions.size} subscribers` });
    })
    .catch((err) => {
      console.error("Error in pushToAll:", err);
      res.status(500).send({ error: "Failed to send notifications" });
    });
}
