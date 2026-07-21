"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocationAutocomplete from './LocationAutocomplete';
import { signIn, useSession } from 'next-auth/react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  colour?: string;
  tierLabel?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

interface ShippingOption {
  provider: string;
  service: string;
  price: number;
  estimatedDays: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'collection' | 'delivery'>('collection');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    subpremise: '',
    premise: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    formatted: '',
  });
  const [shippingQuotes, setShippingQuotes] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('collection');
  const [fetchingQuotes, setFetchingQuotes] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('sealed_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const VAT_RATE = 0.15;
  const vat = total * VAT_RATE;

  // Build parcels array - one per unique product with proper dimensions × quantity
  const parcels = cartItems.map(item => ({
    submitted_length_cm: Math.ceil(item.lengthCm || 20),
    submitted_width_cm: Math.ceil(item.widthCm || 15),
    submitted_height_cm: Math.ceil(item.heightCm || 10),
    submitted_weight_kg: Math.round((item.weightKg || 0.1) * item.quantity * 10) / 10,
  }));

  // Calculate total weight for display
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weightKg || 0.01) * item.quantity, 0);

  // Calculate max dimensions across all parcels for display
  const longestLength = Math.max(...cartItems.map(item => item.lengthCm || 20));
  const totalWidth = cartItems.reduce((sum, item) => sum + (item.widthCm || 10) * item.quantity, 0);
  const tallestHeight = Math.max(...cartItems.map(item => item.heightCm || 10));

  // Calculate shipping cost
  let shippingCost = 0;
  if (selectedShipping === 'collection') {
    shippingCost = 0;
  } else if (selectedShipping) {
    const selected = shippingQuotes.find(q => `${q.provider}-${q.service}` === selectedShipping);
    if (selected) shippingCost = selected.price;
  }

  const grandTotal = total + vat + shippingCost;

  const handleQuantityChange = (productId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('sealed_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId: string) => {
    const updated = cartItems.filter(item => item.productId !== productId);
    setCartItems(updated);
    localStorage.setItem('sealed_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const fetchShippingQuotes = async () => {
    const code = deliveryAddress.postalCode || deliveryPostalCode;
    if (!code || code.length < 4) return;
    setFetchingQuotes(true);
    setError('');
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcels,
          weight: Math.round(totalWeight * 10) / 10,
          destinationPostalCode: code,
          destinationCity: deliveryAddress.city || '',
          destinationZone: deliveryAddress.province || '',
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setShippingQuotes([]);
      } else if (data.quotes && data.quotes.length > 0) {
        setShippingQuotes(data.quotes);
        setError('');
        // Auto-select the cheapest
        if (!selectedShipping || selectedShipping === 'collection') {
          setSelectedShipping(`${data.quotes[0].provider}-${data.quotes[0].service}`);
        }
      } else {
        setError('No shipping rates available for this postal code. Try Collection instead.');
        setShippingQuotes([]);
      }
    } catch (e) {
      console.error('Failed to fetch shipping quotes:', e);
      setError('Failed to get shipping rates. Please try again.');
    } finally {
      setFetchingQuotes(false);
    }
  };

  const handleCheckout = async () => {
    if (!session?.user) {
      router.push('/auth/login?callbackUrl=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!shippingDetails.name || !shippingDetails.phone) {
      setError('Please fill in your name and phone number');
      return;
    }

    if (deliveryMethod === 'delivery' && !selectedShipping) {
      setError('Please select a shipping method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingDetails: {
            ...shippingDetails,
            email: shippingDetails.email || session.user.email,
          },
          shipping: {
            method: deliveryMethod,
            cost: shippingCost,
            provider: selectedShipping !== 'collection' ? selectedShipping : 'collection',
            postalCode: deliveryMethod === 'delivery' ? deliveryPostalCode : '1559',
            ...(deliveryMethod === 'delivery' && {
              street: deliveryAddress.street,
              premise: deliveryAddress.premise,
              subpremise: deliveryAddress.subpremise,
              suburb: deliveryAddress.suburb,
              city: deliveryAddress.city,
              province: deliveryAddress.province,
            }),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Clear cart
      localStorage.removeItem('sealed_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      // Create a form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payfastUrl;

      Object.entries(data.payfastData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-brand-950 mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-brand-950 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to get started.</p>
            <Link href="/shop" className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-brand-950 mb-4">Cart Items ({cartItems.length})</h2>
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">🔒</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-950">{item.name}</h3>
                    {item.colour && <p className="text-xs text-gray-500 mt-0.5">Colour: {item.colour}</p>}
                    {item.tierLabel && <p className="text-xs text-brand-600 mt-0.5 font-medium">{item.tierLabel}</p>}
                    <p className="text-brand-600 font-semibold mt-1">R{item.price.toFixed(2)} excl. VAT / {item.unit}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                      >
                        -
                      </button>
                      <span className="font-bold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-brand-950">R{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">excl. VAT</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Shipping */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-brand-950 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal (excl. VAT)</span>
                    <span className="font-semibold">R{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (15%)</span>
                    <span className="font-semibold">R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-brand-950'}`}>
                      {shippingCost === 0 ? 'Free' : `R${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total (incl. VAT)</span>
                    <span className="font-bold text-brand-950">R{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-brand-950 mb-4">Delivery Method</h2>
                <div className="space-y-3">
                  {/* Collection option */}
                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'collection'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="collection"
                      checked={deliveryMethod === 'collection'}
                      onChange={() => {
                        setDeliveryMethod('collection');
                        setSelectedShipping('collection');
                      }}
                      className="w-4 h-4 text-brand-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-bold text-brand-950">Collection</span>
                      <p className="text-xs text-gray-500">Collect from Eastwood Business Park, Springs (1559)</p>
                    </div>
                    <span className="font-bold text-green-600">Free</span>
                  </label>

                  {/* Delivery option */}
                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => {
                        setDeliveryMethod('delivery');
                        if (deliveryPostalCode && shippingQuotes.length > 0) {
                          setSelectedShipping(`${shippingQuotes[0].provider}-${shippingQuotes[0].service}`);
                        }
                      }}
                      className="w-4 h-4 text-brand-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-bold text-brand-950">Delivery</span>
                      <p className="text-xs text-gray-500">Courier to your door</p>
                    </div>
                  </label>

                  {/* Delivery address input */}
                  {deliveryMethod === 'delivery' && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search Address</label>
                        <LocationAutocomplete
                          onAddressSelect={(address) => {
                            setDeliveryAddress(address);
                            setDeliveryPostalCode(address.postalCode);
                            // Auto-fetch rates after address is selected
                            setTimeout(() => {
                              if (address.postalCode && address.postalCode.length >= 4) {
                                const fetchBtn = document.getElementById('get-rates-btn');
                                if (fetchBtn) fetchBtn.click();
                              }
                            }, 500);
                          }}
                          placeholder="Start typing your address..."
                          className="w-full"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Search above, then edit the fields below if needed</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Street Address *</label>
                          <input
                            type="text"
                            value={deliveryAddress.street}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                            placeholder="123 Main Street"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Complex / Building</label>
                          <input
                            type="text"
                            value={deliveryAddress.premise}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, premise: e.target.value })}
                            placeholder="e.g. Sunninghill Estate"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Unit / Apt</label>
                          <input
                            type="text"
                            value={deliveryAddress.subpremise}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, subpremise: e.target.value })}
                            placeholder="e.g. Unit 5, Apt 12"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Suburb</label>
                          <input
                            type="text"
                            value={deliveryAddress.suburb}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, suburb: e.target.value })}
                            placeholder="e.g. Nuffield"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">City *</label>
                          <input
                            type="text"
                            value={deliveryAddress.city}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                            placeholder="e.g. Springs"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Province</label>
                          <input
                            type="text"
                            value={deliveryAddress.province}
                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, province: e.target.value })}
                            placeholder="e.g. Gauteng"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Postal Code *</label>
                          <input
                            type="text"
                            value={deliveryAddress.postalCode || deliveryPostalCode}
                            onChange={(e) => {
                              const code = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setDeliveryPostalCode(code);
                              setDeliveryAddress({ ...deliveryAddress, postalCode: code });
                            }}
                            placeholder="e.g. 1559"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                          />
                        </div>
                      </div>

                      <button
                        id="get-rates-btn"
                        onClick={fetchShippingQuotes}
                        disabled={fetchingQuotes || (!deliveryAddress.postalCode && deliveryPostalCode.length < 4)}
                        className="w-full px-4 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-all disabled:opacity-50"
                      >
                        {fetchingQuotes ? 'Loading...' : 'Get Shipping Rates'}
                      </button>

                      {/* Parcel dimensions - auto-calculated from cart */}
                      {cartItems.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">Parcel size (auto-calculated)</span>
                            <span className="text-[10px] text-gray-400">{cartItems.length} item(s)</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <span className="block text-xs text-gray-400">Weight</span>
                              <span className="block text-sm font-bold text-brand-950">{Math.round(totalWeight * 10) / 10} kg</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-400">Length</span>
                              <span className="block text-sm font-bold text-brand-950">{Math.ceil(longestLength)} cm</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-400">Width</span>
                              <span className="block text-sm font-bold text-brand-950">{Math.ceil(totalWidth)} cm</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-400">Height</span>
                              <span className="block text-sm font-bold text-brand-950">{Math.ceil(tallestHeight)} cm</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Shipping quotes */}
                      {shippingQuotes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available courier options</p>
                          {shippingQuotes.map((quote) => {
                            const quoteId = `${quote.provider}-${quote.service}`;
                            return (
                              <label
                                key={quoteId}
                                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedShipping === quoteId
                                    ? 'border-brand-600 bg-brand-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="shippingOption"
                                  value={quoteId}
                                  checked={selectedShipping === quoteId}
                                  onChange={() => setSelectedShipping(quoteId)}
                                  className="w-4 h-4 text-brand-600"
                                />
                                <div className="ml-3 flex-1">
                                  <span className="font-semibold text-sm text-brand-950">{quote.service}</span>
                                  <p className="text-xs text-gray-500">{quote.provider} · {quote.estimatedDays} days</p>
                                </div>
                                <span className="font-bold text-brand-950">R{quote.price.toFixed(2)}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-brand-950 mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={shippingDetails.name}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none"
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none"
                      placeholder={session?.user?.email || 'your@email.com'}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {!session?.user && (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm">
                  You need to <Link href="/auth/login?callbackUrl=/checkout" className="font-bold underline">sign in</Link> to complete your purchase.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-brand-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-600 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay R${grandTotal.toFixed(2)} with PayFast`}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
                <span className="text-xs text-gray-400">Secured by</span>
                <span className="text-xs font-bold text-gray-600">PayFast</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;