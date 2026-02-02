'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, ArrowLeft, Edit, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function EventDetail({ eventId }: { eventId: string }) {
  const t = useTranslations('events');
  const router = useRouter();

  const event = {
    id: eventId,
    title: 'Monthly General Meeting',
    description: 'Join us for our monthly general meeting where we will discuss club matters, financial reports, and upcoming events. All members are encouraged to attend.',
    date: 'November 15, 2026',
    time: '2:00 PM - 5:00 PM',
    location: 'Community Hall Lagos',
    status: 'confirmed',
    type: 'meeting',
    attendees: 45,
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      toast.success('Event deleted successfully');
      router.push('/events');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{event.status}</Badge>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">Event Details</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-semibold">{event.attendees} members</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
