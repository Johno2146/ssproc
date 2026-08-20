import ShopPage from '@/components/ShopPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Shop Security Seals, Cable Ties & Tamper-Evident Products — Sealed & Secured',
  description:
    'Browse our full range of security seals, tamper-evident seals, cable ties, bolt seals and security bags. Buy online with tiered bulk pricing and fast SA delivery.',
  path: '/shop',
  keywords: ['buy security seals', 'cable ties', 'tamper evident', 'South Africa'],
});

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { category } = await searchParams;
  return <ShopPage selectedCategory={category || 'all'} />;
}