"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-garden-bg to-garden-sage-light p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-garden-sage/20 p-8 sm:p-10 border border-garden-sage/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-garden-sage/10 mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-extrabold text-garden-brown tracking-tight">
            HidupKita
          </h1>
          <p className="text-garden-brown-light mt-2 font-medium">
            Membangun kebiasaan baik bersama.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-garden-brown mb-2 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 focus:bg-white focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage outline-none transition-all text-garden-brown"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-garden-brown mb-2 ml-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-garden-sage/30 bg-garden-sage-light/30 focus:bg-white focus:ring-2 focus:ring-garden-sage/20 focus:border-garden-sage outline-none transition-all text-garden-brown"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-garden-sage hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-garden-sage/30 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Masuk..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-garden-sage/10 text-center">
          <p className="text-sm text-garden-brown-light">
            Belum punya akun? <span className="font-semibold text-garden-sage cursor-not-allowed">Daftar sekarang</span>
          </p>
        </div>
      </div>
    </div>
  );
}
