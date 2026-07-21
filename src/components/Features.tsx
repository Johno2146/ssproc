import React from 'react';
import { Lock, CreditCard } from 'lucide-react';

const features = [
  {
    name: 'Tamper Evident',
    description: 'Our seals are designed to show clear evidence of tampering, ensuring the integrity of your cargo at every stage of the journey.',
    icon: Lock,
  },
  {
    name: 'Secure Payments',
    description: 'Integrated Payfast payments for quick and secure transactions across South Africa, supporting multiple payment methods.',
    icon: CreditCard,
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-brand-blue font-semibold tracking-wide uppercase">Security First</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            A better way to secure your assets
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            We provide specialized security solutions tailored for the logistics and industrial sectors in South Africa.
          </p>
        </div>

        <div className="mt-16">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-brand-200 transition-all group">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-brand-blue text-white group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-bold text-brand-950">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;
