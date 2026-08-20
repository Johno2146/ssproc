import CheckoutPage from '@/components/CheckoutPage';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({
  title: 'Secure Checkout — Sealed & Secured',
  description: 'Complete your secure checkout for security seals and cable ties with Sealed & Secured. Pay safely with PayFast.',
  path: '/checkout',
  noindex: true,
});
export default function Page() { return <CheckoutPage />; }