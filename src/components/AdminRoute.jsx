// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.jsx";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        if (mounted) { setIsAdmin(false); setLoading(false); }
        return;
      }

      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      if (mounted) {
        setIsAdmin(!!(data && data.is_admin));
        setLoading(false);
      }
    }

    check();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Checking permissions...</div>;
  if (!isAdmin) return <div className="p-4">Access denied: Admins only.</div>;
  return <>{children}</>;
}

