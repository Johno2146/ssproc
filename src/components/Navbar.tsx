"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const savedCart = localStorage.getItem('sealed_cart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('cartUpdated', updateCart);
    window.addEventListener('focus', updateCart);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateCart();
    });
    // Fallback: poll every 3 seconds to catch any missed updates
    const interval = setInterval(updateCart, 3000);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cartUpdated', updateCart);
      window.removeEventListener('focus', updateCart);
      window.removeEventListener('visibilitychange', updateCart);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/assets/logo.png" alt="Sealed & Secured" className="h-[84px] w-auto" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Home</Link>
            <Link href="/services" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Services</Link>
            <div className="relative group">
              <Link href="/shop" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Shop</Link>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                {/* Security Seals — nested sub-menu */}
                <div className="relative group/sub px-4 py-2 hover:bg-gray-50 rounded-lg mx-2">
                  <Link href="/shop?category=plastic" className="flex items-center justify-between text-gray-600 hover:text-brand-600 font-medium">
                    Security Seals
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="absolute left-full top-0 mt-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50 py-2 ml-1">
                    <Link href="/shop?category=plastic" className="block px-4 py-2.5 text-gray-600 hover:text-brand-600 hover:bg-gray-50 font-medium">Plastic Seals</Link>
                    <Link href="/shop?category=barrier" className="block px-4 py-2.5 text-gray-600 hover:text-brand-600 hover:bg-gray-50 font-medium">Barrier Seals</Link>
                  </div>
                </div>
                {/* Cable Ties — nested sub-menu */}
                <div className="relative group/sub px-4 py-2 hover:bg-gray-50 rounded-lg mx-2">
                  <Link href="/shop?category=plastic-cable-ties" className="flex items-center justify-between text-gray-600 hover:text-brand-600 font-medium">
                    Cable Ties
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="absolute left-full top-0 mt-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50 py-2 ml-1">
                    <Link href="/shop?category=plastic-cable-ties" className="block px-4 py-2.5 text-gray-600 hover:text-brand-600 hover:bg-gray-50 font-medium">Plastic Cable Ties</Link>
                    <Link href="/shop?category=steel-cable-ties" className="block px-4 py-2.5 text-gray-600 hover:text-brand-600 hover:bg-gray-50 font-medium">Stainless Steel Cable Ties</Link>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/about" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">About</Link>
            <Link href="/checkout" className="relative text-gray-600 hover:text-brand-600 font-medium transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11.5M7 13L5.4 7M17 13l1.5 6M2 3h2l2.5 9M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-blue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Dashboard</Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-500 hover:text-red-600 font-medium transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            )}
            <Link href="/contact" className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-md shadow-brand-100">
              Contact Sales
            </Link>
            {!session && (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Sign In</Link>
                <Link href="/auth/register" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Register</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link href="/checkout" className="relative text-gray-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11.5M7 13L5.4 7M17 13l1.5 6M2 3h2l2.5 9M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-blue text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-2">
          <Link href="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Home</Link>
          <Link href="/services" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Services</Link>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Shop</p>
            <Link href="/shop?category=plastic" onClick={() => setIsOpen(false)} className="block py-1.5 text-gray-600 font-medium hover:text-brand-600">Plastic Seals</Link>
            <Link href="/shop?category=barrier" onClick={() => setIsOpen(false)} className="block py-1.5 text-gray-600 font-medium hover:text-brand-600">Barrier Seals</Link>
            <Link href="/shop?category=plastic-cable-ties" onClick={() => setIsOpen(false)} className="block py-1.5 text-gray-600 font-medium hover:text-brand-600">Plastic Cable Ties</Link>
            <Link href="/shop?category=steel-cable-ties" onClick={() => setIsOpen(false)} className="block py-1.5 text-gray-600 font-medium hover:text-brand-600">Stainless Steel Cable Ties</Link>
          </div>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">About</Link>
          <Link href="/checkout" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Cart ({cartCount})</Link>
          {status === 'authenticated' ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Dashboard</Link>
              <button
                onClick={() => { setIsOpen(false); signOut({ callbackUrl: '/' }); }}
                className="block w-full text-left px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
            </>
          )}
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-2 bg-brand-blue text-white font-bold rounded-lg text-center">Contact Sales</Link>
            <>
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Sign In</Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Register</Link>
            ) : null}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

