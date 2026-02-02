import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  DollarSign,
  Users,
  Shield,
  Lock,
  HandshakeIcon,
  ArrowRight,
} from "lucide-react";
import MotionDiv from "@/components/animations/MotionDiv";
import Link from "next/link";

export function RulesSection() {
  const t = useTranslations("home.rules");

  const rules = [
    { icon: Calendar, key: "rule1" },
    { icon: DollarSign, key: "rule2" },
    { icon: Users, key: "rule3" },
    { icon: HandshakeIcon, key: "rule4" },
    { icon: Lock, key: "rule5" },
    { icon: Shield, key: "rule6" },
  ];

  return (
    <section id="rules" className="py-20 bg-muted/50">
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
              href="/rules"
              className="flex items-center cursor-pointer justify-center text-orange-600 font-medium mt-2 hover:underline"
            >
              {t("allRules")} <ArrowRight />
            </Link>
          </div>
        </MotionDiv>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule, index) => (
            <MotionDiv
              key={rule.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <MotionDiv
                    className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <rule.icon className="w-6 h-6 text-white" />
                  </MotionDiv>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-orange-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {t(rule.key)}
                  </p>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
