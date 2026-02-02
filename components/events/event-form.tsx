'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string(),
  time: z.string(),
  location: z.string().min(3, 'Location is required'),
  type: z.enum(['meeting', 'workshop', 'social', 'fundraiser']),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
});

type EventFormData = z.infer<typeof eventSchema>;

export function EventForm({ eventId }: { eventId?: string }) {
  const t = useTranslations('events.form');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventId ? {
      title: 'Monthly General Meeting',
      description: 'Join us for our monthly meeting',
      date: '2026-11-15',
      time: '14:00',
      location: 'Community Hall Lagos',
      type: 'meeting',
      status: 'confirmed',
    } : undefined,
  });

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(eventId ? 'Event updated successfully' : 'Event created successfully');
      router.push('/events');
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{eventId ? 'Edit Event' : 'Create Event'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{eventId ? 'Update event details' : 'Add new event'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')}</Label>
              <Input id="title" {...register('title')} className={errors.title ? 'border-red-500' : ''} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea id="description" {...register('description')} rows={4} className={errors.description ? 'border-red-500' : ''} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">{t('date')}</Label>
                <Input id="date" type="date" {...register('date')} className={errors.date ? 'border-red-500' : ''} />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">{t('time')}</Label>
                <Input id="time" type="time" {...register('time')} className={errors.time ? 'border-red-500' : ''} />
                {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('location')}</Label>
              <Input id="location" {...register('location')} className={errors.location ? 'border-red-500' : ''} />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">{t('type')}</Label>
                <Select onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Select onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{t('submit')}</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
