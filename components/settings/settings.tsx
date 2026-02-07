'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Moon, Sun, Globe, Bell } from 'lucide-react';

export function Settings() {
  const t = useTranslations('settings');
  const tl = useTranslations('locale');

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </motion.div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="w-5 h-5" />{t('appearance')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>{t('darkMode')}</Label><p className="text-sm text-muted-foreground">{t('darkModeDesc')}</p></div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />{t('language')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('preferredLanguage')}</Label>
              <Select defaultValue="en">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yo">{tl('yo')}</SelectItem>
                  <SelectItem value="en">{tl('en')}</SelectItem>
                  <SelectItem value="fr">{tl('fr')}</SelectItem>
                  <SelectItem value="de">{tl('de')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />{t('notifications')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>{t('emailNotifications')}</Label><p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>{t('eventReminders')}</Label><p className="text-sm text-muted-foreground">{t('eventRemindersDesc')}</p></div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success(t('saveSuccess'))}>{t('save')}</Button>
      </div>
    </div>
  );
}
