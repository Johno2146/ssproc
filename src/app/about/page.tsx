import About from '@/components/About';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({
  title: 'About Us — Sealed & Secured',
  description: 'Learn about Sealed & Secured — South Africa\'s trusted provider of premium security seals, tamper-evident solutions and cable ties for logistics and industrial clients.',
  path: '/about',
});
export default function Page() { return <About />; }
