import { ArrowUpRight, ChevronRight, CircleUserRound, Crosshair, Flame, ShieldCheck, Swords, Zap } from "lucide-react";
import { CASES } from "@/lib/data";
import { AuthPanel } from "@/components/AuthPanel";
import { CaseBrowser } from "@/components/CaseBrowser";

export default function Home() {
  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">D</span><span>DROP<span className="brand-accent">ZONE</span><small>OPEN YOUR NEXT</small></span></a>
      <nav><a href="#cases">Skrzynie</a><a href="#battles">Case Battle</a><a href="#how">Jak to działa</a></nav>
      <div className="top-actions"><span className="status"><i/> SYSTEM ONLINE</span><AuthPanel/><button className="avatar" aria-label="Profil"><CircleUserRound size={19}/></button></div>
    </header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> NEXT-GEN CASE OPENING</div>
        <h1>Nie czekaj na<br/><em>swój drop.</em></h1>
        <p>Wejdź do gry. Otwieraj skrzynie. Rzuć wyzwanie społeczności w Case Battle.</p>
        <div className="hero-actions"><a className="btn btn-primary" href="#cases">Odkryj skrzynie <ArrowUpRight size={17}/></a><a className="btn btn-ghost" href="#battles"><Swords size={17}/> Zobacz bitwy</a></div>
        <div className="hero-metrics"><div><b>06</b><span>UNIKALNYCH SKRZYŃ</span></div><div><b>LIVE</b><span>GOTOWI NA BITWĘ</span></div><div><b>∞</b><span>MOŻLIWOŚCI DROPÓW</span></div></div>
      </div>
      <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-glow"/><div className="floating-chip chip-top">DROP <b>#001</b></div><div className="hero-crate">⬡<span>📦</span></div><div className="floating-chip chip-bottom"><span className="rarity-dot"/> LEGENDARY FIND <b>+2,400</b></div><div className="hero-cross"><Crosshair size={25}/></div></div>
      <div className="hero-index">01 <span/> 03</div>
    </section>
    <section className="ticker"><span><Flame size={15}/> DROPZONE LIVE</span><i/> <b>OPEN CASES</b><i/> <b>BUILD YOUR INVENTORY</b><i/> <b>CHALLENGE THE LOBBY</b><i/> <b>PLAY SMART. PLAY FAIR.</b></section>
    <section id="cases" className="section">
      <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Wybierz swój <em>drop.</em></h2><p>Każda skrzynia to nowa szansa. Którą otworzysz jako pierwszą?</p></div><a className="text-link" href="#case-browser">ZOBACZ WSZYSTKIE <ChevronRight size={16}/></a></div>
      <CaseBrowser cases={CASES}/>
    </section>
    <section id="battles" className="battle-banner"><div className="battle-icon"><Swords size={35}/></div><div><div className="eyebrow">SQUAD UP</div><h2>Twoje skrzynie. <em>Twoja bitwa.</em></h2><p>Case Battle online jest kolejnym krokiem — dołącz do lobby i sprawdź, kto zgarnie lepszy drop.</p></div><a className="btn btn-primary" href="#how">Poznaj tryb <ArrowUpRight size={17}/></a></section>
    <section id="how" className="section how-section"><div className="section-heading"><div><div className="eyebrow">BUILT FOR THE COMMUNITY</div><h2>Prosto do <em>akcji.</em></h2></div></div><div className="feature-grid"><article><span>01</span><Zap/><h3>Wybierz skrzynię</h3><p>Sprawdź pulę dropów i zdecyduj, na co masz ochotę.</p></article><article><span>02</span><Crosshair/><h3>Otwórz i odkryj</h3><p>Animacja losowania pokazuje wynik otwarcia.</p></article><article><span>03</span><ShieldCheck/><h3>Buduj kolekcję</h3><p>Twoje konto i ekwipunek będą zapisane w bazie danych.</p></article></div></section>
    <footer><a className="brand" href="#"><span className="brand-mark">D</span><span>DROP<span className="brand-accent">ZONE</span><small>OPEN YOUR NEXT</small></span></a><span>WERSJA STARTOWA · WIRTUALNE PUNKTY · BEZ PŁATNOŚCI</span><span>© 2026 DROPZONE</span></footer>
  </main>;
}
