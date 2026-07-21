import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-base text-brand-500 font-semibold tracking-wide uppercase">Our Story</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            Providing the Industry Standard in Cargo Protection
          </p>
        </div>
        
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Sealed and Secured is a leading provider of premium security seal solutions in South Africa. We specialize in serving the logistics, shipping, retail distribution, and industrial sectors with high-quality, tamper-evident hardware.
              </p>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Our mission is to simplify the procurement of security hardware through a secure, high-end e-commerce platform. We understand the critical nature of cargo security and provide products that meet the highest international standards.
              </p>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Based in the industrial hubs of South Africa, we are committed to providing reliable service, real-time tracking, and secure payment options to our valued customers.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200 aspect-video">
              <img 
                src="/assets/about.jpg" 
                alt="About Sealed and Secured" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-2xl font-bold text-brand-950 text-center mb-12">Why Choose Sealed and Secured?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h4 className="text-xl font-bold text-brand-800 mb-4">Premium Quality</h4>
              <p className="text-gray-600">All our products are manufactured to rigorous specifications, ensuring maximum tamper resistance and reliability.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h4 className="text-xl font-bold text-brand-800 mb-4">Expertise</h4>
              <p className="text-gray-600">With years of experience in the security sensitive sectors, we provide tailored advice for your specific logistics needs.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h4 className="text-xl font-bold text-brand-800 mb-4">Innovation</h4>
              <p className="text-gray-600">From barcoded tracking to digital procurement, we leverage technology to streamline your ordering and enhance your supply chain experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
