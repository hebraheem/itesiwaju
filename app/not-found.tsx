import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import '@/app/globals.css';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
              <FileQuestion className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h1 className="text-6xl font-bold mb-2 text-orange-600">404</h1>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you&#39;re looking for doesn&#39;t exist or has been
                moved.
              </p>
            </div>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
