import "./BackButton.css";

type BackButtonProps = {
  onClick: () => void;
};

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <div className="back-button-container">
      <button onClick={onClick} className="back-button">
        Back to Conversations
      </button>
    </div>
  );
}
