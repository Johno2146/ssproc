"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-950 text-white p-4 shadow-2xl border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-brand-200 flex-1">
          This website uses cookies for essential functionality (session management) and Google Maps on the checkout page. 
          By continuing to use this site, you consent to our use of cookies.{' '}
          <Link href="/privacy" className="text-brand-300 underline hover:text-white">
            Learn more
          </Link>
        </p>
        <button
          onClick={accept}
          className="bg-brand-blue hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;