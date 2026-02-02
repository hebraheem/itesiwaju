import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
          <FileQuestion className="w-10 h-10 text-orange-600" />
        </div>
        <div>
          <h1 className="text-6xl font-bold mb-2 text-orange-600">404</h1>
          <h2 className="text-2xl font-bold mb-2 text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('dashboardDescription')}
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/dashboard">{t('goToDashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}
