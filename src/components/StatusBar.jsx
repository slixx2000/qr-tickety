import React from "react";

export default function StatusBar({ message, type = "success" }) {
  if (!message) return null;

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div className={`${colors[type]} text-white px-4 py-2 text-sm`}>
      {message}
    </div>
  );
}
