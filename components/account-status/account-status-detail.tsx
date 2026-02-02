'use client';

import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Wallet, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function AccountStatusDetail({ memberId }: { memberId: string }) {
  const router = useRouter();
  const account = {
    name: 'Chioma Okoro',
    borrowed: 50000,
    paid: 35000,
    remaining: 15000,
    fine: 0,
    dueDate: 'December 1, 2026',
    status: 'owing',
    payments: [
      { date: '2026-10-01', amount: 20000, method: 'Bank Transfer' },
      { date: '2026-10-15', amount: 15000, method: 'Cash' },
    ],
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                {account.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{account.name}</h1>
              <Badge variant="secondary" className="mt-2">{account.status}</Badge>
            </div>
          </div>
          <Button className="bg-green-500 hover:bg-green-600" onClick={() => toast.success('Payment recorded')}>
            Record Payment
          </Button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Wallet, label: 'Borrowed', value: `₦${account.borrowed.toLocaleString()}`, color: 'bg-blue-500' },
          { icon: CheckCircle, label: 'Paid', value: `₦${account.paid.toLocaleString()}`, color: 'bg-green-500' },
          { icon: AlertCircle, label: 'Remaining', value: `₦${account.remaining.toLocaleString()}`, color: 'bg-orange-500' },
          { icon: Calendar, label: 'Due Date', value: account.dueDate.split(',')[0], color: 'bg-purple-500' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className={`p-3 ${stat.color} rounded-xl w-fit mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {account.payments.map((payment, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{payment.method}</p>
                </div>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
