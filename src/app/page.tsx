"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, isAdmin, loading, signIn } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(isAdmin ? "/admin" : "/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <div className="animate-pulse text-white text-lg">{t.common.loading}</div>
    </div>
  );

  if (user) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-brand-navy" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 to-brand-navy/95" />

      {/* Lang toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "es" : "en")}
        className="absolute top-6 right-6 z-20 text-white/80 hover:text-white text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all"
      >
        {lang === "en" ? "🇲🇽 Español" : "🇺🇸 English"}
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo-sergio.png" alt="Sergio Real Estate" className="h-20 w-auto" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-brand-navy text-center mb-1">
            {t.login.title}
          </h1>
          <p className="text-brand-dark text-center mb-8 text-sm">
            {t.login.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">{t.login.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-navy/50 focus:border-brand-navy outline-none transition-all text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">{t.login.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-navy/50 focus:border-brand-navy outline-none transition-all text-gray-800"
                required
              />
            </div>

            {error && (
              <p className="text-brand-red text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary text-center disabled:opacity-50"
            >
              {submitting ? "..." : t.login.submit}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Hecho por duendes.app 2026
        </p>
      </div>
    </div>
  );
}
