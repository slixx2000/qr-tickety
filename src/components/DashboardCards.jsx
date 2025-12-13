import React from "react";

function Card({ title, value, color }) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </div>
    </div>
  );
}

export default function DashboardCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <Card title="Total Tickets" value={stats.totalTickets} color="text-indigo-600" />
      <Card title="Used Tickets" value={stats.usedTickets} color="text-red-600" />
      <Card title="Available" value={stats.availableTickets} color="text-green-600" />
      <Card title="Users" value={stats.totalUsers} color="text-purple-600" />
    </div>
  );
}
