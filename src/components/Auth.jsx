import React, { useState } from 'react';
import { supabase } from "../supabaseClient.jsx";

export default function Auth({ user }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function signIn() {
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg('Error: ' + error.message);
    else setMsg('Magic link sent to ' + email);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{user.email}</span>
        <button className="btn" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="border px-2 py-1 text-sm" />
      <button className="btn" onClick={signIn} disabled={loading}>{loading ? 'Sending...' : 'Sign in'}</button>
      {msg && <div className="text-xs text-gray-600 ml-2">{msg}</div>}
    </div>
  );
}
