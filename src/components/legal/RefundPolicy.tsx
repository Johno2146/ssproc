import React from 'react';
import LegalLayout from './LegalLayout';

const RefundPolicy: React.FC = () => {
  return (
    <LegalLayout title="Refund & Return Policy">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">1. Your Rights Under the Consumer Protection Act</h2>
          <p className="mt-4">Under section 56 of the Consumer Protection Act 68 of 2008, you have the right to return defective goods and receive a full refund, replacement, or repair within <strong>6 months</strong> of delivery, provided the goods are not damaged through misuse or normal wear and tear.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">2. Cooling-Off Period</h2>
          <p className="mt-4">Under section 44 of the Electronic Communications and Transactions Act, you may cancel any transaction within 7 days of receiving your order. However, due to the high-security, tamper-evident nature of our products, certain items are exempt from this right where they have been unsealed or tampered with.</p>
          <p className="mt-2">If you wish to cancel an order within 7 days for unopened, unused products, please contact us. A refund will be processed within 15 business days, less any direct delivery costs.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">3. Returns for Defects</h2>
          <p className="mt-4">If you receive a product that is defective, damaged, or does not match what you ordered, please notify us within <strong>7 days</strong> of delivery. You remain entitled to return defective goods within 6 months under the Consumer Protection Act, even if the 7-day notification period has passed.</p>
          <p className="mt-2">To initiate a return, contact our support team at sales@ssproc.co.za with your order number and photos of the defect.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">4. Refunds</h2>
          <p className="mt-4">Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed via the original method of payment within <strong>15 business days</strong> as required by the Consumer Protection Act.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">5. Custom Orders</h2>
          <p className="mt-4">Custom-branded or specifically numbered security seals are non-refundable unless there is a manufacturing defect, as these goods are personalised to your specifications and exempt from the cooling-off right under section 44(2)(b) of the ECTA.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">6. Shipping Costs</h2>
          <p className="mt-4">If the return is due to a defect or error on our part, we will refund the original shipping cost and cover the return shipping. If the return is for other reasons, you will be responsible for return shipping costs.</p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default RefundPolicy;