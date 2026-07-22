import React from 'react';
import Link from 'next/link';
import CategoryDropdown from './CategoryDropdown';
import { quantityTiers } from '@/lib/productData';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  minOrder: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
}

const productImages: Record<string, string> = {
  'bolt-seal': '/assets/bolt-seal.jpg',
  'cable-lock-500mm': '/assets/cable-lock.jpg',
  'abs-cable-lock': '/assets/abs-cable-seal.jpg',
  'cable-seal-300mm': '/assets/cable-lock.jpg',
  'cable-seal-500mm': '/assets/cable-lock.jpg',
  'suregas-seal': '/assets/suretite.jpg',
  'nylock-seal': '/assets/nylock.jpg',
  'padlock-seal': '/assets/padlock.jpg',
  'twinlock': '/assets/twinlock.jpg',
  'twinlock-barcoded': '/assets/twinlock.jpg',
  'suretite-barcoded': '/assets/suretite.jpg',
  'suretite-230mm': '/assets/suretite.jpg',
  'suretite-320mm': '/assets/suretite.jpg',
};

// Category definitions: slug -> product slugs
const categories: Record<string, { label: string; slugs: string[] }> = {
  'all': { label: 'All Products', slugs: [] },
  'plastic': { label: 'Plastic Seals', slugs: ['suretite-230mm', 'suretite-320mm', 'suretite-barcoded', 'twinlock', 'twinlock-barcoded', 'padlock-seal', 'nylock-seal'] },
  'barrier': { label: 'Barrier Seals', slugs: ['bolt-seal', 'cable-lock-500mm', 'abs-cable-lock', 'cable-seal-300mm', 'cable-seal-500mm'] },
  'plastic-cable-ties': { label: 'Plastic Cable Ties', slugs: [] },
  'steel-cable-ties': { label: 'Stainless Steel Cable Ties', slugs: [] },
  'specialized': { label: 'Specialized Seals', slugs: ['suregas-seal'] },
};

async function getProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface ShopPageProps {
  selectedCategory: string;
}

const ShopPage: React.FC<ShopPageProps> = async ({ selectedCategory }) => {
  const allProducts = await getProducts();

  // Filter products by category
  const categoryDef = categories[selectedCategory] || categories['all'];
  const products = categoryDef.slugs.length > 0
    ? allProducts.filter(p => categoryDef.slugs.includes(p.slug))
    : allProducts;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-brand-950 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our complete range of premium security seal solutions.
          </p>
        </div>

        {/* Category Dropdown */}
        <div className="flex justify-center mb-10">
          <CategoryDropdown categories={categories} selectedCategory={selectedCategory} />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-brand-950 mb-4">No products in this category</h2>
            <p className="text-gray-500 mb-8">Try selecting a different category.</p>
            <Link href="/shop" className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all inline-block">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                <Link href={`/shop/${product.slug}`} className="aspect-[4/3] bg-gray-100 flex items-center justify-center p-4 overflow-hidden block">
                    {productImages[product.slug] ? (
                      <img src={productImages[product.slug]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-6xl">🔒</div>
                    )}
                  </Link>
                <div className="p-6">
                  <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                    {product.category}
                  </div>
                  <Link href={`/shop/${product.slug}`} className="text-xl font-bold text-brand-950 mb-2 hover:text-brand-600 transition-colors">{product.name}</Link>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    {quantityTiers[product.slug] ? (
                      <>
                        <span className="text-2xl font-bold text-brand-950">From R{Math.min(...quantityTiers[product.slug].map(t => t.price)).toFixed(2)}</span>
                        <span className="text-sm text-gray-400">excl. VAT</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-brand-950">R{product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-400">excl. VAT / {product.unit}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <Link
                    href={`/shop/${product.slug}`}
                    className="mt-5 w-full block text-center bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all"
                  >
                    Select Options
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;