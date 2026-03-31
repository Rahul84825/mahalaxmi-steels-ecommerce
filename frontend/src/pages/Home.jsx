import Categories from "../components/Categories";
import FeaturedSection from "../components/FeaturedSection";
import Hero from "../components/Hero";
import RecentlyViewedSection from "../components/RecentlyViewedSection";

// onCartOpen is passed down from App.jsx via the <Route> in StorefrontLayout
const Home = ({ onCartOpen }) => {
  return (
    <main>
      <Hero onCartOpen={onCartOpen} />
      <Categories />
      <FeaturedSection />
      <RecentlyViewedSection />
    </main>
  );
};

export default Home;