import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ExampleSolutionsSection from "@/components/home/ExampleSolutionsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AboutSection from "@/components/home/AboutSection";
import BlogSection from "@/components/home/BlogSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <ExampleSolutionsSection />
        <TestimonialsSection />
        <AboutSection />
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
