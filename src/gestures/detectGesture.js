import { distance } from "../utils/math";

export function detectGesture(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  const pinchDist = distance(thumbTip, indexTip);

  const fingersToWrist = [
    distance(indexTip, wrist),
    distance(middleTip, wrist),
    distance(ringTip, wrist),
    distance(pinkyTip, wrist),
  ];

  const avgFingerDist =
    fingersToWrist.reduce((a, b) => a + b, 0) / fingersToWrist.length;

  const foldedFingers = [
    distance(indexTip, indexMCP),
    distance(middleTip, middleMCP),
    distance(ringTip, ringMCP),
    distance(pinkyTip, pinkyMCP),
  ];

  const foldedCount = foldedFingers.filter((d) => d < 0.1).length;

  if (pinchDist < 0.045) return "PINCH";
  if (foldedCount >= 2) return "FIST";
  if (avgFingerDist > 0.22) return "OPEN_HAND";

  return "UNKNOWN";
}
