import ActiveUserCount from "./ActiveUserCount";
import CurrentDateTime from "./CurrentDateTime";
import "./Header.css";

export default function Header() {
  return (
    <header>
      <h1>Chat-PWA Version 2</h1>
      <ActiveUserCount />
      <CurrentDateTime />
    </header>
  );
}
