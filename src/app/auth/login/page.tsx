"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if the user exists but is unverified
        try {
          const checkRes = await fetch(`/api/auth/check-verification?email=${encodeURIComponent(email)}`);
          const checkData = await checkRes.json();
          if (checkData.exists && !checkData.verified) {
            setUnverified(email);
          } else {
            setError("Invalid email or password");
          }
        } catch {
          setError("Invalid email or password");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-300 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S&S</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-950">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in to your Sealed &amp; Secured account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {unverified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="text-yellow-800 font-medium mb-1">Email not verified yet</p>
              <p className="text-yellow-700 mb-3">
                Please verify your email address before signing in.
              </p>
              <Link
                href={`/auth/verify?email=${encodeURIComponent(unverified)}`}
                className="text-yellow-800 font-semibold underline hover:no-underline"
              >
                Click here to verify your email
              </Link>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}