import { useEffect, useRef, useState } from "react";

let lastGesture = "UNKNOWN";
let stableGesture = "UNKNOWN";
let gestureStartTime = 0;

const STABILITY_TIME = 250; // milliseconds

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function detectGesture(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const pinchDist = distance(thumbTip, indexTip);

  const fingersToWrist = [
    distance(indexTip, wrist),
    distance(middleTip, wrist),
    distance(ringTip, wrist),
    distance(pinkyTip, wrist),
  ];

  const avgFingerDist =
    fingersToWrist.reduce((a, b) => a + b, 0) / fingersToWrist.length;

  // Thresholds (empirical, will tune later)
  if (pinchDist < 0.04) {
    return "PINCH";
  }

  const foldedFingers = [
    distance(indexTip, landmarks[5]),   // index MCP
    distance(middleTip, landmarks[9]),  // middle MCP
    distance(ringTip, landmarks[13]),   // ring MCP
    distance(pinkyTip, landmarks[17]),  // pinky MCP
  ];

  const foldedCount = foldedFingers.filter(d => d < 0.06).length;

  if (foldedCount >= 3) {
    return "FIST";
  }

  if (avgFingerDist > 0.22) {
    return "OPEN_HAND";
  }

  return "UNKNOWN";
}

function updateGestureState(rawGesture) {
  const now = Date.now();

  if (rawGesture !== lastGesture) {
    lastGesture = rawGesture;
    gestureStartTime = now;
    return stableGesture;
  }

  if (
    rawGesture !== stableGesture &&
    now - gestureStartTime > STABILITY_TIME
  ) {
    stableGesture = rawGesture;
  }

  return stableGesture;
}


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
        const landmarks = results.multiHandLandmarks[0];
        setPoints(landmarks);

        const rawGesture = detectGesture(landmarks);
        const stable = updateGestureState(rawGesture);

        console.log("Gesture:", stable);

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
