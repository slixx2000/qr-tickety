// src/components/Card.jsx
import React from "react";

export default function Card({ title, value, subtitle, color = "bg-blue-500" }) {
  return (
    <div className="p-4 rounded-xl shadow-md dark:bg-gray-800 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-300">{title}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
        <div className={`w-12 h-12 flex items-center justify-center rounded ${color} text-white`}>
          {/* small icon area; replace with SVG if desired */}
          <span className="font-bold text-lg">{String(value).slice(0,2)}</span>
        </div>
      </div>
    </div>
  );
}

