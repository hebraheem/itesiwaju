"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter as userLocaleRouter } from "next/navigation";
import Image from "next/image";
import globe from "../../public/globe.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const supportedLanguages = ["en", "de", "yo", "fr"] as const;

const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const localeRouter = userLocaleRouter();
  const t = useTranslations("locale");

  const onChange = (value: "en" | "de" | "yo" | "fr") => {
    const segments = pathname.split("/");
    segments[1] = value; // replace locale
    localeRouter.push(segments.join("/"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Image
            src={globe}
            alt="globe"
            width={20}
            height={20}
            preload={true}
          />{" "}
          <p className="hidden md:block"> {t(locale)}</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => onChange(lang)}>
            {t(lang)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
