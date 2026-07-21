"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-600 text-lg">Loading...</div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-300 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S&S</span>
              </div>
              <span className="font-semibold text-brand-950">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Orders", value: "0", color: "bg-brand-100 text-brand-800" },
            { label: "Pending", value: "0", color: "bg-amber-100 text-amber-800" },
            { label: "Shipped", value: "0", color: "bg-green-100 text-green-800" },
            { label: "Quotes", value: "0", color: "bg-purple-100 text-purple-800" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-brand-950">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Admin Links */}
        {userRole === "admin" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-brand-950 mb-4">
              Admin Panel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/products"
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors"
              >
                <div className="font-medium text-brand-950">
                  Manage Products
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Add, edit, or remove products
                </div>
              </Link>
              <Link
                href="/dashboard/orders"
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors"
              >
                <div className="font-medium text-brand-950">
                  Manage Orders
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  View and update order status
                </div>
              </Link>
              <Link
                href="/dashboard/users"
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors"
              >
                <div className="font-medium text-brand-950">
                  Manage Users
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  View and manage user accounts
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-brand-950 mb-4">
            Recent Orders
          </h2>
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>No orders yet. Browse our products to get started.</p>
            <Link
              href="/"
              className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-medium"
            >
              Browse Products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}