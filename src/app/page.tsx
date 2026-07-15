import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Differentiators from "@/components/sections/Differentiators";
import Services from "@/components/sections/Services";
import Gallery from "@/components/sections/Gallery";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";
import Location from "@/components/sections/Location";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Differentiators />
        <Services />
        <Gallery />
        <Process />
        <Testimonials />
        <CTA />
        <Location />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
