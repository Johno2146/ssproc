import React from 'react';
import LegalLayout from './LegalLayout';

const ShippingPolicy: React.FC = () => {
  return (
    <LegalLayout title="Shipping Policy">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">1. Delivery Scope</h2>
          <p className="mt-4">We ship to all major cities and regional areas within South Africa via our trusted logistics partners. For international shipping inquiries, please contact our sales team directly at sales@ssproc.co.za.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">2. Processing Time</h2>
          <p className="mt-4">Orders are typically processed within 1-2 business days after payment confirmation. Custom or bulk orders may require additional processing time, which will be communicated at the time of order.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">3. Shipping Rates</h2>
          <p className="mt-4">Shipping rates are calculated based on the weight, volume, and value of your order, as well as the delivery destination. The final shipping cost will be displayed at checkout before you confirm your payment.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">4. Risk of Loss</h2>
          <p className="mt-4">The risk of loss or damage to the products passes to you upon delivery. If your order is lost or damaged in transit, please contact us immediately so we can assist with a claim against the shipping partner.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">5. Tracking Your Order</h2>
          <p className="mt-4">Once your order has shipped, you will receive a tracking number via email. If you have opted in, you will also receive real-time updates via WhatsApp.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">6. Delivery Times</h2>
          <p className="mt-4">Standard delivery times range from 2-5 business days depending on your location. While we work with reliable shipping partners, we are not responsible for delays caused by circumstances beyond our control, including weather, labour disputes, or customs clearance.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">7. Collection</h2>
          <p className="mt-4">You may collect your order from our premises at Eastwood Business Park, 23 Wright Street, Nuffield, Springs, Gauteng, at no charge. Please contact us to arrange a collection time.</p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default ShippingPolicy;