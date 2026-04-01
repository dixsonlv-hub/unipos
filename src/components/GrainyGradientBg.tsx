import React from "react";

const GrainyGradientBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen overflow-hidden">
    {/* Animated gradient blobs */}
    <div
      className="absolute inset-0 animate-blob-drift"
      style={{
        background: [
          "radial-gradient(ellipse 80% 60% at 10% 20%, #b0bec5 0%, transparent 60%)",
          "radial-gradient(ellipse 70% 80% at 90% 80%, #90a4ae 0%, transparent 55%)",
          "radial-gradient(ellipse 60% 50% at 50% 50%, #cfd8dc 0%, transparent 50%)",
          "radial-gradient(ellipse 50% 70% at 80% 20%, #78909c 0%, transparent 60%)",
          "radial-gradient(ellipse 90% 40% at 30% 90%, #b0bec5 0%, transparent 50%)",
        ].join(", "),
      }}
    />

    {/* SVG grain filter definition */}
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <filter id="grainy">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
      </filter>
    </svg>

    {/* Grain overlay */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        filter: "url(#grainy)",
        opacity: 0.4,
        mixBlendMode: "overlay",
      }}
    />

    {/* Content */}
    <div className="relative z-10">{children}</div>
  </div>
);

export default GrainyGradientBg;
