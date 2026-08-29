import Hero from "./components/Hero";
import Programs from "./components/Programs";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import StatsBar from "./components/StatsBar";
import CampusLife from "./components/CampusLife";
import Contact from "./components/Contact";
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar variant="light" />
      <Programs />
      <About />
      <Testimonials />
      <StatsBar variant="dark" />
      <CampusLife />
      <Contact />
    </>
  );
}
