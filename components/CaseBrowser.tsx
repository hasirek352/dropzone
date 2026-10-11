"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import type { CaseItem, Drop } from "@/lib/data";

function weightedDrop(drops: Drop[]) {
  // Demo odds. Move odds and opening into a PostgreSQL RPC before production.
  const roll = Math.random();
  const rarity = roll < .025 ? "legendary" : roll < .13 ? "epic" : roll < .43 ? "rare" : "common";
  const candidates = drops.filter(d => d.rarity === rarity);
  return (candidates.length ? candidates : drops)[Math.floor(Math.random() * (candidates.length || drops.length))];
}

export function CaseBrowser({ cases }: { cases: CaseItem[] }) {
  const [filter, setFilter] = useState("ALL");
  const [active, setActive] = useState<CaseItem | null>(null);
  const [qty, setQty] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [strip, setStrip] = useState<Drop[]>([]);
  const [result, setResult] = useState<Drop[] | null>(null);
  const visible = useMemo(() => cases.filter(c => filter === "ALL" || c.category === filter), [cases, filter]);

  function openCases() {
    if (!active || rolling) return;
    setRolling(true); setResult(null);
    const wins = Array.from({ length: qty }, () => weightedDrop(active.drops));
    const items = Array.from({ length: 28 }, () => active.drops[Math.floor(Math.random() * active.drops.length)]);
    items[23] = wins[wins.length - 1];
    setStrip(items);
    window.setTimeout(() => { setResult(wins); setRolling(false); }, 3500);
  }

  return <div id="case-browser">
    <div className="filter-row">{["ALL","STARTER","FEATURED","ELITE"].map(f=><button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f==="ALL"?"WSZYSTKIE":f}</button>)}</div>
    <div className="case-grid">{visible.map((c,i)=><button key={c.id} className={`case-card ${active?.id===c.id?"chosen":""}`} style={{"--case-accent":c.accent} as React.CSSProperties} onClick={()=>{setActive(c);setResult(null);setStrip([])}}><div className="case-art"><span className="case-number">DZ / 0{i+1}</span><span className="case-emoji">{c.emoji}</span><span className="case-art-ring"/></div><div className="case-card-meta"><span>{c.category}</span><span className="case-price">{c.price} <b>CR</b></span></div><h3>{c.name}</h3><p>{c.description}</p><span className="case-open-link">ZOBACZ ZAWARTOŚĆ <ArrowUpRight size={15}/></span></button>)}</div>
    {active && <section className="case-detail">
      <div className="detail-head"><div><div className="eyebrow">CASE INSPECTOR / {active.id.toUpperCase()}</div><h2>{active.name}</h2><p>{active.description}</p></div><button className="close-detail" onClick={()=>{setActive(null);setResult(null)}}>ZAMKNIJ ×</button></div>
      <div className="detail-layout"><div className="open-panel"><div className="selected-case-art" style={{"--case-accent":active.accent} as React.CSSProperties}>{active.emoji}</div><div className="quantity-row"><span>LICZBA SKRZYŃ</span>{[1,2,3,4,5].map(n=><button key={n} disabled={rolling} className={qty===n?"selected":""} onClick={()=>setQty(n)}>{n}</button>)}</div><button className="btn btn-primary open-case-btn" disabled={rolling} onClick={openCases}>{rolling?"LOSOWANIE…":`OTWÓRZ ${qty} · ${active.price*qty} CR`}</button><p className="demo-note"><LockKeyhole size={13}/> Tryb podglądu — punkty demo, brak płatności</p>
      {strip.length>0 && <div className="roll-shell"><div className="roll-pointer"/><div className={`roll-strip ${rolling?"rolling":""}`} style={{"--strip-count":strip.length} as React.CSSProperties}>{strip.map((d,i)=><div className={`roll-item rarity-${d.rarity}`} key={i}><span>{d.emoji}</span><small>{d.name}</small></div>)}</div></div>}
      {result && <div className="result-panel"><strong>WYNIK OTWARCIA</strong><div className="result-list">{result.map((d,i)=><div key={i}><span>{d.emoji}</span><b>{d.name}</b><small>{d.value} CR</small></div>)}</div><p>To animacja demonstracyjna. Zapis ekwipunku zostanie obsłużony przez backend po skonfigurowaniu Supabase.</p></div>}
      </div><div className="drop-panel"><div className="drop-panel-head"><h3>Możliwe dropy</h3><span>{active.drops.length} PRZEDMIOTY</span></div><div className="possible-drops">{active.drops.map(d=><div className={`possible-drop rarity-${d.rarity}`} key={d.name}><span className="drop-emoji">{d.emoji}</span><span><b>{d.name}</b><small>{d.rarity.toUpperCase()}</small></span><strong>{d.value} CR</strong></div>)}</div></div></div>
    </section>}
  </div>;
}
