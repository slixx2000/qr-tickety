import React, { useEffect, useState } from 'react';
import { supabase } from "../supabaseClient.jsx";


export default function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function checkAdmin() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin:', error);
        setIsAdmin(false);
      } else if (data && data.is_admin) {
        setIsAdmin(true);
        await loadData(); // Load tickets/scans only for admins
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Unexpected error checking admin:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    try {
      const { data: t, error: tError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (tError) console.error('Error loading tickets:', tError);

      const { data: s, error: sError } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(200);

      if (sError) console.error('Error loading scans:', sError);

      setTickets(t || []);
      setScans(s || []);
    } catch (err) {
      console.error('Unexpected error loading data:', err);
    }
  }

  if (loading)
    return <div className="bg-white p-6 rounded shadow">Checking permissions...</div>;
  if (!user)
    return <div className="bg-white p-6 rounded shadow">Please sign in to access admin.</div>;
  if (!isAdmin)
    return (
      <div className="bg-white p-6 rounded shadow">
        You are not an admin. Ask an administrator to set your profile's{' '}
        <code>is_admin</code> to true in Supabase.
      </div>
    );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Tickets</h3>
          <div className="overflow-auto max-h-96">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Used</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2 font-mono">{t.code}</td>
                    <td>{t.used ? 'Yes' : 'No'}</td>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Scans</h3>
          <div className="overflow-auto max-h-96">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Success</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2">{s.ticket_id}</td>
                    <td>{s.success ? '✓' : '✗'}</td>
                    <td>{new Date(s.scanned_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}