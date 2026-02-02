import { Activity } from '@/components/activity/activity';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('activity');
  return {
    title: `${t('title')} | Itesiwaju`,
  };
}

export default function ActivityPage() {
  return <Activity />;
}
