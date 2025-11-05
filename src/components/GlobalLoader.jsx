import React from "react";

export default function GlobalLoader({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 text-base font-medium">{text}</p>
    </div>
  );
}
