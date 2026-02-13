"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase sends the user here with a hash fragment containing the access token
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
          setLoading(false);
        });
        return;
      }
    }
    setLoading(false);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => router.push("/"), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <div className="animate-pulse text-white text-lg">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h1 className="text-2xl font-serif font-bold text-brand-navy text-center mb-6">
          Set New Password
        </h1>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">✅ Password updated successfully!</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-navy/50 focus:border-brand-navy outline-none transition-all text-gray-800"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-navy/50 focus:border-brand-navy outline-none transition-all text-gray-800"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full btn-primary text-center">
              Update Password
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">Hecho por duendes.app 2026</p>
      </div>
    </div>
  );
}
