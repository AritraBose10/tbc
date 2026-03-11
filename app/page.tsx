import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OrnamentalSeparator from "@/components/OrnamentalSeparator";
import CategoryStyle from "@/components/CategoryStyle";
import FiltersRow from "@/components/FiltersRow";
import ChefSpecials from "@/components/ChefSpecials";
import BuildFeast from "@/components/BuildFeast";
import RoyalPicks from "@/components/RoyalPicks";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <main className="pb-36">
      <Header />
      <Hero />
      <OrnamentalSeparator />
      <CategoryStyle />
      <FiltersRow />
      <ChefSpecials />
      <BuildFeast />
      <RoyalPicks />
      <BottomNav />
    </main>
  );
}
