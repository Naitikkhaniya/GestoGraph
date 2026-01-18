export default function CameraBox({ videoRef, children }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 260,
        height: 180,
        border: "1px solid rgba(0,255,255,0.4)",
        borderRadius: 8,
        overflow: "hidden",
        background: "black",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: "scaleX(-1)",
        }}
      />
      {children}
    </div>
  );
}
