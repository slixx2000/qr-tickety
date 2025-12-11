import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient.jsx";
import Header from './components/Header';
import TicketGenerator from './components/TicketGenerator';
import Scanner from './components/Scanner';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';



export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Session user:', datasession?.user);
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  function nav(path) {
    window.history.pushState({}, '', path);
    setRoute(path);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Header user={user} />
      <div className="flex gap-3 mb-4">
        <button className="btn" onClick={() => nav('/')}>Home</button>
        <button className="btn" onClick={() => nav('/create')}>Create</button>
        <button className="btn" onClick={() => nav('/scan')}>Scan</button>
        <button className="btn" onClick={() => nav('/admin')}>Admin</button>
        <div style={{ marginLeft: 'auto' }}>
          <Auth user={user} />
        </div>
      </div>

      {route === '/' && (
        <div className="bg-white p-6 rounded shadow">Welcome to QR Ticketing</div>
      )}
      {route === '/create' && <TicketGenerator />}
      {route === '/scan' && <Scanner />}
      {route === '/admin' && <AdminDashboard user={user} />}
    </div>
  );
}
window.supabase = supabase;