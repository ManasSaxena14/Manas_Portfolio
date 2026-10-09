import type { MetadataRoute } from "next";
import { fullName, portfolio } from "@/data/portfolio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${fullName} — Portfolio`,
    short_name: fullName,
    description: portfolio.metaDescription,
    start_url: "/",
    display: "browser",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
