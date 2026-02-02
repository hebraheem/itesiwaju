import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle } from "lucide-react";
import MotionDiv from "@/components/animations/MotionDiv";
import MotionP from "@/components/animations/MotionP";
import MotionH2 from "@/components/animations/MotionH2";

export function JoinUsSection() {
  const t = useTranslations("home.joinUs");

  return (
    <section
      id="join-us"
      className="py-20 bg-linear-to-br from-orange-500 via-orange-600 to-teal-600 text-white relative overflow-hidden"
    >
      {/* Animated background elements */}
      <MotionDiv
        className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <MotionDiv
        className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <MotionH2
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("title")}
          </MotionH2>

          <MotionP
            className="text-xl md:text-2xl mb-4 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("subtitle")}
          </MotionP>

          <MotionP
            className="text-lg mb-12 opacity-90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {t("description")}
          </MotionP>

          {/* Trust indicators */}
          <MotionDiv
            className="flex flex-wrap justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {["activeMembers", "communityDriven", "secureAndTested"].map(
              (item, index) => (
                <MotionDiv
                  key={item}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {item === "activeMembers" ? "248+ " : ""} {t(item)}
                  </span>
                </MotionDiv>
              ),
            )}
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl font-bold"
            >
              <Link href="/register">
                {t("cta")} <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </MotionDiv>

          <MotionP
            className="mt-6 text-sm opacity-75"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.75 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            {t("alreadyMember")}{" "}
            <Link
              href="/login"
              className="underline font-semibold hover:opacity-80"
            >
              {t("loginHere")}
            </Link>
          </MotionP>
        </MotionDiv>
      </div>
    </section>
  );
}
