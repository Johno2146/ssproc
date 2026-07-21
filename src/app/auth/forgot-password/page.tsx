"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-300 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S&S</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-950">Reset Password</h1>
          <p className="text-gray-500 mt-2">
            We'll send you a code to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-5xl">📧</div>
              <p className="text-gray-700 font-medium">Check your email</p>
              <p className="text-sm text-gray-500">
                We've sent a reset code to <strong>{email}</strong>
              </p>
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-block bg-brand-blue hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Enter Reset Code
              </Link>
              <p className="text-xs text-gray-400">
                Didn't receive it?{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-300 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}