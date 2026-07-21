import ShopPage from '@/components/ShopPage';

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { category } = await searchParams;
  return <ShopPage selectedCategory={category || 'all'} />;
}