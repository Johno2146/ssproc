'use client';

import React, { useState } from 'react';

interface QuantityTier {
  label: string;
  unit: string;
  price: number;
  shipping?: {
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
}

interface ProductDetailClientProps {
  productId: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  minOrder: number;
  colours: string[];
  tiers: QuantityTier[] | null;
  tierColours?: Record<string, string[]>;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

const colourHexMap: Record<string, string> = {
  'White': '#ffffff',
  'Black': '#000000',
  'Red': '#dc2626',
  'Purple': '#9333ea',
  'Light Blue': '#60a5fa',
  'Dark Blue': '#1e40af',
  'Orange': '#f97316',
  'Brown': '#92400e',
  'Light Green': '#86efac',
  'Dark Green': '#166534',
  'Yellow': '#eab308',
  'Pink': '#ec4899',
  'Grey': '#6b7280',
  'Blue': '#2563eb',
  'Green': '#16a34a',
  'Navy': '#1e3a5f',
  'Lime': '#84cc16',
  'Silver': '#c0c0c0',
};

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ productId, name, price, unit, imageUrl, minOrder, colours, tiers, tierColours, weightKg, lengthCm, widthCm, heightCm }) => {
  const [added, setAdded] = useState(false);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const hasTiers = tiers && tiers.length > 0;
  const activeTier = hasTiers ? tiers[selectedTierIndex] : null;
  const displayPrice = activeTier ? activeTier.price : price;
  const displayUnit = activeTier ? activeTier.unit : unit;
  const displayLabel = activeTier ? activeTier.label : null;
  const totalPrice = displayPrice * quantity;

  // Get the colours for the currently selected tier, falling back to the default colours array
  const activeColours = (activeTier && tierColours && tierColours[activeTier.label])
    ? tierColours[activeTier.label]
    : colours;

  const hasColourOptions = activeColours.length > 0 && activeColours[0] !== 'Standard' && activeColours[0] !== 'Various Colours - contact for availability';
  const canAddToCart = !hasColourOptions || (hasColourOptions && selectedColour !== null);

  // Reset selected colour if the current tier doesn't support it
  if (selectedColour && !activeColours.includes(selectedColour)) {
    setSelectedColour(null);
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const savedCart = localStorage.getItem('sealed_cart');
    let cart: any[] = [];
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch {
        cart = [];
      }
    }

    const cartItem = {
      productId,
      name,
      price: displayPrice,
      quantity,
      unit: displayUnit,
      tierLabel: displayLabel,
      imageUrl,
      colour: hasColourOptions ? selectedColour : undefined,
      weightKg: activeTier?.shipping?.weightKg ?? weightKg,
      lengthCm: activeTier?.shipping?.lengthCm ?? lengthCm,
      widthCm: activeTier?.shipping?.widthCm ?? widthCm,
      heightCm: activeTier?.shipping?.heightCm ?? heightCm,
    };

    const existingIndex = cart.findIndex(
      (item: any) => item.productId === productId && (hasColourOptions ? item.colour === selectedColour : true) && item.tierLabel === displayLabel
    );
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('sealed_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Colour Options - Selectable */}
      {hasColourOptions && (
        <div>
          <h3 className="text-sm font-bold text-brand-950 mb-3">
            Colour Options <span className="text-red-500">*</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeColours.map((colour) => {
              const hex = colourHexMap[colour] || '#ccc';
              const isSelected = selectedColour === colour;
              return (
                <button
                  key={colour}
                  onClick={() => setSelectedColour(colour)}
                  className="group relative"
                  title={colour}
                >
                  <div
                    className={`w-8 h-8 rounded-full transition-all ${
                      isSelected
                        ? 'ring-2 ring-brand-600 ring-offset-2 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: hex, border: colour === 'White' ? '2px solid #d1d5db' : '2px solid #e5e7eb' }}
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {colour}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedColour && (
            <p className="text-xs text-brand-600 mt-2 font-medium">Selected: {selectedColour}</p>
          )}
        </div>
      )}

      {/* Quantity Tier Selector */}
      {hasTiers && (
        <div>
          <h3 className="text-sm font-bold text-brand-950 mb-3">Pack Size</h3>
          <div className="flex flex-wrap gap-3">
            {tiers.map((tier, index) => (
              <button
                key={tier.label}
                onClick={() => { setSelectedTierIndex(index); setQuantity(1); }}
                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                  selectedTierIndex === index
                    ? 'bg-brand-blue text-white border-brand-600 shadow-md'
                    : 'bg-white text-brand-950 border-gray-200 hover:border-brand-600'
                }`}
              >
                <span className="block">{tier.label}</span>
                <span className={`block text-xs mt-0.5 ${selectedTierIndex === index ? 'text-white/80' : 'text-brand-600'}`}>
                  R{tier.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Dimensions - show when a tier with shipping data is selected */}
      {activeTier?.shipping && (
        <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Package Dimensions</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white rounded-lg p-2">
              <div className="text-lg font-bold text-brand-950">{activeTier.shipping.weightKg < 1 ? `${(activeTier.shipping.weightKg * 1000).toFixed(0)}g` : `${activeTier.shipping.weightKg.toFixed(1)}kg`}</div>
              <div className="text-xs text-gray-500">Weight</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-lg font-bold text-brand-950">{activeTier.shipping.lengthCm}cm</div>
              <div className="text-xs text-gray-500">Length</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-lg font-bold text-brand-950">{activeTier.shipping.widthCm}cm</div>
              <div className="text-xs text-gray-500">Width</div>
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-lg font-bold text-brand-950">{activeTier.shipping.heightCm}cm</div>
              <div className="text-xs text-gray-500">Height</div>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <h3 className="text-sm font-bold text-brand-950 mb-3">Quantity ({displayUnit})</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className={`w-12 h-12 rounded-xl text-2xl font-bold transition-all border-2 ${
              quantity <= 1
                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                : 'bg-white text-brand-600 border-brand-600 hover:bg-brand-600 hover:text-white'
            }`}
          >
            −
          </button>
          <span className="text-2xl font-bold text-brand-950 w-12 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 rounded-xl text-2xl font-bold transition-all border-2 bg-white text-brand-600 border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-bold text-brand-950">R{totalPrice.toFixed(2)}</span>
        <span className="text-gray-400">excl. VAT</span>
      </div>
      {quantity > 1 && (
        <p className="text-xs text-gray-400 -mt-2">
          R{displayPrice.toFixed(2)} per {displayUnit}
        </p>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          added
            ? 'bg-green-500 text-white'
            : canAddToCart
              ? 'bg-brand-blue text-white hover:bg-brand-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {added
          ? '✓ Added to Cart'
          : !canAddToCart
            ? 'Select a Colour'
            : `Add to Cart - R${totalPrice.toFixed(2)}`}
      </button>
    </div>
  );
};

export default ProductDetailClient;