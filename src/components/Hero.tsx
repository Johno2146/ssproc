import React from 'react';
import Link from 'next/link';

interface HeroProps {
  onContactClick?: () => void;
  onBrowseClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onContactClick, onBrowseClick }) => {
  return (
    <div className="relative bg-brand-navy overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-brand-navy sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          {/* SVG mask to create the diagonal look on large screens */}
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-brand-navy transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Premium Security</span>
                <span className="block text-brand-blue">For Every Shipment</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                High-end security seal solutions for logistics and industrial sectors. Tamper-evident, reliable, and secure procurement. Providing the industry standard in cargo protection.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-opacity-90 md:py-4 md:text-lg md:px-10 transition-all"
                >
                  Browse Products
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="/assets/hero-banner.jpg"
          alt="Security Bolt Seal"
        />
      </div>
    </div>
  );
};

export default Hero;
