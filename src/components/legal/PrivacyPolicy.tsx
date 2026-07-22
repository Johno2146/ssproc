import React from 'react';
import LegalLayout from './LegalLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">1. Who We Are</h2>
          <p className="mt-4">Sealed and Secured (Pty) Ltd (Registration No: 2024/182314/07) is responsible for the collection and processing of your personal information. We are committed to protecting your privacy in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA).</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">2. Information We Collect</h2>
          <p className="mt-4">We collect the following personal information when you create an account, place an order, or contact us:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li><strong>Identity information:</strong> Name, surname, company name.</li>
            <li><strong>Contact information:</strong> Email address, phone number, physical address.</li>
            <li><strong>Transaction information:</strong> Order history, payment details (processed securely by Payfast).</li>
            <li><strong>Voluntary information:</strong> Any additional information you provide to us.</li>
          </ul>
          <p className="mt-2 text-sm text-gray-500">Providing your personal information is voluntary, but required to place orders and use our services. If you do not provide the requested information, we may not be able to fulfil your order.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">3. Purpose of Processing</h2>
          <p className="mt-4">We process your personal information for the following purposes:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li>To process and fulfil your orders.</li>
            <li>To communicate with you about your orders via email or WhatsApp.</li>
            <li>To provide customer support and respond to inquiries.</li>
            <li>To improve our website, products, and services.</li>
            <li>To comply with legal and regulatory obligations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">4. Legal Basis for Processing</h2>
          <p className="mt-4">We process your personal information based on the following lawful grounds under POPIA:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li><strong>Consent:</strong> Where you have given us clear consent to process your data.</li>
            <li><strong>Contractual necessity:</strong> To perform our obligations under our agreement with you (e.g., fulfilling orders).</li>
            <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations.</li>
            <li><strong>Legitimate interest:</strong> To improve our services and prevent fraud.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">5. Information Sharing</h2>
          <p className="mt-4">We do not sell your personal information to third parties. We share your information with trusted third parties only as necessary to provide our services:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li><strong>Payfast</strong> (payment processing).</li>
            <li><strong>The Courier Guy</strong> and other shipping partners (order delivery).</li>
            <li><strong>WhatsApp</strong> (tracking notifications, if opted in).</li>
            <li><strong>SendGrid</strong> (transactional emails, including OTPs).</li>
          </ul>
          <p className="mt-2">Where we share your data with third parties, we have agreements in place to ensure they process your data in compliance with POPIA. Some of these third parties may be located outside South Africa.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">6. Cross-Border Data Transfers</h2>
          <p className="mt-4">Your personal information may be transferred to, and processed in, countries outside South Africa where our service providers are located (e.g., SendGrid in the United States). We ensure that adequate safeguards are in place and that the transfer complies with POPIA Section 72.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">7. Data Retention</h2>
          <p className="mt-4">We retain your personal information for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law. Order records are retained for a minimum of 5 years for tax and accounting purposes. Account information is retained until you request deletion.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">8. Data Security</h2>
          <p className="mt-4">We implement reasonable technical and organisational security measures to protect your personal information from unauthorised access, disclosure, alteration, or loss. These include encryption, access controls, and secure servers. However, no method of transmission over the internet is 100% secure.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">9. Your Rights Under POPIA</h2>
          <p className="mt-4">You have the following rights regarding your personal information:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li><strong>Right to access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Right to correction:</strong> Request that we correct any inaccurate or incomplete information.</li>
            <li><strong>Right to deletion:</strong> Request that we delete your personal information, subject to legal requirements.</li>
            <li><strong>Right to object:</strong> Object to the processing of your personal information for direct marketing purposes.</li>
            <li><strong>Right to withdraw consent:</strong> Withdraw your consent at any time, without affecting the lawfulness of processing before withdrawal.</li>
            <li><strong>Right to complain:</strong> Lodge a complaint with the Information Regulator of South Africa.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">10. Cookies</h2>
          <p className="mt-4">Our website uses essential cookies for session management and authentication. We also use the Google Maps API on our checkout page, which may set cookies. By using our website, you consent to the use of these cookies. You can disable cookies in your browser settings, but this may affect the functionality of our site.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">11. Complaints to the Information Regulator</h2>
          <p className="mt-4">If you are not satisfied with how we handle your personal information, you have the right to lodge a complaint with:</p>
          <p className="mt-2 text-sm">
            <strong>Information Regulator (South Africa)</strong><br />
            JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001<br />
            Email: complaints@inforegulator.org.za<br />
            Website: www.inforegulator.org.za
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">12. Contact Our Information Officer</h2>
          <p className="mt-4">If you have any questions, concerns, or requests regarding your personal information, please contact our Information Officer:</p>
          <p className="mt-2">
            Email: sales@ssproc.co.za<br />
            Phone: +27 10 555 0114<br />
            Address: Eastwood Business Park, 23 Wright Street, Nuffield, Springs, Gauteng
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;