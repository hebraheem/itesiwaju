'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, UserPlus, FileText, Users, Clock } from 'lucide-react';

export function Activity() {
  const t = useTranslations('activity');

  const activities = [
    { id: 1, user: 'Chioma Okoro', avatar: 'CO', action: t('madePayment'), detail: '₦50,000', time: '3 hours ago', type: 'payment', icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { id: 2, user: 'Amina Bello', avatar: 'AB', action: t('joinedMember'), detail: 'Member ID: #248', time: '3 hours ago', type: 'member', icon: UserPlus, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { id: 3, user: 'Adebayo Okon', avatar: 'AO', action: t('createdEvent'), detail: 'Monthly Meeting', time: '5 hours ago', type: 'event', icon: Calendar, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { id: 4, user: 'Tunde Adeyemi', avatar: 'TA', action: t('submittedReport'), detail: 'Monthly Report', time: '1 day ago', type: 'report', icon: FileText, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { id: 5, user: 'Funke Olawale', avatar: 'FO', action: t('updatedProfile'), detail: 'Contact information', time: '1 day ago', type: 'profile', icon: Users, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
    { id: 6, user: 'Ibrahim Musa', avatar: 'IM', action: t('madePayment'), detail: '₦30,000', time: '2 days ago', type: 'payment', icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { id: 7, user: 'Ngozi Eze', avatar: 'NE', action: t('joinedMember'), detail: 'Member ID: #247', time: '2 days ago', type: 'member', icon: UserPlus, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { id: 8, user: 'Yusuf Ahmed', avatar: 'YA', action: t('createdEvent'), detail: 'Financial Workshop', time: '3 days ago', type: 'event', icon: Calendar, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  ];

  const filterByType = (type: string) => {
    if (type === 'all') return activities;
    return activities.filter(a => a.type === type);
  };

  const getTabLabel = (type: string) => {
    switch(type) {
      case 'all': return t('all');
      case 'payment': return t('payment');
      case 'member': return t('member');
      case 'event': return t('event');
      case 'report': return t('report');
      case 'profile': return t('profile');
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </motion.div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          {['all', 'payment', 'member', 'event', 'report', 'profile'].map((type) => (
            <TabsTrigger key={type} value={type} className="text-xs md:text-sm">
              {getTabLabel(type)}
            </TabsTrigger>
          ))}
        </TabsList>

        {['all', 'payment', 'member', 'event', 'report', 'profile'].map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {getTabLabel(type)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterByType(type).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-orange-500 text-white font-semibold text-xs md:text-sm">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="text-sm md:text-base">
                              <span className="font-semibold">{activity.user}</span>{' '}
                              <span className="text-muted-foreground">{activity.action}</span>
                            </p>
                            <p className="text-xs md:text-sm font-medium text-muted-foreground mt-1 truncate">
                              {activity.detail}
                            </p>
                          </div>
                          <Badge variant="outline" className={`${activity.color} border-0 flex-shrink-0`}>
                            <activity.icon className="w-3 h-3 mr-1" />
                            {activity.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
