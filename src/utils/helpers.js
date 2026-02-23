// ═══════════════════════════════════════════════════════════════════
// SEASONAL THEME
// ═══════════════════════════════════════════════════════════════════
export function getSeason() { 
  const m = new Date().getMonth(); 
  if (m >= 2 && m <= 4) return "spring"; 
  if (m >= 5 && m <= 7) return "summer"; 
  if (m >= 8 && m <= 10) return "autumn"; 
  return "winter"; 
}

export const SEASONS = {
  winter: { name:"Zima", emoji:"❄️", primary:"#3B6B8A", primaryDark:"#2A4F6B", accent:"#8FBCD4", accentLight:"#C5DDE9", warm:"#C46B3E", warmLight:"#E8A878", bg:"#F4F8FB", cream:"#EAF2F7", creamDark:"#D4E4ED", side1:"#2A3F52", side2:"#1A2A38", border:"#CBD8E1", text:"#1E3A50", textM:"#4A6A80", banner:"linear-gradient(135deg,#2A3F52,#1A2A38)", particle:"✦" },
  spring: { name:"Wiosna", emoji:"🌸", primary:"#7B8E3E", primaryDark:"#5C6B2E", accent:"#D4A0B9", accentLight:"#F0D5E3", warm:"#C4983E", warmLight:"#E8C36A", bg:"#FAFCF5", cream:"#F0F5E6", creamDark:"#E2EBD0", side1:"#3D4A2A", side2:"#2A3318", border:"#D4DFC0", text:"#2E3B1A", textM:"#5C6B42", banner:"linear-gradient(135deg,#3D4A2A,#2A3318)", particle:"❀" },
  summer: { name:"Lato", emoji:"🌻", primary:"#C4983E", primaryDark:"#A07830", accent:"#E8C36A", accentLight:"#FFF0C8", warm:"#B8383B", warmLight:"#D4696B", bg:"#FFFCF5", cream:"#FFF5E0", creamDark:"#FFECC0", side1:"#5C3D2E", side2:"#3D2518", border:"#E8DFD0", text:"#5C3D2E", textM:"#8B6F5E", banner:"linear-gradient(135deg,#5C3D2E,#3D2518)", particle:"✿" },
  autumn: { name:"Jesień", emoji:"🍂", primary:"#B8583B", primaryDark:"#8E3F28", accent:"#C4983E", accentLight:"#E8D0A0", warm:"#8B4A30", warmLight:"#B87A5A", bg:"#FBF8F4", cream:"#F5ECE0", creamDark:"#EBDCC8", side1:"#4A2E20", side2:"#331E14", border:"#DDD0BF", text:"#3D2518", textM:"#7A5A44", banner:"linear-gradient(135deg,#4A2E20,#331E14)", particle:"🍁" },
};

// ═══════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════
export const ROLES = [
  { value: "member", label: "Członek/Członkini" },
  { value: "zarzad", label: "Zarząd" },
  { value: "skarbnik", label: "Skarbnik" },
  { value: "admin", label: "Administrator" }
];

export function canSeeDues(r) { return ["admin", "skarbnik", "zarzad"].includes(r); }
// Zmiana: Skarbnik również może zarządzać (rozliczać wydarzenia)
export function canManage(r) { return ["admin", "zarzad", "skarbnik"].includes(r); }
export function isAdmin(r) { return r === "admin"; }

export const MO_PL = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
export const MO_S = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
export const AV_C = ["#B8383B", "#4A7C59", "#C4983E", "#6B5B8D", "#2D7D9A", "#C46B3E", "#7B6348", "#8B4A6B", "#3B6B8A", "#8E5B3E"];

