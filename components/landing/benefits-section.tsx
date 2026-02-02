import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  Network,
  PartyPopper,
  HeartHandshake,
  GraduationCap,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import MotionDiv from "@/components/animations/MotionDiv";
import Link from "next/link";

export function BenefitsSection() {
  const t = useTranslations("home.benefits");

  const benefits = [
    { icon: Wallet, key: "benefit1", color: "from-orange-500 to-orange-600" },
    { icon: Network, key: "benefit2", color: "from-teal-500 to-teal-600" },
    {
      icon: PartyPopper,
      key: "benefit3",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: HeartHandshake,
      key: "benefit4",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: GraduationCap,
      key: "benefit5",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MessageSquare,
      key: "benefit6",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h2>

          <div className="">
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
            <Link
              href="/benefits"
              className="flex items-center cursor-pointer justify-center text-orange-600 font-medium mt-2 hover:underline"
            >
              {t("allBenefits")} <ArrowRight />
            </Link>
          </div>
        </MotionDiv>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <MotionDiv
              key={benefit.key}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="h-full border-2 hover:border-orange-500 transition-all hover:shadow-2xl overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <MotionDiv
                    className={`w-16 h-16 bg-linear-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 mx-auto relative`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                    <MotionDiv
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  </MotionDiv>

                  <div className="space-y-3">
                    <div className="w-12 h-1 bg-linear-to-r from-orange-500 to-teal-500 mx-auto rounded-full" />
                    <p className="text-lg leading-relaxed text-foreground">
                      {t(benefit.key)}
                    </p>
                  </div>

                  {/* Animated background */}
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
