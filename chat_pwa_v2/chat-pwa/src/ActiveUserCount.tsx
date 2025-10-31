import { useEffect, useState } from "react";
import "./ActiveUserCount.css";

export default function ActiveUserCount() {
  const [activeUserCount, setActiveUserCount] = useState(0);

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:5001");

    webSocket.addEventListener("message", (e) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        if (data.activeUsers !== undefined) {
          setActiveUserCount(data.activeUsers);
        }
      }
    });

    webSocket.addEventListener("close", () => console.log("WebSocket closed"));

    webSocket.addEventListener("error", (e) =>
      console.log("WebSocket error:", e)
    );

    return () => {
      webSocket.close();
    };
  }, []);

  return (
    <div id="active-user-count" className="user-count-display">
      <span id="active-user-count-text">Active Users: {activeUserCount}</span>
    </div>
  );
}
