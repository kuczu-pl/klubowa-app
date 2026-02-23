import React, { useState } from 'react';
import { DEFAULT_SETTINGS } from '../utils/helpers';
import I from '../utils/icons';

export default function Settings({
  settings, setSettings, activeSetTab, setActiveSetTab, 
  saveSettings, uploadLogo, flash
}) {
  const LP = settings;

  // Stan dla edycji motywów
  const [editIdx, setEditIdx] = useState(null);
  
  // Formularz nowego motywu (domyślnie ustawiony na barwy Barcelony, o które pytałeś)
  const [nt, setNt] = useState({ 
    name: "", 
    emoji: "⚽", 
    primary: "#A50044", 
    primaryDark: "#7A0032", 
    accent: "#EDBB00", 
    bg: "#F8F9FA", 
    side1: "#004D98", 
    side2: "#001C58", 
    text: "#1A1A1A", 
    textSide: "#FFFFFF" 
  });

  const tabs = [
    { id: "general", l: "Ogólne", i: "🏠" },
    { id: "modules", l: "Moduły", i: "🎛️" },
    { id: "labels", l: "Etykiety", i: "🏷️" },
    { id: "emails", l: "Szablony e-mail", i: "✉️" },
    { id: "themes", l: "Motywy", i: "🎨" },
    { id: "landing", l: "Strona WWW", i: "🌐" }
  ];

  const handleSaveTheme = () => {
    if (!nt.name) return flash("Podaj nazwę motywu!");
    
    const themeObj = {
      ...nt,
      accentLight: nt.accent + "33", // Automatyczna przezroczystość dla tła akcentu
      cream: "#F4F8FB", 
      creamDark: "#EAF2F7",
      border: "#CBD8E1",
      banner: `linear-gradient(135deg, ${nt.side1}, ${nt.side2})`
    };

    let newList = [...(LP.customThemes || [])];
    if (editIdx !== null) {
      newList[editIdx] = themeObj;
    } else {
      newList.push(themeObj);
    }

    setSettings({ ...LP, customThemes: newList });
    setEditIdx(null);
    // Reset formularza
    setNt({ name: "", emoji: "⚽", primary: "#A50044", primaryDark: "#7A0032", accent: "#EDBB00", bg: "#F8F9FA", side1: "#004D98", side2: "#001C58", text: "#1A1A1A", textSide: "#FFFFFF" });
    flash(editIdx !== null ? "Motyw zaktualizowany! Pamiętaj zapisać zmiany na dole." : "Motyw dodany do listy!");
  };

  function ModToggle({ field, label, sub }) {
    const isChecked = LP[field] !== false;
    return (
      <div className="setting-toggle">
        <div>
          <div className="setting-toggle-label">{label}</div>
          {sub && <div className="setting-toggle-sub">{sub}</div>}
        </div>
        <label className="toggle-sw">
          <input type="checkbox" checked={isChecked} onChange={e => setSettings({ ...LP, [field]: e.target.checked })} />
          <span className="toggle-sl" />
        </label>
      </div>
    );
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">Konfiguracja Systemu</div>
          <div className="ps">Zarządzaj aplikacją dla: {settings.orgName}</div>
        </div>
      </div>

      <div className="settings-container">
        <nav className="settings-tabs">
          {tabs.map(t => (
            <button key={t.id} className={activeSetTab === t.id ? "active" : ""} onClick={() => { setActiveSetTab(t.id); setEditIdx(null); }}>
              {t.i} {t.l}
            </button>
          ))}
        </nav>

        <div className="settings-panel card">
          {/* ZAKŁADKA: OGÓLNE */}
          {activeSetTab === "general" && (
            <div className="s-pane">
              <h3>Dane organizacji</h3>
              <div className="fg"><label className="fl">Nazwa organizacji</label><input className="fi" value={LP.orgName} onChange={e => setSettings({ ...LP, orgName: e.target.value })} /></div>
              <div className="fg"><label className="fl">Miejscowość</label><input className="fi" value={LP.orgLocation} onChange={e => setSettings({ ...LP, orgLocation: e.target.value })} /></div>
              <div className="fg"><label className="fl">Gmina</label><input className="fi" value={LP.orgGmina} onChange={e => setSettings({ ...LP, orgGmina: e.target.value })} /></div>
              
              <h3 style={{marginTop:24}}>Finanse</h3>
              <div className="fg"><label className="fl">Domyślna składka</label><input className="fi" type="number" value={LP.dueAmount} onChange={e => setSettings({ ...LP, dueAmount: parseFloat(e.target.value) })} /></div>
              <div className="fg"><label className="fl">Waluta</label><input className="fi" value={LP.dueCurrency} onChange={e => setSettings({ ...LP, dueCurrency: e.target.value })} /></div>
              
              <div className="fg" style={{marginTop: 14}}>
                <label className="fl">Kategorie przychodów (jedna w linii)</label>
                <textarea className="fta" rows={4} value={(LP.financeIncomeCats || ["Dotacja", "Darowizna", "Zbiórka", "Sponsorzy", "Inne"]).join('\n')} onChange={e => setSettings({ ...LP, financeIncomeCats: e.target.value.split('\n').filter(Boolean) })} />
              </div>
              <div className="fg">
                <label className="fl">Kategorie wydatków (jedna w linii)</label>
                <textarea className="fta" rows={4} value={(LP.financeExpenseCats || ["Sprzęt i Materiały", "Wynajem", "Transport", "Wyżywienie", "Opłaty", "Inne"]).join('\n')} onChange={e => setSettings({ ...LP, financeExpenseCats: e.target.value.split('\n').filter(Boolean) })} />
              </div>

              <h3 style={{marginTop:24}}>Logo</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <img src={LP.orgLogoUrl || "/logo.png"} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--bo)" }} alt="Logo" />
                <label className="btn btn-s" style={{ cursor: "pointer" }}>
                  {I.upload} Wgraj nowe logo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                </label>
              </div>
            </div>
          )}

          {/* ZAKŁADKA: MODUŁY */}
          {activeSetTab === "modules" && (
            <div className="s-pane">
              <h3>Aktywne funkcje</h3>
              <ModToggle field="modDues" label="Skarbnik" sub="Składki i zaległości" />
              <ModToggle field="modIdeas" label="Pomysły" sub="Głosowanie nad inicjatywami" />
              <ModToggle field="modRecipes" label="Zasoby/Przepisy" sub="Kolekcja wiedzy organizacji" />
              <ModToggle field="modEvents" label="Wydarzenia" sub="Kalendarz i RSVP" />
              <ModToggle field="modGallery" label="Galeria" sub="Zdjęcia i albumy" />
              <ModToggle field="modDocuments" label="Dokumenty" sub="Pliki i uchwały" />
              <ModToggle field="modFinances" label="Finanse" sub="Przychody i wydatki" />
              
              <h3 style={{marginTop:24}}>Konfiguracja Dokumentów</h3>
              <label className="fl">Foldery (jeden w linii)</label>
              <textarea className="fta" rows={6} value={(LP.docFolders && LP.docFolders.length > 0 ? LP.docFolders : DEFAULT_SETTINGS.docFolders).join('\n')} onChange={e => setSettings({ ...LP, docFolders: e.target.value.split('\n').filter(Boolean) })} />
            </div>
          )}

          {/* ZAKŁADKA: ETYKIETY */}
          {activeSetTab === "labels" && (
            <div className="s-pane">
              <h3>Personalizacja nazw (White-label)</h3>
              <div className="fg"><label className="fl">Dashboard</label><input className="fi" value={LP.labelDashboard} onChange={e => setSettings({ ...LP, labelDashboard: e.target.value })} /></div>
              <div className="fg"><label className="fl">Aktualności</label><input className="fi" value={LP.labelNews} onChange={e => setSettings({ ...LP, labelNews: e.target.value })} /></div>
              <div className="fg"><label className="fl">Członkowie</label><input className="fi" value={LP.labelMembers} onChange={e => setSettings({ ...LP, labelMembers: e.target.value })} /></div>
              <div className="fg"><label className="fl">Skarbnik</label><input className="fi" value={LP.labelDues} onChange={e => setSettings({ ...LP, labelDues: e.target.value })} /></div>
              <div className="fg"><label className="fl">Zasoby/Przepisy</label><input className="fi" value={LP.labelRecipes} onChange={e => setSettings({ ...LP, labelRecipes: e.target.value })} /></div>
              <div className="fg"><label className="fl">Dokumenty</label><input className="fi" value={LP.labelDocs} onChange={e => setSettings({ ...LP, labelDocs: e.target.value })} /></div>
              <div className="fg"><label className="fl">Pomoc/Guide</label><input className="fi" value={LP.labelGuide} onChange={e => setSettings({ ...LP, labelGuide: e.target.value })} /></div>

              {/* TERAZ TA SEKCJA JEST WEWNĄTRZ PANELU "LABELS" */}
              <div style={{ marginTop: 25, padding: 20, background: 'var(--cr)', borderRadius: 12, border: '1px solid var(--bo)' }}>
                <h4 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>⚙️ Konfiguracja modułu: {LP.labelRecipes}</h4>
                
                <div className="fg">
                  <label className="fl">Kategorie (oddzielone przecinkiem)</label>
                  <input 
                    className="fi" 
                    value={LP.recipeFields?.cats?.join(", ") || ""} 
                    onChange={e => setSettings({ 
                      ...LP, 
                      recipeFields: { 
                        ...(LP.recipeFields || {}), 
                        cats: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                      } 
                    })} 
                    placeholder="np. Taktyka, Trening, Analiza"
                  />
                  <div className="ps" style={{marginTop: 5}}>Wpisz kategorie, które pojawią się w filtrach i przy dodawaniu.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="fg">
                    <label className="fl">Etykieta pola 1 (np. Sprzęt)</label>
                    <input className="fi" value={LP.recipeFields?.ingrLabel || ""} onChange={e => setSettings({ ...LP, recipeFields: { ...LP.recipeFields, ingrLabel: e.target.value } })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Etykieta pola 2 (np. Przebieg)</label>
                    <input className="fi" value={LP.recipeFields?.instrLabel || ""} onChange={e => setSettings({ ...LP, recipeFields: { ...LP.recipeFields, instrLabel: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div> // <--- To zamknięcie s-pane
          )} 

          {/* ZAKŁADKA: E-MAILE */}
          {activeSetTab === "emails" && (
            <div className="s-pane">
              <h3>Szablony wiadomości automatycznych</h3>
              <div className="s-hint" style={{ padding: "18px 24px", border: "1.5px solid var(--bo)", background: "var(--cr)" }}>
                <strong>Jak pisać szablony?</strong> Zamiast imion, używaj zmiennych:
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
                  {["{{name}}", "{{month}}", "{{amount}}", "{{currency}}", "{{orgName}}"].map(tag => (
                    <div key={tag} onClick={() => { navigator.clipboard.writeText(tag); flash(`Skopiowano: ${tag}`); }} style={{ background: "#fff", border: "1px solid var(--bo)", borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>
                      <code style={{ color: "var(--p)", fontWeight: 700 }}>{tag}</code>
                    </div>
                  ))}
                </div>
              </div>
              <h4 className="s-sub" style={{marginTop:28}}>Mail powitalny</h4>
              <input className="fi" value={LP.welcomeSubject || DEFAULT_SETTINGS.welcomeSubject} onChange={e => setSettings({ ...LP, welcomeSubject: e.target.value })} />
              <textarea className="fta" rows={6} value={LP.welcomeBody || DEFAULT_SETTINGS.welcomeBody} onChange={e => setSettings({ ...LP, welcomeBody: e.target.value })} />
              <h4 className="s-sub" style={{marginTop:24}}>Naliczenie składki</h4>
              <input className="fi" value={LP.dueCreatedSubject || DEFAULT_SETTINGS.dueCreatedSubject} onChange={e => setSettings({ ...LP, dueCreatedSubject: e.target.value })} />
              <textarea className="fta" rows={6} value={LP.dueCreatedBody || DEFAULT_SETTINGS.dueCreatedBody} onChange={e => setSettings({ ...LP, dueCreatedBody: e.target.value })} />
            </div>
          )}

          {/* ZAKŁADKA: MOTYWY (NOWA) */}
          {activeSetTab === "themes" && (
            <div className="s-pane">
              <h3>{editIdx !== null ? "✏️ Edytuj motyw" : "🎨 Kreator Motywów"}</h3>
              <div className="s-hint" style={{marginBottom: 20}}>Stwórz własny schemat kolorów. Podgląd aktualizuje się natychmiast.</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 25 }}>
                {/* FORMULARZ */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10 }}>
                    <div className="fg"><label className="fl">Nazwa motywu</label><input className="fi" value={nt.name} onChange={e => setNt({ ...nt, name: e.target.value })} placeholder="np. FC Barcelona" /></div>
                    <div className="fg"><label className="fl">Emoji</label><input className="fi" value={nt.emoji} onChange={e => setNt({ ...nt, emoji: e.target.value })} /></div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                    <div className="fg"><label className="fl">Główny</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.primary} onChange={e => setNt({ ...nt, primary: e.target.value })} /></div>
                    <div className="fg"><label className="fl">Akcent</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.accent} onChange={e => setNt({ ...nt, accent: e.target.value })} /></div>
                    <div className="fg"><label className="fl">Sidebar (Góra)</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.side1} onChange={e => setNt({ ...nt, side1: e.target.value })} /></div>
                    <div className="fg"><label className="fl">Sidebar (Dół)</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.side2} onChange={e => setNt({ ...nt, side2: e.target.value })} /></div>
                    <div className="fg"><label className="fl">Tło aplikacji</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.bg} onChange={e => setNt({ ...nt, bg: e.target.value })} /></div>
                    <div className="fg"><label className="fl">Tekst w menu</label><input type="color" style={{width:'100%', height:38, padding:2, border:'1px solid var(--bo)'}} value={nt.textSide} onChange={e => setNt({ ...nt, textSide: e.target.value })} /></div>
                  </div>
                  <div style={{display:'flex', gap: 10, marginTop: 15}}>
                    <button className="btn btn-p" style={{flex:1}} onClick={handleSaveTheme}>{editIdx !== null ? "Zaktualizuj" : "Dodaj do listy"}</button>
                    {editIdx !== null && <button className="btn btn-s" onClick={() => { setEditIdx(null); setNt({name:"", emoji:"⚽", primary:"#A50044", primaryDark:"#7A0032", accent:"#EDBB00", bg:"#F8F9FA", side1:"#004D98", side2:"#001C58", text:"#1A1A1A", textSide:"#FFFFFF"}); }}>Anuluj</button>}
                  </div>
                </div>

                {/* PODGLĄD LIVE */}
                <div style={{ border: '1px solid var(--bo)', borderRadius: 12, overflow: 'hidden', background: nt.bg }}>
                   <div style={{ background: '#eee', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#666', borderBottom: '1px solid var(--bo)' }}>PODGLĄD NA ŻYWO</div>
                   <div style={{ display: 'flex', height: 200 }}>
                      <div style={{ width: 60, background: `linear-gradient(${nt.side1}, ${nt.side2})`, padding: 10 }}>
                         <div style={{ height: 6, width: '100%', background: nt.textSide, opacity: 0.2, marginBottom: 8, borderRadius: 2 }} />
                         <div style={{ height: 12, width: '100%', background: nt.accent, borderRadius: 4, marginBottom: 8 }} />
                         <div style={{ height: 6, width: '100%', background: nt.textSide, opacity: 0.2, borderRadius: 2 }} />
                      </div>
                      <div style={{ flex: 1, padding: 15 }}>
                         <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ height: 10, width: '60%', background: nt.primary, borderRadius: 2, marginBottom: 8 }} />
                            <div style={{ height: 6, width: '100%', background: '#eee', borderRadius: 2, marginBottom: 4 }} />
                            <div style={{ height: 6, width: '80%', background: '#eee', borderRadius: 2 }} />
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <h3 style={{ marginTop: 30 }}>Zapisane motywy organizacji</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {(LP.customThemes || []).map((t, i) => (
                  <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderLeft: `6px solid ${t.primary}` }}>
                    <div style={{ fontWeight: 600 }}>{t.emoji} {t.name}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-gh" onClick={() => { setEditIdx(i); setNt(t); }}>{I.edit} Edytuj</button>
                      <button className="btn-gh" style={{ color: '#C44' }} onClick={() => setSettings({ ...LP, customThemes: LP.customThemes.filter((_, idx) => idx !== i) })}>{I.trash} Usuń</button>
                    </div>
                  </div>
                ))}
                {(!LP.customThemes || LP.customThemes.length === 0) && <div style={{textAlign:'center', padding: 20, color: 'var(--tm)', fontSize: 13}}>Brak własnych motywów. Stwórz pierwszy powyżej!</div>}
              </div>
            </div>
          )}

          {/* ZAKŁADKA: STRONA WWW */}
          {activeSetTab === "landing" && (
            <div className="s-pane">
              <h3>Zawartość strony publicznej</h3>
              <div className="fg"><label className="fl">Hasło / Tagline</label><input className="fi" value={LP.landingTagline} onChange={e => setSettings({ ...LP, landingTagline: e.target.value })} /></div>
              <div className="fg"><label className="fl">E-mail kontaktowy</label><input className="fi" value={LP.landingContactEmail} onChange={e => setSettings({ ...LP, landingContactEmail: e.target.value })} /></div>
              <div className="fg"><label className="fl">Telefon</label><input className="fi" value={LP.landingContactPhone} onChange={e => setSettings({ ...LP, landingContactPhone: e.target.value })} /></div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--bo)" }}>
            <button className="btn btn-g" onClick={() => saveSettings(settings)}>
              {I.save} Zapisz wszystkie zmiany w bazie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}