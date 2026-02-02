'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-orange-600">Itesiwaju</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Building progress together through community, culture, and collective prosperity.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-orange-500/10 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('about')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="text-muted-foreground hover:text-orange-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#rules" className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Rules
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-orange-600" />
                <span>info@itesiwaju.com</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-orange-600" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-orange-600 mt-1" />
                <span>Community Hall, Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t('copyright').replace('2026', String(currentYear))}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-orange-600 transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
