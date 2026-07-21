import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <ProductGrid />

      {/* Trust Section */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to secure your supply chain?
          </h2>
          <p className="text-xl text-brand-200 mb-10 max-w-2xl mx-auto">
            Join hundreds of logistics and industrial companies across South Africa trusting Sealed & Secured.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-brand-blue hover:bg-white hover:text-brand-navy text-white px-8 py-4 rounded-xl font-bold transition-all text-lg"
            >
              Get Started Now
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold transition-all text-lg"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Quick Links */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-950 mb-6">
              Get In Touch
            </h2>
            <p className="text-gray-600 mb-10">Our team is ready to assist you with your security requirements.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-brand-blue transition-colors">
                <div className="text-3xl mb-4">📞</div>
                <h3 className="font-bold text-brand-950 mb-2">Call Us</h3>
                <a
                  href="tel:+27105550114"
                  className="text-lg text-gray-700 hover:text-brand-600 font-medium"
                >
                  +27 10 555 0114
                </a>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-brand-blue transition-colors">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="font-bold text-brand-950 mb-2">WhatsApp</h3>
                <a
                  href="https://wa.me/27764256949"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-gray-700 hover:text-brand-600 font-medium"
                >
                  +27 76 425 6949
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
