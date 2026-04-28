import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk — HidupKita",
  description: "Masuk ke akun HidupKita Anda untuk melacak kebiasaan harian.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
