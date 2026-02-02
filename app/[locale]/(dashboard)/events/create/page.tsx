import { EventForm } from '@/components/events/event-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Event | Itesiwaju',
};

export default function CreateEventPage() {
  return <EventForm />;
}
