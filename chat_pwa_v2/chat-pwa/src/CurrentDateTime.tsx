import { useEffect, useState } from "react";
import "./CurrentDateTime.css";

export default function CurrentDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timeChannel = new BroadcastChannel("time-updates");

    timeChannel.onmessage = (event) => {
      if (event.data.formatted) {
        setCurrentTime(event.data.formatted);
      }
    };

    return () => {
      timeChannel.close();
    };
  }, []);

  return (
    <div id="current-time" className="time-display">
      <span id="current-time-text">{currentTime}</span>
    </div>
  );
}
