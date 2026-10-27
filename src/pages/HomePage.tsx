import { ArtOfBatik } from '../components/home/ArtOfBatik';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { EditorialCampaign } from '../components/home/EditorialCampaign';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { Hero } from '../components/home/Hero';
import { NewArrivals } from '../components/home/NewArrivals';
import { WholesaleSection } from '../components/home/WholesaleSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <NewArrivals />
      <EditorialCampaign />
      <FeaturedCollections />
      <ArtOfBatik />
      <WholesaleSection />
    </>
  );
}
