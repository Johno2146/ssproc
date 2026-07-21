import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { productSpecs, quantityTiers, tierColours } from '@/lib/productData';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({ where: { slug } });
    return product;
  } catch {
    return null;
  }
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

const ProductDetailPage: React.FC<ProductPageProps> = async ({ params }) => {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-brand-950 mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const spec = productSpecs[product.slug] || null;
  const imageUrl = productImages[product.slug] || product.imageUrl || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-brand-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-950 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-center aspect-square">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="text-8xl">🔒</div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">
              {product.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-950 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-950">R{product.price.toFixed(2)}</span>
              <span className="text-gray-400">excl. VAT / {product.unit}</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`inline-block w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-sm text-gray-400">Min. order: {product.minOrder} {product.unit}</span>
            </div>

            {/* Client-side add to cart */}
            <ProductDetailClient
              productId={product.id}
              name={product.name}
              price={product.price}
              unit={product.unit}
              imageUrl={imageUrl}
              minOrder={product.minOrder}
              colours={spec?.colours || []}
              tiers={quantityTiers[product.slug] || null}
              tierColours={tierColours[product.slug]}
              weightKg={spec?.weightKg}
              lengthCm={spec?.lengthCm}
              widthCm={spec?.widthCm}
              heightCm={spec?.heightCm}
            />

            {/* Specifications */}
            {spec && (
              <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-brand-950 mb-4">Product Specifications</h2>
                <dl className="space-y-3">
                  {spec.material && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Material</dt>
                      <dd className="font-medium text-brand-950">{spec.material}</dd>
                    </div>
                  )}
                  {spec.pullStrength && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Pull Strength</dt>
                      <dd className="font-medium text-brand-950">{spec.pullStrength}</dd>
                    </div>
                  )}
                  {spec.dimensions && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Dimensions</dt>
                      <dd className="font-medium text-brand-950 text-right">{spec.dimensions}</dd>
                    </div>
                  )}
                  {spec.securityLevel && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Security Level</dt>
                      <dd className="font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          spec.securityLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {spec.securityLevel}
                        </span>
                      </dd>
                    </div>
                  )}
                  {spec.boxSize && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Box Size</dt>
                      <dd className="font-medium text-brand-950">{spec.boxSize}</dd>
                    </div>
                  )}
                  {spec.boxWeight && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-500">Box Weight</dt>
                      <dd className="font-medium text-brand-950">{spec.boxWeight}</dd>
                    </div>
                  )}
                </dl>

                {spec.applications && spec.applications.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-brand-950 mb-2">Applications</h3>
                    <div className="flex flex-wrap gap-2">
                      {spec.applications.map((app) => (
                        <span key={app} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {spec.features && spec.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-brand-950 mb-2">Features</h3>
                    <ul className="space-y-2">
                      {spec.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-brand-600 mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {spec.printing && spec.printing.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-brand-950 mb-2">Printing Options</h3>
                    <ul className="space-y-2">
                      {spec.printing.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-brand-600 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;