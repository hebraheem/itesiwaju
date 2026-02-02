import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["yo", "en", "fr", "de"],

  // Used when no locale matches
  defaultLocale: "yo",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
