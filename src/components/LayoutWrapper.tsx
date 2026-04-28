"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className={isLoginPage ? "" : "pb-20 md:pb-0"}>
      {children}
    </div>
  );
}
