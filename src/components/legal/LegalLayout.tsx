import React from 'react';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-brand-950 px-8 py-10">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-brand-200">Last Updated: July 17, 2026</p>
        </div>
        <div className="px-8 py-12 text-gray-700 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
