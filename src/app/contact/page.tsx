import Contact from '@/components/Contact';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({
  title: 'Contact Us — Sealed & Secured',
  description: 'Get in touch with the Sealed & Secured sales team for quotes, custom laser printing, bulk orders and security seal enquiries across South Africa.',
  path: '/contact',
});
export default function Page() { return <Contact />; }
