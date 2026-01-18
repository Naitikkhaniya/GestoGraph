let lastGesture = "UNKNOWN";
let stableGesture = "UNKNOWN";
let gestureStartTime = 0;

const STABILITY_TIME = 250; // ms

export function updateGestureState(rawGesture) {
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
