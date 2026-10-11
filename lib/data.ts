export type Drop = { name: string; emoji: string; value: number; rarity: "common" | "rare" | "epic" | "legendary" };
export type CaseItem = {
  id: string; name: string; description: string; price: number; emoji: string;
  accent: string; category: "STARTER" | "FEATURED" | "ELITE"; drops: Drop[];
};

export const CASES: CaseItem[] = [
  { id:"neon", name:"NEON SYNDICATE", description:"Światło miasta. Drop bez kompromisów.", price:250, emoji:"📦", accent:"#54ead6", category:"FEATURED",
    drops:[{name:"Neon Rider",emoji:"⚡",value:780,rarity:"legendary"},{name:"Cyber Pulse",emoji:"🟣",value:360,rarity:"epic"},{name:"Volt Strike",emoji:"🔷",value:190,rarity:"rare"},{name:"Blue Circuit",emoji:"🧊",value:90,rarity:"common"}]},
  { id:"arctic", name:"ARCTIC PROTOCOL", description:"Zimna precyzja. Rzadkie znaleziska.", price:420, emoji:"🧊", accent:"#76bfff", category:"ELITE",
    drops:[{name:"Polar Ghost",emoji:"❄️",value:1400,rarity:"legendary"},{name:"Frostline",emoji:"💎",value:620,rarity:"epic"},{name:"Glacier",emoji:"🩵",value:260,rarity:"rare"},{name:"Snowfall",emoji:"🌨️",value:110,rarity:"common"}]},
  { id:"gold", name:"AUREATE", description:"Złoty rozdział dla odważnych.", price:650, emoji:"👑", accent:"#ffc96a", category:"ELITE",
    drops:[{name:"Golden Dynasty",emoji:"👑",value:2200,rarity:"legendary"},{name:"Sunforge",emoji:"🌟",value:940,rarity:"epic"},{name:"Amberline",emoji:"🟠",value:410,rarity:"rare"},{name:"Gold Dust",emoji:"✨",value:160,rarity:"common"}]},
  { id:"pixel", name:"PIXEL RIOT", description:"Retro energia, nowoczesny loot.", price:120, emoji:"👾", accent:"#b8ff78", category:"STARTER",
    drops:[{name:"8-Bit Legend",emoji:"🕹️",value:420,rarity:"legendary"},{name:"Arcade Ghost",emoji:"👾",value:190,rarity:"epic"},{name:"Retro Wave",emoji:"🟦",value:80,rarity:"rare"},{name:"High Score",emoji:"⭐",value:35,rarity:"common"}]},
  { id:"void", name:"VOID WALKER", description:"Ciemna materia. Najwyższa liga.", price:900, emoji:"🌑", accent:"#bd8cff", category:"ELITE",
    drops:[{name:"Event Horizon",emoji:"🌌",value:3200,rarity:"legendary"},{name:"Black Orbit",emoji:"🪐",value:1250,rarity:"epic"},{name:"Night Shift",emoji:"🟣",value:520,rarity:"rare"},{name:"Eclipse",emoji:"🌘",value:210,rarity:"common"}]},
  { id:"inferno", name:"INFERNO LAB", description:"Podkręć temperaturę i sprawdź drop.", price:300, emoji:"🔥", accent:"#ff826a", category:"FEATURED",
    drops:[{name:"Hellfire",emoji:"🐉",value:980,rarity:"legendary"},{name:"Magma Core",emoji:"🌋",value:460,rarity:"epic"},{name:"Blaze",emoji:"🔥",value:180,rarity:"rare"},{name:"Ember",emoji:"🔴",value:65,rarity:"common"}]}
];