export function fDate(d) { if (!d) return ""; const x = new Date(d); return `${x.getDate()} ${MO_S[x.getMonth()]} ${x.getFullYear()}`; }
export function mName(m) { const [y, mo] = m.split("-"); return `${MO_PL[parseInt(mo) - 1]} ${y}`; }
export function ini(n) { return (n || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }
export function avC(id) { let h = 0; for (let i = 0; i < String(id).length; i++) { h = ((h << 5) - h) + String(id).charCodeAt(i); h |= 0; } return AV_C[Math.abs(h) % AV_C.length]; }
export function timeAgo(d) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1e3); if (s < 60) return "przed chwilą"; if (s < 3600) return `${Math.floor(s / 60)} min temu`; if (s < 84400) return `${Math.floor(s / 3600)} godz. temu`; if (s < 604800) return `${Math.floor(s / 86400)} dn. temu`; return fDate(d); }
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// Funkcja do podmieniania tagów {{name}} na konkretne dane
export function tplt(str, data) {
  if (!str) return "";
  return str.replace(/\{\{(.*?)\}\}/g, (match, key) => data[key.trim()] || match);
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT SETTINGS & SEED DATA
// ═══════════════════════════════════════════════════════════════════
export const DEFAULT_SETTINGS = {
  dueAmount: 10,
  dueCurrency: "zł",
  orgName: "Aplikacja Organizacyjna",
  orgLocation: "Twoje Miasto",
  orgGmina: "",
  landingTagline: "Razem na boisku, razem w aplikacji.",
  landingContactAddress: "Stadion Główny",
  landingContactPhone: "",
  landingContactEmail: "",
  landingShowFeatures: true,
  landingShowNews: true,
  landingNewsCount: 4,
  landingShowEvents: true,
  landingEventsCount: 3,
  landingShowGallery: false,
  landingGalleryCount: 6,
  landingCustomHtml: "",
  docFolders: ["Uchwały", "Protokoły z zebrań", "Regulaminy", "Sprawozdania finansowe", "Wnioski", "Inne"],

 
  labelDashboard: "Strona główna",
  labelNews: "Aktualności",
  labelNewsSub: "Ogłoszenia i wiadomości z życia naszej organizacji",
  labelMembers: "Członkowie",
  labelDues: "Skarbnik",
  labelIdeas: "Pomysły",
  labelPolls: "Ankiety",
  labelRecipes: "Przepisy",
  labelEvents: "Kalendarz",
  labelGallery: "Galeria",
  labelDocs: "Dokumenty",
  labelMessages: "Wiadomości",
  labelFinances: "Finanse",
  labelMailing: "Mailing",
  labelAdmin: "Zarządzanie",
  labelSettings: "Ustawienia",
  labelProfile: "Mój Profil",
  labelGuide: "Pomoc",


  welcomeSubject: "Witaj w {{orgName}}!",
  welcomeBody: "Witaj, {{name}}!\n\nCieszymy się, że dołączyłeś/aś do naszej aplikacji.\nTeraz masz dostęp do wszystkich aktualności, materiałów i kalendarza wydarzeń.\n\nPozdrawiamy,\nZarząd {{orgName}}",
  
  duePaidSubject: "Potwierdzenie wpłaty - {{month}}",
  duePaidBody: "Dziękujemy za wpłatę!\n\nWitaj, {{name}}.\nTwoja składka członkowska za miesiąc {{month}} została zaksięgowana w systemie w wysokości {{amount}} {{currency}}.\n\nZ poważaniem,\nSkarbnik {{orgName}}",
  
  dueCreatedSubject: "Nowa składka do opłacenia - {{month}}",
  dueCreatedBody: "Dzień dobry, {{name}}.\n\nZostała naliczona nowa składka za miesiąc {{month}} w wysokości {{amount}} {{currency}}.\nProsimy o uregulowanie płatności u Skarbnika lub przelewem.\n\nPozdrawiamy,\nZarząd {{orgName}}"
};

export const SEED_NEWS = [
  {
    id: "seed1",
    title: "Witaj w aplikacji!",
    content: "Aplikacja została uruchomiona. Zapraszamy do korzystania z wszystkich modułów!",
    date: new Date().toISOString().split("T")[0],
    authorId: "seed",
    pinned: true,
    category: "aktualność"
  }
];


export function mailWrapper(text) {
  if (!text) return "";

  const formattedText = text.replace(/\n/g, '<br>');
  return `
    <div style="background-color: #f4f8fb; padding: 30px; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        ${formattedText}
      </div>
    </div>
  `;
}


export function uName(usersList, aid, orgName = "System") {
  if (aid === "seed" || aid === "system") return orgName;
  if (!usersList) return "Anonim";
  
  // NOWE: Obsługa gości niezarejestrowanych (np. wyciągniętych z Messengera)
  if (aid.startsWith("guest_")) {
    return aid.replace("guest_", "") + " (Gość)";
  }

  const u = usersList.find(x => x.id === aid);
  return u ? u.name : "Nieznany";
}

// ═══════════════════════════════════════════════════════════════════
// APP PRESETS (KREATOR ONBOARDINGU)
// ═══════════════════════════════════════════════════════════════════
export const APP_PRESETS = [
  { 
    id: "sport", emoji: "⚽", name: "Klub Sportowy", desc: "Drużyny, akademie, stowarzyszenia sportowe",
    labels: { labelMembers: "Zawodnicy", labelRecipes: "Taktyki", labelEvents: "Mecze i Treningi", labelDues: "Składki", labelIdeas: "Inicjatywy" },
    modules: { modDues: true, modIdeas: true, modRecipes: true, modEvents: true, modGallery: true, modDocuments: true, modFinances: true },
    recipeFields: { 
      cats: ["Taktyka", "Trening", "Stałe fragmenty", "Analiza", "Inne"], 
      ingrLabel: "Elementy / Sprzęt", 
      instrLabel: "Opis taktyki / Przebieg" 
    }
  },
  { 
    id: "fire", emoji: "🚒", name: "Ochotnicza Straż Pożarna", desc: "Jednostki OSP, remizy, ratownicy",
    labels: { labelMembers: "Druhowie", labelRecipes: "Instrukcje", labelEvents: "Zbiórki i Akcje", labelDues: "Skarbnik OSP", labelIdeas: "Wnioski" },
    modules: { modDues: true, modIdeas: true, modRecipes: true, modEvents: true, modGallery: true, modDocuments: true, modFinances: true },
    recipeFields: { 
      cats: ["Ratownictwo", "Gaśnicze", "Sprzęt", "Medyczne", "Inne"], 
      ingrLabel: "Wymagany sprzęt", 
      instrLabel: "Procedura operacyjna" 
    }
  },
  { 
    id: "ngo", emoji: "🌻", name: "Koło / KGW", desc: "Koła gospodyń, fundacje, kluby seniora",
    labels: { labelMembers: "Członkowie", labelRecipes: "Przepisy i Zasoby", labelEvents: "Wydarzenia", labelDues: "Skarbnik", labelIdeas: "Pomysły" },
    modules: { modDues: true, modIdeas: true, modRecipes: true, modEvents: true, modGallery: true, modDocuments: true, modFinances: true },
    recipeFields: { 
      cats: ["Ciasta", "Zupy", "Dania główne", "Sałatki", "Przetwory", "Inne"], 
      ingrLabel: "Składniki", 
      instrLabel: "Sposób przygotowania" 
    }
  },
  { 
    id: "association", emoji: "⚖️", name: "Stowarzyszenie Branżowe", desc: "Związki zawodowe, rzeczoznawcy, eksperci",
    labels: { labelMembers: "Zrzeszeni", labelRecipes: "Baza Wiedzy", labelEvents: "Szkolenia / Walne", labelDues: "Składki Członkowskie", labelIdeas: "Uchwały i Wnioski", labelDocs: "Dokumenty i Akty" },
    modules: { modDues: true, modIdeas: true, modRecipes: true, modEvents: true, modGallery: false, modDocuments: true, modFinances: true },
    recipeFields: { 
      cats: ["Artykuły", "Poradniki", "Interpretacje", "Materiały", "Inne"], 
      ingrLabel: "Załączniki / Odnośniki", 
      instrLabel: "Treść" 
    }
  },
  { 
    id: "company", emoji: "🏢", name: "Firma / Zespół", desc: "Zespoły projektowe, startupy, działy HR",
    labels: { labelMembers: "Pracownicy", labelRecipes: "Baza Wiedzy", labelEvents: "Spotkania", labelDues: "Finanse", labelIdeas: "Pomysły HR" },
    modules: { modDues: false, modIdeas: true, modRecipes: true, modEvents: true, modGallery: true, modDocuments: true, modFinances: false },
    recipeFields: { 
      cats: ["Procesy", "Onboarding", "Materiały", "Narzędzia", "Inne"], 
      ingrLabel: "Zasoby", 
      instrLabel: "Opis procedury" 
    }
  },
  { 
    id: "other", emoji: "🌍", name: "Inna Społeczność", desc: "Dowolna inna grupa z własnymi zasadami",
    labels: { labelMembers: "Członkowie", labelRecipes: "Zasoby", labelEvents: "Kalendarz", labelDues: "Skarbnik", labelIdeas: "Pomysły" },
    modules: { modDues: true, modIdeas: true, modRecipes: true, modEvents: true, modGallery: true, modDocuments: true, modFinances: true },
    recipeFields: { 
      cats: ["Poradniki", "Materiały", "Inne"], 
      ingrLabel: "Wymagania", 
      instrLabel: "Instrukcja" 
    }
  }
];

/**
 * Dzieli listę zawodników na dwie wyrównane drużyny na podstawie ich ratingu.
 */
export function balanceTeams(attendees, allUsers, customRatings = {}) {
  // 1. Pobieramy pełne dane o graczach
  const players = attendees.map(id => {
    const u = allUsers.find(user => user.id === id);
    
    // Priorytet: 
    // 1. Ranga wpisana ręcznie w oknie losowania (customRatings)
    // 2. Ranga stała z profilu użytkownika (u.rating)
    // 3. Domyślna ranga 3 (dla nowych/gości)
    const ratingFromUI = customRatings[id] !== undefined ? Number(customRatings[id]) : null;
    const finalRating = ratingFromUI || u?.rating || 3;
    
    return { 
      id, 
      name: u?.name || id.replace('guest_', ''), 
      rating: finalRating 
    };
  });

  // 2. Sortujemy od "Kocura" do najsłabszego
  players.sort((a, b) => b.rating - a.rating);

  const teamA = [];
  const teamB = [];
  let sumA = 0;
  let sumB = 0;

  // 3. Rozdzielamy metodą sprawiedliwego balansu punktowego
  players.forEach(p => {
    if (sumA <= sumB) {
      teamA.push(p.id);
      sumA += p.rating;
    } else {
      teamB.push(p.id);
      sumB += p.rating;
    }
  });

  return { teamA, teamB, powerA: sumA, powerB: sumB };
}