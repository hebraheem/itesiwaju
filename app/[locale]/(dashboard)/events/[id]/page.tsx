import { EventDetail } from '@/components/events/event-detail';
import { Metadata } from 'next';
import { Id } from '@/convex/_generated/dataModel';

export const metadata: Metadata = {
  title: 'Event Details | Itesiwaju',
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetail eventId={id as Id<"events">} />;
}
