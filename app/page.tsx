import type { Metadata } from "next";
import { getContent } from "@/services/content";
import { str, list } from "@/types/content";
import Portfolio from "@/components/portfolio/portfolio";
import { getContactEmailConfig } from "@/lib/contact-email";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const seo = content.seo_settings[0];
  const title = str(seo, "title"),
    description = str(seo, "description"),
    image = str(seo, "og_image");
  return {
    title,
    description,
    keywords: list(seo, "keywords"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_AR",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    icons: { icon: str(seo, "favicon") || "/favicon.svg" },
  };
}
export default async function Home() {
  return (
    <Portfolio
      content={await getContent()}
      connected={Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        getContactEmailConfig(),
      )}
    />
  );
}
