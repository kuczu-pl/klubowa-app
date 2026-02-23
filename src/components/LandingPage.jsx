import { getSeason, SEASONS, fDate } from "../utils/helpers";

export default function LandingPage({settings,news,events,gallery,onEnter}){
  const s=getSeason();const T=SEASONS[s];
  const cfg={
    tagline: settings?.landingTagline || "Razem na boisku, razem w aplikacji.",
    showFeatures: settings?.landingShowFeatures!==false,
    showNews: settings?.landingShowNews!==false,
    newsCount: settings?.landingNewsCount||4,
    showEvents: settings?.landingShowEvents!==false,
    eventsCount: settings?.landingEventsCount||3,
    showGallery: !!settings?.landingShowGallery,
    galleryCount: settings?.landingGalleryCount||6,
    contactAddress: settings?.landingContactAddress||"",
    contactPhone: settings?.landingContactPhone||"",
    contactEmail: settings?.landingContactEmail||"",
    customHtml: settings?.landingCustomHtml||"",
  };

  const pubNews=[...news]
    .sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||b.date.localeCompare(a.date))
    .slice(0,cfg.newsCount);

  const today=new Date().toISOString().split("T")[0];
  const upcomingEvents=[...events]
    .filter(e=>e.date>=today)
    .sort((a,b)=>a.date.localeCompare(b.date))
    .slice(0,cfg.eventsCount);

  const pubGallery=[...gallery]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .slice(0,cfg.galleryCount);

  const features=[
    {icon:"📰",title:"Aktualności",desc:"Bądź na bieżąco z życiem klubu — ogłoszenia trenera i ważne informacje."},
    {icon:"📅",title:"Kalendarz Wydarzeń",desc:"Mecze, treningi i spotkania — wszystkie daty w jednym miejscu."},
    {icon:"⚽",title:"Składy i Taktyka",desc:"Wirtualna tablica trenerska i system sprawiedliwego losowania drużyn."},
    {icon:"💡",title:"Pomysły",desc:"Zgłaszaj inicjatywy i głosuj na najlepsze rozwiązania dla naszego zespołu."},
    {icon:"📊",title:"Ankiety",desc:"Decydujcie razem — szybkie i proste głosowania dostępne dla każdego członka."},
    {icon:"📁",title:"Dokumenty",desc:"Regulaminy, analizy przeciwników i sprawozdania — zawsze pod ręką."}
  ];

  const hasContact=cfg.contactAddress||cfg.contactPhone||cfg.contactEmail;

  return(
    <div className="lp">
      {/* HERO */}
      <div className="lp-hero">
        <div className="lp-hero-logo">
          <img src={settings?.orgLogoUrl || "/logo.png"} alt="Logo" onError={e=>{e.target.style.display="none";e.target.parentElement.textContent=T.emoji;}}/>
        </div>
        <div className="lp-hero-title">{settings?.orgName || "Aplikacja Klubu"}</div>
        <div className="lp-hero-sub">
          {settings?.orgLocation || "Twoje Miasto"} {settings?.orgGmina ? `· ${settings.orgGmina}` : ""}
        </div>
        {cfg.tagline&&<div style={{fontSize:15,opacity:.85,marginTop:8,position:"relative",zIndex:1,fontStyle:"italic"}}>„{cfg.tagline}"</div>}
        <div className="lp-hero-season">{T.emoji} Sezon: {T.name}</div>
        <div className="lp-hero-btns">
          <button className="lp-btn-primary" onClick={onEnter}>🔐 Zaloguj się do systemu</button>
        </div>
      </div>

      {/* FUNKCJE */}
      {cfg.showFeatures&&<div className="lp-section">
        <div className="lp-section-title">Cyfrowe centrum dowodzenia</div>
        <div className="lp-section-sub">Wszystko, czego potrzebuje nowoczesny klub sportowy.</div>
        <div className="lp-features">
          {features.map(f=><div key={f.title} className="lp-feat">
            <div className="lp-feat-icon">{f.icon}</div>
            <div className="lp-feat-title">{f.title}</div>
            <div className="lp-feat-desc">{f.desc}</div>
          </div>)}
        </div>
      </div>}

      {/* AKTUALNOŚCI */}
      {cfg.showNews&&pubNews.length>0&&<div className="lp-section" style={{paddingTop:cfg.showFeatures?0:48}}>
        <div className="lp-section-title">Aktualności</div>
        <div className="lp-section-sub">Najnowsze wiadomości z życia naszej grupy</div>
        <div className="lp-news">
          {pubNews.map(n=><div key={n.id} className="lp-news-item">
            {n.pinned&&<div style={{fontSize:10,fontWeight:700,color:T.warm,marginBottom:4,letterSpacing:.5,textTransform:"uppercase"}}>📌 Przypięte</div>}
            <div className="lp-news-item-tag">{n.category}</div>
            <div className="lp-news-item-title">{n.title}</div>
            <div className="lp-news-item-meta">{fDate(n.date)}</div>
            {n.content&&<div style={{marginTop:8,fontSize:13.5,color:"#555",lineHeight:1.6}}>{n.content.slice(0,240)}{n.content.length>240?"…":""}</div>}
          </div>)}
        </div>
      </div>}

      {/* WYDARZENIA */}
      {cfg.showEvents&&upcomingEvents.length>0&&<div className="lp-section" style={{paddingTop:0}}>
        <div className="lp-section-title">Nadchodzące spotkania</div>
        <div className="lp-section-sub">Sprawdź kalendarz i zapisz się na mecz</div>
        <div className="lp-events">
          {upcomingEvents.map(e=>{
            const d=new Date(e.date);
            return(<div key={e.id} className="lp-event-item">
              <div className="lp-event-date">
                <div className="lp-event-dd">{d.getDate()}</div>
                <div className="lp-event-mm">{["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"][d.getMonth()]}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14.5}}>{e.title}</div>
                <div style={{fontSize:12.5,color:"#666",marginTop:2}}>🕐 {e.time} · 📍 {e.place}</div>
              </div>
            </div>);
          })}
        </div>
      </div>}

      {/* GALERIA */}
      {cfg.showGallery&&pubGallery.length>0&&<div className="lp-section" style={{paddingTop:0}}>
        <div className="lp-section-title">Galeria</div>
        <div className="lp-section-sub">Zdjęcia z boiska i szatni</div>
        <div className="lp-gallery-grid">
          {pubGallery.map(g=><div key={g.id} className="lp-gallery-item">
            <img src={g.imageData} alt={g.title} loading="lazy"/>
          </div>)}
        </div>
      </div>}

      {/* CTA */}
      <div className="lp-cta">
        <div className="lp-cta-title">Jesteś zawodnikiem naszego klubu?</div>
        <div className="lp-cta-desc">Zaloguj się, żeby uzyskać dostęp do pełnej platformy — wydarzeń, składek, wiadomości i ustawień taktycznych.</div>
        <button className="lp-btn-primary" style={{background:`linear-gradient(135deg,${T.primary},${T.warm})`,color:"#fff"}} onClick={onEnter}>Zaloguj się →</button>
      </div>

      {/* STOPKA */}
      <div className="lp-footer">
        <div>© {new Date().getFullYear()} {settings?.orgName || "Aplikacja Klubu"} · {settings?.orgLocation || ""}</div>
        {hasContact&&<div className="lp-contact" style={{marginTop:10,justifyContent:"center"}}>
          {cfg.contactAddress&&<span className="lp-contact-item" style={{color:"rgba(255,255,255,.6)"}}>📍 {cfg.contactAddress}</span>}
          {cfg.contactPhone&&<span className="lp-contact-item" style={{color:"rgba(255,255,255,.6)"}}>📞 {cfg.contactPhone}</span>}
          {cfg.contactEmail&&<a href={`mailto:${cfg.contactEmail}`} className="lp-contact-item" style={{color:"rgba(255,255,255,.75)",textDecoration:"none"}}>✉️ {cfg.contactEmail}</a>}
        </div>}
        {cfg.customHtml&&<div style={{marginTop:10,fontSize:11.5,opacity:.55}}>{cfg.customHtml}</div>}
      </div>
    </div>
  );
}