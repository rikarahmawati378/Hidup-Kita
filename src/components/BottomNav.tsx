"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Hari Ini",
    href: "/today",
    icon: "📅",
  },
  {
    name: "Planner",
    href: "/planner",
    icon: "📝",
  },
  {
    name: "Goals",
    href: "/goals",
    icon: "🎯",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on login page
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-garden-sage/20 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-colors duration-200 ${
                isActive ? "text-garden-sage" : "text-garden-brown-light"
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className={`text-[10px] font-medium truncate w-full text-center ${
                isActive ? "text-garden-sage font-bold" : "text-garden-brown-light"
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
