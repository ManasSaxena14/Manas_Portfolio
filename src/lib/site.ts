// The site's public origin, used for canonical URLs, the sitemap and share
// cards. Set NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel
// the production URL is picked up automatically.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "https://manas-saxena.vercel.app")
).replace(/\/$/, "");
