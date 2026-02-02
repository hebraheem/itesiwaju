'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { useAuth } from '@/providers/auth-provider';

export function DashboardTopbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
