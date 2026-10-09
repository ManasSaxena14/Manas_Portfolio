import Aura from "@/components/art/Aura";
import BidVerse from "@/components/art/BidVerse";
import FinSight from "@/components/art/FinSight";
import Pit24 from "@/components/art/Pit24";
import Rhomis from "@/components/art/Rhomis";

/**
 * Project previews, one art direction each so no two cards look alike:
 * Aura Roast is the real storefront on an espresso glow; FinSight is emerald
 * glass; RHoMIS is a paper data poster; BidVerse is a velvet auction stage;
 * PIT-24 is a blueprint. All live in components/art and scale with their box.
 */
export type ArtKind = "aura" | "finsight" | "rhomis" | "bidverse" | "pit24";

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
  }
}
