'use client';

import React, { useState } from 'react';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  minOrder: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, name, price, unit, imageUrl, minOrder }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('sealed_cart');
    let cart: any[] = [];
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch {
        cart = [];
      }
    }

    const existingIndex = cart.findIndex((item: any) => item.productId === productId);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += minOrder;
    } else {
      cart.push({
        productId,
        name,
        price,
        quantity: minOrder,
        unit,
        imageUrl,
      });
    }

    localStorage.setItem('sealed_cart', JSON.stringify(cart));
    setAdded(true);
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`mt-5 w-full block text-center px-6 py-3 rounded-xl font-bold transition-all ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-brand-blue text-white hover:bg-brand-600'
      }`}
    >
      {added ? '✓ Added to Cart' : 'Add to Cart'}
    </button>
  );
};

export default AddToCartButton;