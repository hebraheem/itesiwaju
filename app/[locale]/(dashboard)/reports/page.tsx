import { Reports } from '@/components/reports/reports';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reports');
  return {
    title: `${t('title')} | Itesiwaju`,
  };
}

export default function ReportsPage() {
  return <Reports />;
}
