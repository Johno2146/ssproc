import React from 'react';
import Link from 'next/link';

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
          <div className="text-6xl mb-6">⏸️</div>
          <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-8">
            Your payment was not completed. Your items are still saved in your cart if you&apos;d like to try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all"
            >
              Try Again
            </Link>
            <Link
              href="/shop"
              className="border-2 border-brand-600 text-brand-600 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;