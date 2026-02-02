import React from "react";
import NavBar from "@/components/common/NavBar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Rules = () => {
  const t = useTranslations("home.rules");
  return (
    <div>
      <NavBar />
      <section className="pt-(--header-h) px-9">
        <Link
          href="/"
          className="flex items-center cursor-pointer justify-start text-orange-600 font-medium mt-2 hover:underline py-9"
        >
          <ArrowLeft /> {t("backToHome")}
        </Link>
        Rules
      </section>
    </div>
  );
};
export default Rules;
