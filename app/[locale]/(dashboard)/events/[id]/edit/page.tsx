import { EventForm } from '@/components/events/event-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Event | Itesiwaju',
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventForm eventId={id} />;
}
