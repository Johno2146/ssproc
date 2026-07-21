'use client';

import React from 'react';

interface CategoryDropdownProps {
  categories: Record<string, { label: string; slugs: string[] }>;
  selectedCategory: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ categories, selectedCategory }) => {
  return (
    <div className="relative inline-block">
      <form method="GET" action="/shop">
        <select
          name="category"
          onChange={(e) => {
            const val = e.target.value;
            window.location.href = val === 'all' ? '/shop' : `/shop?category=${val}`;
          }}
          className="appearance-none bg-white border border-gray-200 text-brand-950 font-medium px-6 py-3 pr-12 rounded-xl shadow-sm hover:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-600 cursor-pointer text-lg"
          defaultValue={selectedCategory}
        >
          {Object.entries(categories).map(([key, cat]) => (
            <option key={key} value={key}>
              {cat.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </form>
    </div>
  );
};

export default CategoryDropdown;