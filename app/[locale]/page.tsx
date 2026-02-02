import { HeroSection } from "@/components/landing/hero-section";
import { AboutSection } from "@/components/landing/about-section";
import { RulesSection } from "@/components/landing/rules-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { JoinUsSection } from "@/components/landing/join-us-section";
import { Footer } from "@/components/landing/footer";
import NavBar from "@/components/common/NavBar";

export default async function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <RulesSection />
      <BenefitsSection />
      <JoinUsSection />
      <Footer />
    </main>
  );
}
