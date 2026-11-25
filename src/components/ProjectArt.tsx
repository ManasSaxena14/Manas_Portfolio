import Aura from "@/components/art/Aura";
import BidVerse from "@/components/art/BidVerse";
import FinSight from "@/components/art/FinSight";
import Fraud from "@/components/art/Fraud";
import HireFlow from "@/components/art/HireFlow";
import Orbyt from "@/components/art/Orbyt";
import Pit24 from "@/components/art/Pit24";
import ResolveIQ from "@/components/art/ResolveIQ";
import Rhomis from "@/components/art/Rhomis";
import MetroFlow from "@/components/art/MetroFlow";
import Zomato from "@/components/art/Zomato";

/**
 * Project previews, one art direction each so no two cards look alike:
 * Aura Roast is its real storefront on an espresso glow; HireFlow its real app
 * on warm linen; BidVerse a velvet auction stage; Orbyt a planet in deep
 * space; ResolveIQ a glass prism splitting one ticket into three answers;
 * MetroFlow a long-exposure freeway at night; FinSight an engraved emerald
 * banknote; Fraud a noir card under a scan; RHoMIS a paper data poster; the
 * Zomato study a tomato-red magazine cover; PIT-24 a blueprint. All live in
 * components/art and scale with their box.
 */
export type ArtKind = "aura" | "finsight" | "rhomis" | "bidverse" | "pit24" | "orbyt" | "hireflow" | "resolveiq" | "metroflow" | "fraud" | "zomato";

export default function ProjectArt({ kind, url }: { kind: ArtKind; url: string }) {
  switch (kind) {
    case "aura":
      return <Aura url={url} />;
    case "finsight":
      return <FinSight />;
    case "rhomis":
      return <Rhomis />;
    case "bidverse":
      return <BidVerse />;
    case "pit24":
      return <Pit24 />;
    case "orbyt":
      return <Orbyt />;
    case "hireflow":
      return <HireFlow url={url} />;
    case "resolveiq":
      return <ResolveIQ />;
    case "metroflow":
      return <MetroFlow />;
    case "fraud":
      return <Fraud />;
    case "zomato":
      return <Zomato />;
  }
}
