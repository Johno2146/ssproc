"use client";

import React, { useState } from 'react';

const Tracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated tracking data
    setTrackingData({
      id: orderId || 'SS-12345',
      status: 'In Transit',
      location: 'Johannesburg Hub',
      lastUpdate: 'June 30, 2026 - 08:45 AM',
      steps: [
        { label: 'Order Placed', date: 'June 28, 2026', done: true },
        { label: 'Packed & Ready', date: 'June 29, 2026', done: true },
        { label: 'Dispatched', date: 'June 29, 2026', done: true },
        { label: 'In Transit', date: 'June 30, 2026', done: true, current: true },
        { label: 'Out for Delivery', date: 'Expected July 1', done: false },
      ]
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-brand-950">Track Your Shipment</h2>
          <p className="mt-4 text-gray-600">Enter your order ID to see real-time status updates.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. SS-12345"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" className="bg-brand-950 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-800 transition-all">
              Track
            </button>
          </form>
        </div>

        {trackingData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-brand-50 px-8 py-6 border-b border-brand-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider">Order ID</p>
                <p className="text-xl font-bold text-brand-950">{trackingData.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
                  {trackingData.status}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-8">
                {trackingData.steps.map((step: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-brand-500 text-white' : 'bg-gray-200'}`}>
                        {step.done && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {index < trackingData.steps.length - 1 && (
                        <div className={`w-0.5 h-full ${step.done ? 'bg-brand-500' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-bold ${step.current ? 'text-brand-600' : 'text-gray-900'}`}>{step.label}</p>
                      <p className="text-sm text-gray-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="font-semibold text-gray-900">{trackingData.location}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-2.078l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.444.006 12.05c0 2.112.553 4.174 1.604 6.006L0 24l6.163-1.617a11.831 11.831 0 005.883 1.667h.005c6.603 0 12.039-5.445 12.043-12.052a11.762 11.815 0 00-3.489-8.452" />
                    </svg>
                </div>
                <p className="text-sm text-green-800">You're receiving real-time WhatsApp updates for this order.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
