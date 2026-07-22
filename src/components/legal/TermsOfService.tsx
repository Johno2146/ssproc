import React from 'react';
import LegalLayout from './LegalLayout';

const TermsOfService: React.FC = () => {
  return (
    <LegalLayout title="Terms of Service">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">1. About Us</h2>
          <p className="mt-4">Sealed and Secured (Pty) Ltd (Registration No: 2024/182314/07) is a South African company with its registered office at Eastwood Business Park, 23 Wright Street, Nuffield, Springs, Gauteng. These terms govern your use of our website and the purchase of our products.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">2. Acceptance of Terms</h2>
          <p className="mt-4">By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations of the Republic of South Africa, including the Consumer Protection Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, and the Protection of Personal Information Act 4 of 2013.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">3. Product Orders</h2>
          <p className="mt-4">All orders placed through the website are subject to availability and acceptance. We reserve the right to refuse or cancel any order for any reason. A contract is only concluded when we accept your order and confirm it via email.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">4. Pricing and Payment</h2>
          <p className="mt-4">Prices for our products are subject to change without notice. All prices displayed include VAT where applicable. Payment is required at the time of purchase through our integrated payment gateway. You are not obligated to pay for unauthorised transactions.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">5. Cooling-Off Right (ECTA Section 44)</h2>
          <p className="mt-4">Under section 44 of the Electronic Communications and Transactions Act, you have the right to cancel any transaction within 7 days without giving a reason and without penalty. However, this right does not apply to goods that:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Cannot be returned due to their nature (including tamper-evident security seals);</li>
            <li>Have been customised or personalised to your specifications;</li>
            <li>Have been unsealed after delivery and cannot be returned for health or hygiene reasons.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">6. Limitation of Liability</h2>
          <p className="mt-4">To the extent permitted by South African law, Sealed and Secured (Pty) Ltd shall not be liable for any indirect or consequential damages arising out of the use or inability to use our products. Nothing in these terms limits your rights under the Consumer Protection Act.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">7. Consumer Rights</h2>
          <p className="mt-4">Nothing in these terms is intended to limit any rights you have under the Consumer Protection Act 68 of 2008, including your right to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Return defective goods within 6 months of delivery;</li>
            <li>Receive goods that are of good quality, safe, and fit for purpose;</li>
            <li>Cancel advance bookings, reservations, or orders within the prescribed cooling-off period.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">8. Governing Law</h2>
          <p className="mt-4">These terms and conditions are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes shall be resolved through negotiation, mediation, or, if necessary, in a South African court of competent jurisdiction.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">9. Contact Us</h2>
          <p className="mt-4">For any questions about these terms, please contact us at sales@ssproc.co.za or call +27 10 555 0114.</p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default TermsOfService;