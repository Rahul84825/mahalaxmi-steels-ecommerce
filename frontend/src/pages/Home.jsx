import Categories from "../components/Categories";
import BrandsSection from "../components/BrandsSection";
import FeaturedSection from "../components/FeaturedSection";
import Hero from "../components/Hero";
import OurJourneySection from "../components/OurJourneySection";
import RecentlyViewedSection from "../components/RecentlyViewedSection";

const JOURNEY_IMAGES = [
  { src: "/journey/journey-1.jpg", alt: "Our store journey image 1" },
  { src: "/journey/journey-2.jpg", alt: "Our store journey image 2" },
  { src: "/journey/journey-3.jpg", alt: "Our store journey image 3" },
];

// onCartOpen is passed down from App.jsx via the <Route> in StorefrontLayout
const Home = ({ onCartOpen }) => {
  return (
    <main>
      <Hero onCartOpen={onCartOpen} />
      <Categories />
      <OurJourneySection images={JOURNEY_IMAGES} />
      <BrandsSection />
      <FeaturedSection />
      <RecentlyViewedSection />
    </main>
  );
};

export default Home;