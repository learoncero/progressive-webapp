import { useEffect, useRef, useState } from "react";
import MessageService from "./services/MessageService";
import "./PhotoOverlay.css";

type PhotoOverlayProps = {
  conversationId: number;
  currentUser: string;
  onClose: () => void;
  onPhotoSent: () => void;
};

export default function PhotoOverlay({
  conversationId,
  currentUser,
  onClose,
  onPhotoSent,
}: PhotoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const width = 320;

  useEffect(() => {
    startMediaCapture();

    return () => {
      stopMediaCapture();
    };
  }, []);

  async function startMediaCapture() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error(`An error occurred: ${err}`);
      setError("Unable to access camera. Please check permissions.");
    }
  }

  function stopMediaCapture() {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
      setIsStreaming(false);
    }
  }

  function toggleCamera() {
    if (isStreaming) {
      stopMediaCapture();
    } else {
      startMediaCapture();
    }
  }

  function handleCanPlay() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const height = (video.videoHeight / video.videoWidth) * width;

      video.setAttribute("width", width.toString());
      video.setAttribute("height", height.toString());
      canvas.setAttribute("width", width.toString());
      canvas.setAttribute("height", height.toString());
    }
  }

  function takePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        const height = (video.videoHeight / video.videoWidth) * width;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        const photoDataUrl = canvas.toDataURL("image/png");
        setCapturedPhoto(photoDataUrl);
      }
    }
  }

  async function sendPhoto() {
    setIsSending(true);
    try {
      // Send a simple message indicating a photo was sent
      await MessageService.sendMessage(
        conversationId.toString(),
        currentUser,
        "📷 Photo sent successfully"
      );

      setCapturedPhoto(null);
      stopMediaCapture();
      onPhotoSent();
      onClose();
    } catch (error) {
      console.error("Failed to send photo:", error);
      setError("Failed to send photo. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleClose() {
    stopMediaCapture();
    onClose();
  }

  return (
    <div className="photo-overlay">
      <div className="photo-overlay-content">
        <div className="photo-overlay-header">
          <h2>Take a Photo</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="photo-capture-area">
          <video
            ref={videoRef}
            onCanPlay={handleCanPlay}
            className="video-preview"
          >
            Video stream not available.
          </video>

          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Captured photo"
              className="captured-photo-preview"
            />
          )}

          <div className="photo-controls">
            <button
              onClick={toggleCamera}
              disabled={!!error}
              className="control-button"
            >
              {isStreaming ? "Stop Camera" : "Start Camera"}
            </button>
            <button
              onClick={takePhoto}
              disabled={!isStreaming}
              className="control-button primary"
            >
              Take Photo
            </button>
            {capturedPhoto && (
              <button
                onClick={sendPhoto}
                disabled={isSending}
                className="control-button send"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
