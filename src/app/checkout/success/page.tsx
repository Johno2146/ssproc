import React from 'react';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order.</p>
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
      </div>
    </div>
  );
};

export default SuccessPage;