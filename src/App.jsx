import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // MediaPipe Hands (loaded via CDN)
    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks?.length) {
        setPoints(results.multiHandLandmarks[0]);
      } else {
        setPoints([]);
      }
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
    });

    camera.start();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: "scaleX(-1)", // mirror
        }}
      />

      {/* HAND POINTS */}
      {points.map((p, index) => {
        const x = (1 - p.x) * window.innerWidth; // mirror X
        const y = p.y * window.innerHeight;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 10,
              height: 10,
              background: "#00ffff",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </div>
  );
}

export default App;
