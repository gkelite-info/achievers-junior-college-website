import Hero from "./components/Hero";
import Programs from "./components/Programs";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import StatsBar from "./components/StatsBar";
import CampusLife from "./components/CampusLife";
import Contact from "./components/Contact";
import WhyChooseUs from "./components/WhyChooseUs";
import Facilities from "./components/Facilities";
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar variant="light" />
      <Programs />
      <WhyChooseUs />
      <About />
      <Testimonials />
      <StatsBar variant="dark" />
      <Facilities />
      <CampusLife />
      {/* <Contact /> */}
    </>
  );
}

