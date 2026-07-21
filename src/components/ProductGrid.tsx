import React from 'react';
import Link from 'next/link';

const categories = [
  {
    id: 1,
    name: 'Plastic Indicative Seals',
    href: '/auth/register',
    imageSrc: '/assets/suretite.jpg',
    imageAlt: 'Various colorful plastic security seals.',
    description: 'Versatile & Cost-effective indicative solutions.',
  },
  {
    id: 2,
    name: 'High-Security Cable Seals',
    href: '/shop',
    imageSrc: '/assets/cable-lock.jpg',
    imageAlt: 'Metallic cable seal with braided steel wire.',
    description: 'Adjustable & Heavy Duty protection.',
  },
  {
    id: 3,
    name: 'Container Bolt Seals',
    href: '/shop',
    imageSrc: '/assets/bolt-seal.jpg',
    imageAlt: 'High-security bolt seal for shipping containers.',
    description: 'High-security bolt seal for shipping containers.',
  },
];

const ProductGrid = () => {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-950">Popular Categories</h2>
            <p className="mt-4 text-lg text-gray-600">Discover our range of security solutions for every need.</p>
          </div>
          <Link href="/shop" className="hidden sm:block text-brand-600 font-bold hover:text-brand-700 transition-colors">
            View All Products →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <div className="w-full aspect-square bg-gray-200 overflow-hidden lg:aspect-none lg:h-80">
                <img
                  src={category.imageSrc}
                  alt={category.imageAlt}
                  className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-brand-950 mb-2">
                  <Link href={category.href}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {category.name}
                  </Link>
                </h3>
                <p className="text-gray-500">{category.description}</p>
                <div className="mt-6 flex items-center text-brand-600 font-semibold">
                  Browse Category
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/shop" className="sm:hidden block mt-10 text-center text-brand-600 font-bold hover:text-brand-700 transition-colors">
          View All Products →
        </Link>
      </div>
    </div>
  );
};

export default ProductGrid;
