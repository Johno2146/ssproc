import React from 'react';
import LegalLayout from './LegalLayout';

const CookiePolicy: React.FC = () => {
  return (
    <LegalLayout title="Cookie Policy">
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">1. What Are Cookies?</h2>
          <p className="mt-4">Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They help the website recognise your device and remember information about your visit, such as your preferences.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">2. How We Use Cookies</h2>
          <p className="mt-4">We use cookies for the following purposes:</p>
          <ul className="mt-4 list-disc list-inside space-y-2">
            <li><strong>Essential / session cookies:</strong> Required for the website to function properly, including session management and authentication (for example, keeping you signed in to your account and remembering the contents of your cart). These cookies do not collect personal information for marketing purposes.</li>
            <li><strong>Functional cookies:</strong> Used to remember your preferences, such as your cookie consent choice.</li>
            <li><strong>Third-party cookies:</strong> The Google Maps service on our checkout page may set cookies to enable map functionality and remember your preferences. Google's use of cookies is governed by Google's own privacy policy.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">3. Consent Banner</h2>
          <p className="mt-4">When you first visit our website, a consent banner is displayed explaining our use of cookies. By clicking "Accept" or by continuing to use our website, you consent to the use of cookies described in this policy. Your consent choice is stored on your device so the banner is not shown on every visit.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">4. Managing and Disabling Cookies</h2>
          <p className="mt-4">You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies, and to set preferences for specific websites. Please note that if you disable essential cookies, some functionality of our website (such as logging in or completing a purchase) may not work correctly.</p>
          <p className="mt-4">For guidance on managing cookies in your browser, you can use the help menu in your browser or visit the browser provider's support website.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">5. Changes to This Policy</h2>
          <p className="mt-4">We may update this Cookie Policy from time to time to reflect changes in our practices or applicable law. Any changes will be posted on this page, and where appropriate, notified to you.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">6. Contact Us</h2>
          <p className="mt-4">If you have any questions about this Cookie Policy or our use of cookies, please contact our Information Officer:</p>
          <p className="mt-2">
            Sealed and Secured (Pty) Ltd<br />
            Email: sales@ssproc.co.za<br />
            Phone: +27 10 555 0114<br />
            Address: Eastwood Business Park, 23 Wright Street, Nuffield, Springs, Gauteng
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;