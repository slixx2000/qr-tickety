import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import Home from "./components/Home";
import Scanner from "./components/Scanner";
import TicketGenerator from "./components/TicketGenerator";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState("System operational");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  function navigate(path) {
    window.history.pushState({}, "", path);
    setRoute(path);
  }

  return (
    <div className="flex">
      <Sidebar
        route={route}
        navigate={navigate}
        user={user}
        isAdmin={isAdmin}
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
        <StatusBar message={status} />

        <div className="p-6">
          {!user && <Auth user={user} />}

          {route === "/" && <Home user={user} />}
          {route === "/scan" && <Scanner />}
          {route === "/create" && <TicketGenerator />}
          {route === "/admin" && <AdminDashboard user={user} />}
        </div>
      </main>
    </div>
  );
}
