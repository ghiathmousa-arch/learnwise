import Hero from "@/components/sections/Hero";
import LessonsTeaser from "@/components/sections/LessonsTeaser";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <LessonsTeaser />
      <Services />
      <Stats />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
