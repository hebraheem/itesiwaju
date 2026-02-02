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

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </motion.div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="w-5 h-5" />Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Dark Mode</Label><p className="text-sm text-muted-foreground">Toggle dark mode theme</p></div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Language</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preferred Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yo">Yoruba</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Email Notifications</Label><p className="text-sm text-muted-foreground">Receive email updates</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Event Reminders</Label><p className="text-sm text-muted-foreground">Get reminded about events</p></div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success('Settings saved')}>Save Changes</Button>
      </div>
    </div>
  );
}
