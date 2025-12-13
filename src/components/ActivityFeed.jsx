// src/components/ActivityFeed.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.jsx";

export default function ActivityFeed({ limit = 50 }) {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      // Load recent scans (scans table) and recent profiles (new users).
      const [{ data: scans }, { data: profiles }] = await Promise.all([
        supabase.from("scans").select("id, ticket_id, scanned_at, success, note").order("scanned_at", { ascending: false }).limit(limit),
        supabase.from("profiles").select("id, email, created_at").order("created_at", { ascending: false }).limit(limit)
      ]);

      // Merge into a single feed ordered by time
      const scanItems = (scans || []).map(s => ({
        type: "scan",
        id: s.id,
        ticket_id: s.ticket_id,
        time: s.scanned_at,
        success: s.success,
        note: s.note || null
      }));

      const userItems = (profiles || []).map(p => ({
        type: "user",
        id: p.id,
        email: p.email,
        time: p.created_at
      }));

      const merged = [...scanItems, ...userItems].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, limit);
      if (mounted) setFeed(merged);
    }

    loadInitial();

    // Realtime subscriptions
    const scansChannel = supabase
      .channel("realtime-scans")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scans" }, (payload) => {
        setFeed(prev => [{ type: "scan", id: payload.new.id, ticket_id: payload.new.ticket_id, time: payload.new.scanned_at, success: payload.new.success, note: payload.new.note }, ...prev].slice(0,limit));
      })
      .subscribe();

    const profilesChannel = supabase
      .channel("realtime-profiles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        setFeed(prev => [{ type: "user", id: payload.new.id, email: payload.new.email, time: payload.new.created_at }, ...prev].slice(0,limit));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(scansChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [limit]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Activity Feed</h3>
        <div className="text-xs text-gray-500">Realtime</div>
      </div>

      <div className="space-y-3 max-h-80 overflow-auto">
        {feed.length === 0 && <div className="text-sm text-gray-500">No activity yet.</div>}
        {feed.map(item => (
          <div key={item.type + item.id} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
              {item.type === "scan" ? (item.success ? "✓" : "✕") : "👤"}
            </div>
            <div className="flex-1">
              {item.type === "scan" ? (
                <>
                  <div className="text-sm">
                    <span className="font-medium">Scan</span> — Ticket <span className="font-mono">{item.ticket_id}</span>
                    {item.note ? <span className="text-xs text-gray-400"> — {item.note}</span> : null}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(item.time).toLocaleString()}</div>
                </>
              ) : (
                <>
                  <div className="text-sm"><span className="font-medium">New user</span> — {item.email}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(item.time).toLocaleString()}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

