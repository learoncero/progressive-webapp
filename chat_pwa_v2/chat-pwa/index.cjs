const express = require("express");
const ws = require("ws");
const webpush = require("web-push");
const jsonParser = require("body-parser").json();
const app = express();

app.use(express.static("dist"));
app.use(express.json());
app.listen({ port: 5000 });

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
