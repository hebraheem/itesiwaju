'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  Plus,
  UserPlus,
  Wallet,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export function DashboardHome() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  const stats = [
    { 
      icon: Users, 
      label: t('stats.totalMembers'), 
      value: '248', 
      trend: '+3%',
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      icon: Calendar, 
      label: t('stats.eventsThisMonth'), 
      value: '12', 
      trend: '+2',
      color: 'from-orange-500 to-orange-600' 
    },
    { 
      icon: DollarSign, 
      label: t('stats.totalCollections'), 
      value: '₦2.4M', 
      trend: '+12%',
      color: 'from-green-500 to-green-600' 
    },
    { 
      icon: AlertCircle, 
      label: t('stats.pendingPayments'), 
      value: '18', 
      trend: '-5',
      color: 'from-red-500 to-red-600' 
    },
  ];

  const quickActions = [
    { 
      icon: Calendar, 
      label: t('quickActions.createEvent'), 
      href: '/events/create',
      color: 'bg-orange-500'
    },
    { 
      icon: UserPlus, 
      label: t('quickActions.addMember'), 
      href: '/members/create',
      color: 'bg-blue-500'
    },
    { 
      icon: Wallet, 
      label: t('quickActions.recordPayment'), 
      href: '/account-status',
      color: 'bg-green-500'
    },
    { 
      icon: FileText, 
      label: t('quickActions.viewReports'), 
      href: '/reports',
      color: 'bg-purple-500'
    },
  ];

  const upcomingEvents = [
    { 
      id: 1,
      date: '15',
      month: 'NOV',
      title: 'Monthly General Meeting',
      time: '2:00 PM - 5:00 PM',
      location: 'Community Hall Lagos',
      status: 'confirmed' 
    },
    { 
      id: 2,
      date: '22',
      month: 'NOV',
      title: 'Financial Workshop',
      time: '10:00 AM - 1:00 PM',
      location: 'Online (Zoom)',
      status: 'pending' 
    },
    { 
      id: 3,
      date: '30',
      month: 'NOV',
      title: 'Community Outreach Program',
      time: '8:00 AM - 4:00 PM',
      location: 'Ikeja District',
      status: 'confirmed' 
    },
  ];

  const recentActivity = [
    { user: 'Chioma Okoro', action: 'made a payment of ₦50,000', time: '3 hours ago', avatar: 'CO' },
    { user: 'Amina Bello', action: 'joined as new member', time: '3 hours ago', avatar: 'AB' },
    { user: 'Monthly Meeting', action: 'created by Adebayo', time: '5 hours ago', avatar: 'MM' },
    { user: 'Tunde Adeyemi', action: 'submitted monthly report', time: '1 day ago', avatar: 'TA' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          {t('welcome', { name: user?.firstName || 'Member' })}
        </h1>
        <p className="text-muted-foreground">{t('overview')}</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className={`text-sm mt-2 flex items-center gap-1 ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={action.href}>
                    <div className={`p-2 ${action.color} rounded-lg mr-3`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('upcomingEvents.title')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/events">{t('upcomingEvents.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-xl flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">{event.date}</div>
                      <div className="text-xs uppercase">{event.month}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.time}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('recentActivity.title')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/activity">{t('recentActivity.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-orange-600">
                      {activity.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Status Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('accountStatus.title')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account-status">{t('accountStatus.viewAll')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t('accountStatus.goodStanding')}</span>
                  <span className="text-sm font-bold text-green-600">186</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t('accountStatus.pendingPayments')}</span>
                  <span className="text-sm font-bold text-yellow-600">44</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t('accountStatus.overdue')}</span>
                  <span className="text-sm font-bold text-red-600">18</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '7%' }} />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('accountStatus.totalOutstanding')}</span>
                  <span className="text-2xl font-bold text-orange-600">₦246,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
