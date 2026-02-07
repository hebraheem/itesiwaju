import { ActivityDetail } from '@/components/activity/activity-detail';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('activity');
  return {
    title: `${t('details')} | Itesiwaju`,
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActivityDetail activityId={id} />;
}
