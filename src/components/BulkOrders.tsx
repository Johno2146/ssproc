"use client";

import React, { useState } from 'react';

const BulkOrders: React.FC = () => {
  const [submitted, setFormDataSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormDataSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-950 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-20 flex flex-col justify-center text-white">
              <h2 className="text-4xl font-extrabold mb-6">Bulk Procurement & Commercial Contracts</h2>
              <p className="text-xl text-brand-200 mb-8 leading-relaxed">
                We provide tiered pricing and dedicated support for high-volume users, logistics firms, and industrial distributors.
              </p>
              <ul className="space-y-4 text-brand-100">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Custom branding and numbering available
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dedicated account management
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority fulfillment and shipping
                </li>
              </ul>
            </div>
            <div className="bg-white p-12 lg:p-20">
              {submitted ? (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Quote Request Received</h3>
                  <p className="text-gray-600">A commercial representative will contact you with customized pricing within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Monthly Volume</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500">
                      <option>1,000 - 5,000 units</option>
                      <option>5,000 - 20,000 units</option>
                      <option>20,000+ units</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <button type="submit" className="w-full bg-brand-blue hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-all">
                    Request Commercial Quote
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrders;
