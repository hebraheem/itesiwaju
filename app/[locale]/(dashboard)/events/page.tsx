import { EventsList } from '@/components/events/events-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Itesiwaju',
  description: 'Community events and calendar',
};

export default function EventsPage() {
  return <EventsList />;
}
