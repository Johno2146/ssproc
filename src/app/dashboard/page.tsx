"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      // Fetch stats
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStats(data);
        })
        .catch(() => {});

      // Fetch recent orders
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setRecentOrders(data.slice(0, 5));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-600 text-lg">Loading...</div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-300 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S&S</span>
              </div>
              <span className="font-semibold text-brand-950">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{session?.user?.email}</span>
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
            { label: "Total Orders", value: stats.totalOrders.toString(), color: "bg-brand-100 text-brand-800" },
            { label: "Pending", value: stats.pendingOrders.toString(), color: "bg-amber-100 text-amber-800" },
            { label: "Paid", value: stats.paidOrders.toString(), color: "bg-green-100 text-green-800" },
            { label: "Revenue", value: `R${stats.totalRevenue.toFixed(2)}`, color: "bg-purple-100 text-purple-800" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-brand-950">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Admin Links */}
        {userRole === "admin" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-brand-950 mb-4">Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/products" className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors">
                <div className="font-medium text-brand-950">Manage Products</div>
                <div className="text-sm text-gray-500 mt-1">Add, edit, or remove products</div>
              </Link>
              <Link href="/dashboard/orders" className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors">
                <div className="font-medium text-brand-950">Manage Orders</div>
                <div className="text-sm text-gray-500 mt-1">View and update order status</div>
              </Link>
              <Link href="/dashboard/users" className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-brand-300 transition-colors">
                <div className="font-medium text-brand-950">Manage Users</div>
                <div className="text-sm text-gray-500 mt-1">View and manage user accounts</div>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-brand-950">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No orders yet.</p>
              <Link href="/shop" className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-medium">
                Browse Products →
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">R{Number(order.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
