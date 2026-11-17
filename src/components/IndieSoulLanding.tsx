"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

/** Dibujo de la consola. La pantalla HTML queda alineada con su abertura. */
function ConsoleBody() {
  return (
    <img src="/console/handheld-side.png" alt="" className={styles.consoleVector} />
  );
}

export default function IndieSoulLanding() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
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
    window.setTimeout(() => { veil.style.opacity = "1"; }, 800);
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
                className={styles.consoleWrap}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
              >
                <ConsoleBody />
                <div className={styles.screen} ref={screenRef}>
                  {landingGames.map((game, index) => (
                    <div key={game.id} className={`${styles.slide} ${index === active ? styles.slideActive : ""}`} aria-hidden={index !== active}>
                      <Image src={game.image} alt="" fill sizes="(max-width: 760px) 80vw, 48vw" priority={index === 0} className={styles.artwork} />
                    </div>
                  ))}
                  <div className={styles.screenGradient} aria-hidden="true" />
                  <div className={styles.gameCaption}>
                    <div className={styles.gameTitle} aria-label={activeGame.title}>{forPlayPretend(activeGame.title)}</div>
                    <div className={styles.gameMeta}>
                      <span className={styles.gameStudio}>{activeGame.studio}</span>
                      {activeGame.demo && <span className={styles.demoLabel}>DEMO</span>}
                    </div>
                  </div>
                </div>
                {landingGames.length > 1 && <>
                  <button aria-label="Juego anterior" className={`${styles.carouselButton} ${styles.carouselPrev}`} onClick={() => advance(-1)}><Arrow direction="left" /></button>
                  <button aria-label="Siguiente juego" className={`${styles.carouselButton} ${styles.carouselNext}`} onClick={() => advance(1)}><Arrow direction="right" /></button>
                  <div className={styles.dots} aria-label="Juegos del carrusel">
                    {landingGames.map((game, i) => (
                      <button key={game.id} className={`${styles.dot} ${i === active ? styles.dotActive : ""}`} aria-label={`Mostrar ${game.title}`} aria-current={i === active ? "true" : undefined} onClick={() => setActive(i)} />
                    ))}
                  </div>
                </>}
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>DEMOS DE MÁS DE 25 ESTUDIOS <span className={styles.footerSlash}>/</span> SIN IA GENERATIVA</span>
          <span className={styles.footerSponsor}>
            <span className={styles.footerDivider} aria-hidden="true" />
            <span>PATROCINADO POR: <strong>GAMES 4 PLAYERS</strong></span>
          </span>
        </footer>
      </div>

      <a href="#behind-title" className={styles.scrollCue}>
        <span className={styles.scrollCueLabel}>DESCUBRE QUIÉN Y POR QUÉ SE HACE</span>
        <span className={styles.scrollCueMark} aria-hidden="true" />
      </a>
    </div>
  );
}
