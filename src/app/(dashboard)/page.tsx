import Hero from "./components/Hero";
import Programs from "./components/Programs";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import StatsBar from "./components/StatsBar";
import CampusLife from "./components/CampusLife";
import Contact from "./components/Contact";
import BeyondAcademics from "./components/BeyondAcademics";
import WhyChooseUs from "./components/WhyChooseUs";
import Facilities from "./components/Facilities";
import ProgramDetails from "./components/ProgramDetails";
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar variant="light" />
      <Programs />
      <ProgramDetails />
      <BeyondAcademics />
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

