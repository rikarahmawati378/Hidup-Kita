"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  email: string;
}

export default function Navbar({ email }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-garden-sage/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-lg font-bold text-garden-brown tracking-tight">
              HidupKita
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/dashboard" className="text-sm font-medium text-garden-brown hover:text-garden-sage transition-colors">
              Dashboard
            </a>
            <a href="/today" className="text-sm font-medium text-garden-brown hover:text-garden-sage transition-colors">
              Hari Ini
            </a>
            <a href="/goals" className="text-sm font-medium text-garden-brown hover:text-garden-sage transition-colors">
              Goals
            </a>
            <a href="/planner" className="text-sm font-medium text-garden-brown hover:text-garden-sage transition-colors">
              Planner
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-garden-brown-light truncate max-w-[150px]">
              {email}
            </span>
            <button
              id="logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-garden-brown bg-white border border-garden-sage/30 transition-all duration-200 hover:bg-garden-sage-light hover:text-garden-sage focus:outline-none focus:ring-2 focus:ring-garden-sage/50 disabled:opacity-50 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">
                {loggingOut ? "Keluar..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
