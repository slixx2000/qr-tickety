import React from 'react';
export default function Header({ user }){
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold">QR Ticketing</h1>
      <p className="text-sm text-gray-600">Single-use QR tickets • offline persistence • Netlify + Supabase</p>
      {user && <div className="text-xs mt-2 text-gray-700">Signed in as {user.email}</div>}
    </header>
  );
}
