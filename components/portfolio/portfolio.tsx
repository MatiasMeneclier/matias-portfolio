"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { MotionPreferences } from "@/components/animations/reveal";
import { MotionConfig } from "motion/react";
import { str, visible, type Content } from "@/types/content";
import { SiteProvider, useSite } from "./site-preferences";
import { AdminContext, useAdminSession } from "./admin-access";
import Intro from "@/components/3d/intro";
import Navigation from "./navigation";
import FloatingMenu from "./floating-menu";
import Sections, { Hero } from "./sections";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrollControls } from "@/hooks/use-scroll-controls";
const Terminal = dynamic(() => import("./terminal"));
const AmbientBackground = dynamic(() => import("./ambient-background"), {
  ssr: false,
});
function PortfolioView({
  content: originalContent,
  connected = false,
  skipIntro = false,
  projectBase = "/projects",
}: {
  content: Content;
  connected?: boolean;
  skipIntro?: boolean;
  projectBase?: string;
}) {
  const { content, t } = useSite();
  const admin = useAdminSession();
  const [terminal, setTerminal] = useState(false),
    [sceneFailed, setSceneFailed] = useState(false);
  const s = content.site_settings[0],
    p = content.profiles[0];
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  void originalContent;
  const off = str(s, "animation_intensity") === "Off";
  const scrollControls = useScrollControls(reduced || off);
  const full =
    !sceneFailed &&
    !skipIntro &&
    s?.data.intro_enabled !== false &&
    !reduced &&
    !off;
  const navigation = (
    <Navigation
      scrollControls={scrollControls}
      items={visible(content.navigation_items)}
      onTerminal={() => setTerminal(true)}
      terminal={s?.data.terminal_enabled !== false}
    />
  );
  return (
    <MotionPreferences.Provider value={str(s, "animation_intensity")}>
      <MotionConfig reducedMotion={off ? "always" : "user"}>
        <AdminContext.Provider value={admin}>
          <div className={off ? "motion-off" : ""}>
            <a className="skip-link" href="#portfolio">
              {t("skip")}
            </a>
            {!skipIntro && (
              <Intro
                profile={p}
                settings={s}
                onFailure={() => setSceneFailed(true)}
              />
            )}
            <div
              id="portfolio"
              className={
                "portfolio has-ambient " + (full ? "portfolio-overlap" : "")
              }
            >
              <AmbientBackground fullIntro={full} />
              <main className="portfolio-main">
                <Hero profile={p} settings={s}>
                  {navigation}
                </Hero>
                <Sections
                  content={content}
                  connected={connected}
                  projectBase={projectBase}
                />
                <footer className="site-footer">
                  <a href="#portfolio" className="brand">
                    MM<span>/</span>
                  </a>
                  <span>{str(s, "footer")}</span>
                  <a href="#portfolio">{t("top")}</a>
                </footer>
              </main>
            </div>
            <FloatingMenu
              scrollControls={scrollControls}
              onTerminal={() => setTerminal(true)}
            />
            {terminal && (
              <Terminal
                onClose={() => setTerminal(false)}
                linkedin={str(p, "linkedin")}
              />
            )}
          </div>
        </AdminContext.Provider>
      </MotionConfig>
    </MotionPreferences.Provider>
  );
}

export default function Portfolio(props: Parameters<typeof PortfolioView>[0]) {
  return (
    <SiteProvider content={props.content}>
      <PortfolioView {...props} />
    </SiteProvider>
  );
}
