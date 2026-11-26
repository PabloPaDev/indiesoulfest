"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroCollaborators } from "@/components/landing/hero-collaborators";
import { landingGames } from "../data/landingGames";
import { forPlayPretend } from "../lib/display-text";
import styles from "./IndieSoulLanding.module.css";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={direction === "left" ? "M19 12H5m7-7-7 7 7 7" : "M5 12h14m-7-7 7 7-7 7"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Esquinas del hueco blanco del LCD en handheld-side-open.png (% del ancho y alto del dibujo). */
const SCREEN_CORNERS = {
  tl: [22.636, 14.141],
  tr: [76.15, 10.242],
  br: [71.46, 89.968],
  bl: [17.59, 86.98],
} as const;

/** Proyecta el rectángulo de la pantalla (w×h) sobre el hueco del dibujo (w×h del contenedor). */
function screenMatrix(wrapW: number, wrapH: number, w: number, h: number) {
  const point = ([x, y]: readonly [number, number]) => [x / 100 * wrapW, y / 100 * wrapH];
  const [x0, y0] = point(SCREEN_CORNERS.tl);
  const [x1, y1] = point(SCREEN_CORNERS.tr).map((v, i) => v - (i ? y0 : x0));
  const [x2, y2] = point(SCREEN_CORNERS.br).map((v, i) => v - (i ? y0 : x0));
  const [x3, y3] = point(SCREEN_CORNERS.bl).map((v, i) => v - (i ? y0 : x0));
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = -x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = -y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const k = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 + g * x1, b = x3 + k * x3;
  const d = y1 + g * y1, e = y3 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, 0, 0, 0, 1].join(",")})`;
}

/** Dibujo de la consola. La pantalla HTML queda alineada con su abertura. */
function ConsoleBody() {
  return (
    <img src="/console/handheld-side-open.png" alt="" width={960} height={497} className={styles.consoleVector} />
  );
}

export default function IndieSoulLanding() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const enteringRef = useRef(false);
  const activeGame = landingGames[active];

  const advance = useCallback((delta: number) => {
    setActive((current) => (current + delta + landingGames.length) % landingGames.length);
  }, []);

  useEffect(() => {
    if (paused || entering || landingGames.length < 2) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") advance(1);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [paused, entering, advance]);

  // Precarga vecinos para que el carrusel no parpadee en negro.
  useEffect(() => {
    const indexes = [active, active + 1, active + 2, active - 1]
      .map((i) => (i + landingGames.length) % landingGames.length);
    const unique = [...new Set(indexes)];
    const links: HTMLLinkElement[] = [];
    for (const index of unique) {
      const game = landingGames[index];
      if (!game) continue;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = game.cover;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      for (const link of links) link.remove();
    };
  }, [active]);

  // La pantalla sigue la perspectiva del hueco. Se aplica antes del primer pintado
  // para que la imagen no salte al recargar.
  useLayoutEffect(() => {
    const wrap = consoleRef.current;
    const screen = screenRef.current;
    if (!wrap || !screen) return;
    const fit = () => {
      if (!wrap.offsetWidth || !screen.offsetWidth) return;
      screen.style.transform = screenMatrix(wrap.offsetWidth, wrap.offsetHeight, screen.offsetWidth, screen.offsetHeight);
      screen.classList.add(styles.screenReady);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    return () => {
      document.body.style.overflow = "";
      page?.style.removeProperty("transform");
      page?.style.removeProperty("transition");
      page?.style.removeProperty("transform-origin");
      enteringRef.current = false;
      setEntering(false);

      const veil = veilRef.current;
      veilRef.current = null;
      if (!veil) return;
      veil.style.transition = "opacity 600ms ease";
      requestAnimationFrame(() => requestAnimationFrame(() => { veil.style.opacity = "0"; }));
      window.setTimeout(() => veil.remove(), 700);
    };
  }, []);

  const enterFestival = () => {
    if (enteringRef.current) return;
    enteringRef.current = true;
    setEntering(true);

    const page = pageRef.current;
    const screen = screenRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !page || !screen) {
      router.push("/festival");
      return;
    }

    // La pantalla está recortada en trapecio: el margen extra evita que asomen bordes de la consola.
    const rect = screen.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.15;
    document.body.style.overflow = "hidden";
    page.style.transformOrigin = `${centerX - pageRect.left}px ${centerY - pageRect.top}px`;
    page.style.transition = "transform 1100ms cubic-bezier(.65,0,.18,1)";
    requestAnimationFrame(() => {
      page.style.transform = `translate(${window.innerWidth / 2 - centerX}px, ${window.innerHeight / 2 - centerY}px) scale(${scale})`;
    });

    // Vive fuera del árbol de React para seguir visible mientras se monta /festival.
    const veil = document.createElement("div");
    veil.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#f6f2e6;opacity:0;transition:opacity 300ms ease;pointer-events:none";
    document.body.appendChild(veil);
    veilRef.current = veil;
    window.setTimeout(() => { veil.style.opacity = "1"; }, 520);
    window.setTimeout(() => router.push("/festival"), 1100);
  };

  return (
    <div ref={pageRef} className={styles.page}>
      <header className={styles.header}>
        <div className={styles.organizers}>CARLOSEDIT.TV <span>/</span> PLAYNOTES</div>
        <div className={styles.headerLine} aria-hidden="true" />
        <div className={styles.date}>
          <svg className={styles.calendar} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          1 – 31 DE DICIEMBRE DE 2026
        </div>
      </header>

      <div className={styles.heroStage}>
        <main className={styles.main}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>
              <span>INDIE</span>
              <span>SOUL FEST</span>
            </h1>
            <span className={styles.stripes} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>

          <section className={styles.heroBody} aria-label="Bienvenida al festival">
            <div className={styles.intro}>
              <div className={styles.tagline}>Cada juego tiene un alma.<br />Detrás, personas.</div>
              <p className={styles.description}>Descubre y prueba videojuegos independientes seleccionados por nosotros.</p>
              <button className={styles.primaryButton} onClick={enterFestival} disabled={entering}>
                ENTRAR AL FESTIVAL <Arrow direction="right" />
              </button>
            </div>

            <div className={styles.consoleColumn}>
              <div
                ref={consoleRef}
                className={styles.consoleWrap}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
              >
                <ConsoleBody />
                <div className={styles.screen} ref={screenRef}>
                  {landingGames.map((game, index) => {
                    const isActive = index === active;
                    const prev = (active - 1 + landingGames.length) % landingGames.length;
                    const next = (active + 1) % landingGames.length;
                    const keepMounted = isActive || index === prev || index === next;
                    if (!keepMounted) return null;
                    const eager = isActive || index === 0 || index === prev || index === next;
                    return (
                      <div key={game.id} className={`${styles.slide} ${isActive ? styles.slideActive : ""}`} aria-hidden={!isActive}>
                        <img
                          src={game.cover}
                          alt=""
                          className={styles.capsule}
                          style={{ objectPosition: game.coverPosition }}
                          width={616}
                          height={353}
                          loading={eager ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={isActive || index === 0 ? "high" : "auto"}
                        />
                      </div>
                    );
                  })}
                  <div className={styles.screenGradient} aria-hidden="true" />
                  <div className={styles.gameCaption}>
                    <div className={styles.gameTitle} aria-label={activeGame.title}>{forPlayPretend(activeGame.title)}</div>
                    <div className={styles.gameMeta}>
                      <span className={styles.gameStudio}>{activeGame.studio}</span>
                      {activeGame.demo ? <span className={styles.demoLabel}>DEMO</span> : null}
                    </div>
                  </div>
                </div>
                {landingGames.length > 1 && <>
                  <button aria-label="Juego anterior" className={`${styles.carouselButton} ${styles.carouselPrev}`} onClick={() => advance(-1)}><Arrow direction="left" /></button>
                  <button aria-label="Siguiente juego" className={`${styles.carouselButton} ${styles.carouselNext}`} onClick={() => advance(1)}><Arrow direction="right" /></button>
                </>}
              </div>
            </div>

            <div className={styles.closing}>
              <aside className={styles.playnocito} aria-label="Mensaje de Playnocito">
                <div className={styles.speechBubble}>
                  <p className={`${styles.speechText} ${styles.speechDesktop}`}>
                    ¡Hola! Soy Playnocito. Dentro del festival puedes apuntar lo que te guste
                    y llevarte ese registro a{" "}
                    <a
                      href="https://www.playnotes.es"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.speechLink}
                    >
                      playnotes.es
                    </a>
                    .
                  </p>
                  <p className={`${styles.speechText} ${styles.speechMobile}`}>
                    Guarda lo que te guste y llévatelo a{" "}
                    <a
                      href="https://www.playnotes.es"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.speechLink}
                    >
                      playnotes.es
                    </a>
                    .
                  </p>
                </div>
                <div className={styles.playnocitoFigure}>
                  <img
                    className={styles.playnocitoImg}
                    src="/mascots/playnocito.png"
                    alt="Playnocito, mascota de PlayNotes"
                    width={220}
                    height={220}
                    decoding="async"
                  />
                  <span className={styles.playnocitoName}>Playnocito</span>
                </div>
              </aside>
              <footer className={styles.footer}>
                <HeroCollaborators gamesCount={landingGames.length} />
              </footer>
            </div>
          </section>
        </main>
      </div>

      <a href="#behind-title" className={styles.scrollCue}>
        <span className={styles.scrollCueLabel}>DESCUBRE QUIÉN Y POR QUÉ SE HACE</span>
        <span className={styles.scrollCueMark} aria-hidden="true" />
      </a>
    </div>
  );
}
