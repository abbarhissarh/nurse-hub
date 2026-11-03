import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/library", "/orders", "/cart", "/checkout", "/login", "/register"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
