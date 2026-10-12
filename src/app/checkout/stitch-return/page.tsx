"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Stitch hosted-UI return page.
 *
 * Stitch redirects the customer back here (this URL is appended as
 * redirect_uri / failure_redirect_uri when the payment request is created)
 * with: id, status (complete|closed|failed), payment_method, externalReference.
 *
 * IMPORTANT: this page is UI ONLY. The query string can be forged, so payment
 * status is NEVER written to the database here — the signed /api/webhooks/stitch
 * webhook is the source of truth and marks the order paid server-side.
 */
function ReturnContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const id = searchParams.get('id');
  const orderRef = searchParams.get('externalReference');
  const completed = status === 'complete';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
          {completed ? (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-2">
                {orderRef
                  ? <>Your payment for order <span className="font-bold text-brand-950">{orderRef}</span> was received.</>
                  : 'Your payment was received.'}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                A confirmation email is on its way. Your order status updates automatically once your payment is confirmed.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">⏸️</div>
              <h1 className="text-3xl font-extrabold text-brand-950 mb-4">Payment Not Completed</h1>
              <p className="text-gray-600 mb-8">
                Your payment was not completed. Your items are still saved in your cart if you&apos;d like to try again.
              </p>
            </>
          )}
          {id && (
            <p className="text-[10px] text-gray-300 mb-2">Ref: {id}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={completed ? '/orders' : '/checkout'}
              className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all"
            >
              {completed ? 'View My Orders' : 'Try Again'}
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
}

const StitchReturnPage: React.FC = () => (
  <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
    <ReturnContent />
  </Suspense>
);

export default StitchReturnPage;