'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function Reports() {
  const t = useTranslations('reports');
  const [reportType, setReportType] = useState('financial');

  const reportTypes = [
    { value: 'financial', label: t('financial'), icon: DollarSign },
    { value: 'membership', label: t('membership'), icon: Users },
    { value: 'events', label: t('events'), icon: Calendar },
    { value: 'analytics', label: t('analytics'), icon: TrendingUp },
  ];

  const recentReports = [
    { name: 'October 2026 Financial Report', date: '2026-11-01', type: 'financial', size: '2.3 MB' },
    { name: 'Q3 2026 Membership Report', date: '2026-10-15', type: 'membership', size: '1.8 MB' },
    { name: 'Annual Events Summary 2026', date: '2026-10-01', type: 'events', size: '3.1 MB' },
  ];

  const handleDownload = (report: string) => {
    toast.success(`${t('downloading')} ${report}...`);
  };

  const handleGenerate = () => {
    toast.success(t('generateSuccess'));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </motion.div>

      {/* Report Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {reportTypes.map((type, i) => (
          <motion.div
            key={type.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setReportType(type.value)}>
              <CardContent className="p-4 md:p-6">
                <div className={`p-2 md:p-3 rounded-xl w-fit mb-2 md:mb-3 ${
                  reportType === type.value ? 'bg-orange-500' : 'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <type.icon className={`w-5 h-5 md:w-6 md:h-6 ${
                    reportType === type.value ? 'text-white' : 'text-orange-600'
                  }`} />
                </div>
                <p className="text-xs md:text-sm font-medium line-clamp-2">{type.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Generate Report */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t('generate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reportType')}</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('period')}</label>
                <Select defaultValue="current-month">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">{t('currentMonth')}</SelectItem>
                    <SelectItem value="last-month">{t('lastMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('quarter')}</SelectItem>
                    <SelectItem value="year">{t('year')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600" onClick={handleGenerate}>
              <FileText className="w-4 h-4 mr-2" />
              {t('generate')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Reports */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t('recent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base line-clamp-1">{report.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {report.date} • {report.size}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(report.name)} className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    {t('download')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
