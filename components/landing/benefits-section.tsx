'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Wallet, Network, PartyPopper, HeartHandshake, GraduationCap, MessageSquare } from 'lucide-react';

export function BenefitsSection() {
  const t = useTranslations('home.benefits');

  const benefits = [
    { icon: Wallet, key: 'benefit1', color: 'from-orange-500 to-orange-600' },
    { icon: Network, key: 'benefit2', color: 'from-teal-500 to-teal-600' },
    { icon: PartyPopper, key: 'benefit3', color: 'from-purple-500 to-purple-600' },
    { icon: HeartHandshake, key: 'benefit4', color: 'from-pink-500 to-pink-600' },
    { icon: GraduationCap, key: 'benefit5', color: 'from-blue-500 to-blue-600' },
    { icon: MessageSquare, key: 'benefit6', color: 'from-green-500 to-green-600' },
  ];

  return (
    <section id="benefits" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h2>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.key}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full border-2 hover:border-orange-500 transition-all hover:shadow-2xl overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 mx-auto relative`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.div>

                  <div className="space-y-3">
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-teal-500 mx-auto rounded-full" />
                    <p className="text-lg leading-relaxed text-foreground">
                      {t(benefit.key)}
                    </p>
                  </div>

                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
