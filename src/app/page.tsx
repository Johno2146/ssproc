"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-300 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S&S</span>
              </div>
              <span className="font-bold text-xl text-brand-950">
                Sealed &amp; Secured
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#products" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Products
              </a>
              <a href="#about" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Contact
              </a>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-brand-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Trusted by logistics companies across South Africa
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-950 leading-tight">
              Premium Security Seals for
              <span className="text-brand-400"> Critical Supply Chains</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Simplify procurement of high-security seal solutions with
              integrated PayFast payments and real-time WhatsApp order tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-200 text-lg"
              >
                Browse Products
              </Link>
              <a
                href="#contact"
                className="border-2 border-gray-300 hover:border-brand-400 text-gray-700 hover:text-brand-700 px-8 py-3.5 rounded-xl font-semibold transition-colors text-lg"
              >
                Request Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-950">
              Why Choose Sealed &amp; Secured?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              End-to-end security seal procurement with modern convenience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Secure Payments",
                desc: "Integrated PayFast payment gateway for fast, secure transactions. Multiple payment methods supported.",
                icon: "🔒",
              },
              {
                title: "Order Tracking",
                desc: "Real-time WhatsApp notifications for every order status update. Never miss a shipment.",
                icon: "📱",
              },
              {
                title: "Bulk Pricing",
                desc: "Tiered pricing for high-volume commercial contracts. Enterprise-grade solutions at competitive rates.",
                icon: "📦",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-brand-950 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-950">
              Our Products
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              High-quality security seals for every application.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Bolt Seals", desc: "Heavy-duty security for containers & trucks" },
              { name: "Cable Seals", desc: "Flexible tamper-evident sealing solutions" },
              { name: "Plastic Seals", desc: "Cost-effective tamper-evident seals" },
              { name: "Metal Seals", desc: "High-security metal barrier seals" },
            ].map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all text-center"
              >
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="font-semibold text-brand-950 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-950 mb-6">
              Get In Touch
            </h2>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">📞</span>
                  <a
                    href="tel:+27105550114"
                    className="text-lg text-gray-700 hover:text-brand-600 font-medium"
                  >
                    +27 10 555 0114
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">💬</span>
                  <a
                    href="https://wa.me/27638005207"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-gray-700 hover:text-brand-600 font-medium"
                  >
                    +27 63 800 5207 (WhatsApp)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S&S</span>
              </div>
              <span className="font-semibold text-lg">
                Sealed &amp; Secured
              </span>
            </div>
            <div className="text-gray-400 text-sm text-center">
              &copy; {new Date().getFullYear()} Sealed &amp; Secured (Pty) Ltd.
              All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}