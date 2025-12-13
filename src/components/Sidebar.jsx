import React from "react";
import { Home, QrCode, PlusCircle, Shield, LogOut } from "lucide-react";

export default function Sidebar({ route, navigate, user, isAdmin, open, toggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`fixed md:static z-40 h-screen bg-white dark:bg-gray-900 border-r
        transition-all duration-300
        ${open ? "w-64" : "w-16"}`}
      >
        {/* Top */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          {open && <span className="font-bold">QR Ticketing</span>}
          <button onClick={toggle} className="text-gray-500">
            ☰
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2">
          <NavItem icon={Home} label="Home" open={open} onClick={() => navigate("/")} />
          <NavItem icon={QrCode} label="Scan" open={open} onClick={() => navigate("/scan")} />

          {isAdmin && (
            <>
              <NavItem icon={PlusCircle} label="Create" open={open} onClick={() => navigate("/create")} />
              <NavItem icon={Shield} label="Admin" open={open} onClick={() => navigate("/admin")} />
            </>
          )}
        </nav>

        {/* Footer */}
        {user && (
          <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
            <button className="flex items-center gap-3 text-sm text-red-500">
              <LogOut size={18} />
              {open && "Sign out"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function NavItem({ icon: Icon, label, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Icon size={18} />
      {open && <span>{label}</span>}
    </button>
  );
}
