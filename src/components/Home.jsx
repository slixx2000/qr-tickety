import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import DashboardCards from "./DashboardCards";

export default function Home({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function loadStats() {
      const { data } = await supabase.from("tickets").select("used");

      if (data) {
        const total = data.length;
        const used = data.filter(t => t.used).length;

        setStats({
          totalTickets: total,
          usedTickets: used,
          availableTickets: total - used,
          totalUsers: 1 // placeholder unless you expose users table
        });
      }
    }

    loadStats();
  }, [user]);

  if (!user)
    return <div className="p-6">Please sign in to view dashboard.</div>;

  if (!stats)
    return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardCards stats={stats} />
    </div>
  );
}
