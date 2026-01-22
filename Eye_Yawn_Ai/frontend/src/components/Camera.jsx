import React, { useRef, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoRef.current.srcObject = stream;
    });

    const interval = setInterval(async () => {
      if (!videoRef.current.videoWidth) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const img = canvas.toDataURL("image/jpeg");

      try {
        const res = await fetch("http://localhost:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: img })
        });

        const data = await res.json();

        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;

        data.faces.forEach(([x, y, w, h]) => {
          ctx.strokeRect(x, y, w, h);
        });

        window.dispatchEvent(
          new CustomEvent("prediction", { detail: data })
        );
      } catch (err) {
        console.error("Prediction error:", err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="col-span-2 glass p-4 relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-xl video-glow"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
