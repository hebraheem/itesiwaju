import React from "react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

const NavBar = () => {
  const t = useTranslations("navbar");
  return (
    <nav
      className="w-full flex items-center justify-between h-(--header-h) b-[var(--header-h)] px-(--page-px) border-b fixed top-0 inset-x-0 z-50 backdrop-blur-md
        bg-white/60 dark:bg-black/40 border-white/30 dark:border-white/10 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl md:text-3xl font-bold">
          Itesiwaju
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="link" className="hidden sm:flex">
            {t("login")}
          </Button>
        </Link>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </nav>
  );
};
export default NavBar;
