import { useEffect, useRef, useState } from "react";
import { startCamera } from "./camera/useCamera";
import { createHandTracker } from "./hand/handTracker";
import { detectGesture } from "./gestures/detectGesture";
import { updateGestureState } from "./gestures/gestureState";
import { createParticleSystem } from "./particles/ParticleSystem";
import CameraBox from "./ui/CameraBox";
import HandDots from "./ui/HandDots";

function App() {
  const videoRef = useRef(null);
  const particleContainerRef = useRef(null);
  const gestureRef = useRef("UNKNOWN");

  const [landmarks, setLandmarks] = useState([]);

  useEffect(() => {
    /* ---------- CAMERA ---------- */
    startCamera(videoRef.current);

    /* ---------- PARTICLES ---------- */
    const particleSystem = createParticleSystem(
      particleContainerRef.current
    );

    /* ---------- HAND TRACKING ---------- */
    createHandTracker(videoRef.current, (results) => {
      if (!results.multiHandLandmarks?.length) {
        setLandmarks([]);
        gestureRef.current = "UNKNOWN";
        return;
      }

      const lm = results.multiHandLandmarks[0];
      setLandmarks(lm);

      const rawGesture = detectGesture(lm);
      const stableGesture = updateGestureState(rawGesture);
      gestureRef.current = stableGesture;
    });

    /* ---------- ANIMATION LOOP ---------- */
    const animate = () => {
      particleSystem.update((positions, velocities) => {
        const g = gestureRef.current;

        for (let i = 0; i < positions.length; i += 3) {
          let fx = 0,
            fy = 0,
            fz = 0;

          if (g === "OPEN_HAND") {
            fx = positions[i] * 0.0005;
            fy = positions[i + 1] * 0.0005;
          }

          if (g === "FIST") {
            fx = (Math.random() - 0.5) * 0.02;
            fy = (Math.random() - 0.5) * 0.02;
            fz = (Math.random() - 0.5) * 0.02;
          }

          if (g === "PINCH") {
            fx = -positions[i] * 0.001;
            fy = -positions[i + 1] * 0.001;
          }

          velocities[i] += fx;
          velocities[i + 1] += fy;
          velocities[i + 2] += fz;

          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];

          velocities[i] *= 0.95;
          velocities[i + 1] *= 0.95;
          velocities[i + 2] *= 0.95;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      particleSystem.destroy();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* PARTICLE SPACE */}
      <div
        ref={particleContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      {/* CAMERA + HAND UI */}
      <CameraBox videoRef={videoRef}>
        <HandDots landmarks={landmarks} />
      </CameraBox>
    </div>
  );
}

export default App;
