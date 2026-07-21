import React from 'react';
import Link from 'next/link';

const ServicesPage: React.FC = () => {
  const services = [
    {
      title: 'Procurement Outsourcing',
      subtitle: 'Strategic Sourcing & Supply Chain Management',
      image: '/assets/services-procurement.jpg',
      description: 'Streamline your procurement operations with our expert outsourcing solutions. We handle your entire sourcing lifecycle so you can focus on core business.',
      benefits: [
        'Cost reduction through strategic supplier negotiations and bulk purchasing',
        'Access to a vetted network of reliable local and international suppliers',
        'End-to-end procurement management from RFQ to delivery',
        'Real-time order tracking and inventory management',
        'Compliance and quality assurance on all sourced goods',
        'Flexible engagement models tailored to your business size',
      ],
      industries: ['Manufacturing', 'Logistics', 'Retail', 'Construction', 'Mining'],
    },
    {
      title: 'Payroll Outsourcing',
      subtitle: 'Accurate, Compliant & Timely Payroll Management',
      image: '/assets/services-payroll.jpg',
      description: 'Eliminate payroll errors and compliance risks. Our team manages your payroll end-to-end with full SARS and labour law compliance.',
      benefits: [
        'Accurate salary, wage and overtime calculations',
        'SARS PAYE, UIF, SDL and EMP501 submissions',
        'Leave management and employee self-service portals',
        'Annual tax reconciliation and IRP5 certificate generation',
        'Bank-integrated payroll payments via EFT or API',
        'Dedicated payroll consultant assigned to your business',
      ],
      industries: ['All Industries', 'SMEs', 'Corporate', 'NGOs', 'Hospitality'],
    },
    {
      title: 'Labour Hire',
      subtitle: 'Skilled Staffing Solutions On Demand',
      image: '/assets/services-labour.jpg',
      description: 'Access qualified, vetted labour on flexible terms. Whether you need temporary, seasonal, or permanent staff, we deliver the right people for the job.',
      benefits: [
        'Rigorous screening and vetting of all candidates',
        'Sector-specific skills matching for warehousing, logistics and industrial roles',
        'Flexible contracts — daily, weekly, monthly or permanent placement',
        'Full management of employee contracts, payroll and compliance',
        'Rapid deployment — staff placed within 48 hours',
        'Dedicated account manager for ongoing support',
      ],
      industries: ['Warehousing', 'Logistics', 'Manufacturing', 'Retail', 'Distribution'],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-950 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold mb-6">Our Services</h1>
          <p className="text-xl text-brand-200 max-w-3xl mx-auto leading-relaxed">
            Beyond security seals, Sealed and Secured delivers comprehensive business outsourcing solutions 
            to help South African businesses operate more efficiently and compliantly.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Left Panel - Image */}
                <div className="lg:col-span-2 bg-brand-600 relative overflow-hidden min-h-[300px]">
                  <img src={service.image} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-brand-950/60 flex flex-col justify-end p-10">
                    <h2 className="text-3xl font-bold text-white mb-2">{service.title}</h2>
                    <p className="text-brand-100 text-lg">{service.subtitle}</p>
                  </div>
                </div>

                {/* Right Panel - Details */}
                <div className="lg:col-span-3 p-10">
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">{service.description}</p>

                  <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">Key Benefits</h3>
                  <ul className="space-y-3 mb-8">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-brand-600 mt-1 flex-shrink-0">✓</span>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider self-center mr-2">Suitable for:</span>
                    {service.industries.map((ind, i) => (
                      <span key={i} className="px-4 py-1.5 bg-brand-50 text-brand-700 text-sm font-medium rounded-full">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Operations?</h2>
          <p className="text-brand-200 text-lg mb-10 max-w-2xl mx-auto">
            Get in touch with our team for a free consultation. We'll tailor a solution to your specific business needs.
          </p>
          <Link href="/contact" className="inline-block bg-white text-brand-950 px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg mr-4">
            Contact Us Today
          </Link>
          <Link href="/contact" className="inline-block bg-brand-blue text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-600 transition-all shadow-lg">
            Contact Sales
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;