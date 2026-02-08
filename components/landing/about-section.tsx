import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Users, TrendingUp } from "lucide-react";
import MotionDiv from "@/components/animations/MotionDiv";
import Image from "next/image";
import group from "@/public/images/members01.jpeg";

export function AboutSection() {
  const t = useTranslations("home.about");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h2>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <MotionDiv
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative h-100 rounded-2xl bg-linear-to-br from-orange-100 to-teal-100 dark:from-orange-900/20 dark:to-teal-900/20 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={group}
                  alt="group-member"
                  fill
                  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed">{t("description")}</p>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {t("visionTitle")}
                      </h3>
                      <p className="text-muted-foreground">{t("vision")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <Heart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {t("missionTitle")}
                      </h3>
                      <p className="text-muted-foreground">{t("mission")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MotionDiv>
        </div>

        {/* Stats */}
        <MotionDiv
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Users, value: "248+", label: "Members" },
            { icon: TrendingUp, value: "5+", label: "Years" },
            { icon: Target, value: "100+", label: "Events" },
            { icon: Heart, value: "₦2.4M", label: "Collected" },
          ].map((stat, index) => (
            <MotionDiv key={index} variants={item}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {t(stat.label.toLowerCase())}
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
}
