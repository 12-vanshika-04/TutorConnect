import React from "react";

export default function ButtonLoader({ size = 20, color = "white" }) {
  return (
    <div
      className="border-2 border-white border-t-transparent rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: `${color} transparent ${color} ${color}`,
      }}
    ></div>
  );
}
