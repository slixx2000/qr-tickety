// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.jsx";
import DashboardCards from "./DashboardCards";
import ActivityFeed from "./ActivityFeed";
import ThemeToggle from "./ThemeToggle";
import useTheme from "../hooks/useTheme";
import AdminRoute from "./AdminRoute";

export default function AdminDashboard({ user }) {
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState({
    totalTickets: 0,
    usedTickets: 0,
    availableTickets: 0,
    totalUsers: 0
  });

  useEffect(() => {
    loadStats();
    // subscribe to ticket & scan & profiles changes
    const ch = supabase
      .channel("dashboard-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => loadStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "scans" }, () => loadStats())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => loadStats())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  async function loadStats() {
    const { data: tickets } = await supabase.from("tickets").select("id, used");
    const totalTickets = tickets?.length || 0;
    const usedTickets = tickets?.filter(t => t.used).length || 0;
    const availableTickets = totalTickets - usedTickets;

    const { data: profiles } = await supabase.from("profiles").select("id");
    const totalUsers = profiles?.length || 0;

    setStats({ totalTickets, usedTickets, availableTickets, totalUsers });
  }

  // The component supports being wrapped in AdminRoute or using your existing check.
  // If you pass user prop and want to reuse your check, keep that workflow.
  return (
    <AdminRoute>
      <div className="p-6 min-h-screen dark:bg-gray-900 dark:text-white transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">Live metrics and activity</p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className="mb-6">
          <DashboardCards stats={{ totalTickets: stats.totalTickets, usedTickets: stats.usedTickets, availableTickets: stats.availableTickets, totalUsers: stats.totalUsers }} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ActivityFeed />
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Export, bulk-actions, and other admin tools will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
