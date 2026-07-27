'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(r => r.json())
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Successful!</h1>
      
      {loading ? (
        <p className="text-gray-500">Loading order details...</p>
      ) : order ? (
        <div className="text-left bg-gray-50 rounded-xl p-6 mb-6">
          <p className="font-bold text-brand-950 mb-2">Order: {order.orderNumber}</p>
          <p className="text-sm text-gray-500 mb-3">Status: <span className="text-green-600 font-medium">{order.status}</span></p>
          {order.items && order.items.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{item.productName || item.productId} × {item.quantity}</span>
                  <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                <span>Total (incl. VAT)</span>
                <span>R{order.total?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 mb-2">Thank you for your order.</p>
      )}
      
      <p className="text-gray-500 text-sm mb-8">
        A confirmation will be sent to your email. You can track your order status in your dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/shop"
          className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all"
        >
          Continue Shopping
        </Link>
        <Link
          href="/dashboard/orders"
          className="border-2 border-brand-600 text-brand-600 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-all"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Suspense fallback={
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Successful!</h1>
            <p className="text-gray-500">Loading order details...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
};

export default SuccessPage;
