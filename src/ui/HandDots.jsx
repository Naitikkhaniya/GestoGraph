export default function HandDots({ landmarks }) {
  if (!landmarks?.length) return null;

  return (
    <>
      {landmarks.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(1 - p.x) * 100}%`,
            top: `${p.y * 100}%`,
            width: 6,
            height: 6,
            background: "#00ffff",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
