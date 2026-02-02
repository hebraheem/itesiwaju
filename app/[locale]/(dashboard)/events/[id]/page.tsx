import { EventDetail } from '@/components/events/event-detail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details | Itesiwaju',
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetail eventId={id} />;
}
