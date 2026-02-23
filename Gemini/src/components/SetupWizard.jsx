import React, { useState } from 'react';
import { APP_PRESETS } from '../utils/helpers';
import I from '../utils/icons';
// Nowe importy niezbędne do zapisania Logo
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  
  // Stany dla LOGO
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [config, setConfig] = useState({
    presetId: null,
    orgName: "",
    orgLocation: "",
    orgGmina: "",
    landingTagline: "Dołącz do naszej społeczności!",
    dueCurrency: "PLN",
    dueAmount: 15,
    modules: {},
    labels: {},
    themePrimary: "#2A3F52"
  });

  const preset = APP_PRESETS.find(p => p.id === config.presetId);

  const handleSelectPreset = (pId) => {
    const selected = APP_PRESETS.find(p => p.id === pId);
    setConfig({
      ...config,
      presetId: pId,
      modules: selected.modules,
      labels: selected.labels
    });
    setStep(2); 
  };

  const finishSetup = async () => {
    setIsUploading(true);
    let finalLogoUrl = "";

    // 1. PROCES WGRYWANIA LOGO DO FIREBASE
    if (logoFile) {
      try {
        const sRef = ref(storage, `org/logo_${Date.now()}.png`);
        await uploadBytes(sRef, logoFile);
        finalLogoUrl = await getDownloadURL(sRef);
      } catch (e) {
        console.error("Błąd wgrywania logo:", e);
      }
    }

    // 2. GENEROWANIE MOTYWU
    const customTheme = {
      name: "Główny Motyw",
      emoji: preset?.emoji || "🎨",
      primary: config.themePrimary,
      primaryDark: config.themePrimary, 
      accent: "#EDBB00",
      accentLight: "#EDBB0033",
      bg: "#F8F9FA",
      side1: config.themePrimary,
      side2: "#1A1A1A",
      text: "#1A1A1A",
      textSide: "#FFFFFF",
      banner: `linear-gradient(135deg, ${config.themePrimary}, #1A1A1A)`
    };

    // 3. SKŁADANIE OSTATECZNEGO OBIEKTU (TYLKO JEDEN RAZ!)
    const finalSettings = {
      orgName: config.orgName || "Nowa Organizacja",
      orgLocation: config.orgLocation || "",
      orgGmina: config.orgGmina || "",
      landingTagline: config.landingTagline,
      dueCurrency: config.dueCurrency,
      dueAmount: Number(config.dueAmount),
      ...config.modules,
      ...config.labels,
      // Zapis kategorii sportowych (Taktyka, Trening itp.)
      recipeFields: preset?.recipeFields || APP_PRESETS[5].recipeFields,
      customThemes: [customTheme],
      ...(finalLogoUrl ? { orgLogoUrl: finalLogoUrl } : {}),
      setupCompleted: true 
    };

    onComplete(finalSettings);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F4F8FB', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: 20 }}>
      <div className="card" style={{ maxWidth: 650, width: '100%', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', gap: 6, marginBottom: 30 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ height: 5, flex: 1, background: s <= step ? 'var(--p)' : '#eee', borderRadius: 4, transition: '0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>Witaj w konfiguratorze! 👋</h2>
            <p style={{ color: 'var(--tm)', marginBottom: 25, lineHeight: 1.5, fontSize: 15 }}>Wybierz profil, który najlepiej do Was pasuje:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {APP_PRESETS.map(p => (
                <div key={p.id} onClick={() => handleSelectPreset(p.id)} style={{ border: '2px solid', borderColor: config.presetId === p.id ? 'var(--p)' : 'var(--bo)', borderRadius: 12, padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, background: config.presetId === p.id ? 'var(--cr)' : '#fff', transition: '0.2s', textAlign: 'center' }}>
                  <div style={{ fontSize: 36 }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--tm)', marginTop: 4 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>{preset?.emoji} Profil Organizacji</h2>
            <p style={{ color: 'var(--tm)', marginBottom: 25, fontSize: 15 }}>Podstawowe informacje o organizacji ({preset?.name}).</p>
            
            <div className="fg">
              <label className="fl">Pełna nazwa (np. FC Ceradz)</label>
              <input className="fi" autoFocus value={config.orgName} onChange={e => setConfig({...config, orgName: e.target.value})} placeholder="Wpisz nazwę..." />
            </div>

            <div className="fg" style={{ marginTop: 20 }}>
              <label className="fl">Logo / Herb (opcjonalnie)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ width: 70, height: 70, borderRadius: 16, background: '#f0f0f0', border: '2px dashed var(--bo)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {logoPreview ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo Preview" /> : <span style={{ fontSize: 24, opacity: 0.3 }}>🖼️</span>}
                </div>
                <div>
                  <label className="btn btn-s" style={{ cursor: 'pointer', marginBottom: 4, display: 'inline-block' }}>
                    {I.upload} Wgraj plik z dysku
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
                    }} />
                  </label>
                  <div style={{ fontSize: 11, color: 'var(--tm)' }}>Formaty: PNG, JPG (zalecany kwadrat)</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 15 }}>
              <div className="fg"><label className="fl">Miejscowość</label><input className="fi" value={config.orgLocation} onChange={e => setConfig({...config, orgLocation: e.target.value})} /></div>
              <div className="fg"><label className="fl">Gmina/Powiat</label><input className="fi" value={config.orgGmina} onChange={e => setConfig({...config, orgGmina: e.target.value})} /></div>
            </div>
            <div className="fg">
              <label className="fl">Krótkie motto</label>
              <input className="fi" value={config.landingTagline} onChange={e => setConfig({...config, landingTagline: e.target.value})} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>⚙️ Konfiguracja Modułów</h2>
            <p style={{ color: 'var(--tm)', marginBottom: 20, fontSize: 15 }}>Wybierz moduły, które mają być dostępne.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 25 }}>
              {[
                { k: 'modDues', l: preset?.labels?.labelDues || "Składki" },
                { k: 'modEvents', l: preset?.labels?.labelEvents || "Kalendarz" },
                { k: 'modRecipes', l: preset?.labels?.labelRecipes || "Zasoby" },
                { k: 'modIdeas', l: preset?.labels?.labelIdeas || "Wnioski" },
                { k: 'modGallery', l: "Galeria Zdjęć" },
                { k: 'modDocuments', l: "Dokumenty" }
              ].map(m => (
                <label key={m.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: config.modules[m.k] ? '#F4F8FB' : '#f8f9fa', border: `1px solid ${config.modules[m.k] ? 'var(--p)' : '#eee'}`, borderRadius: 8, cursor: 'pointer' }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{m.l}</span>
                  <input type="checkbox" checked={config.modules[m.k]} onChange={e => setConfig({...config, modules: {...config.modules, [m.k]: e.target.checked}})} style={{ transform: 'scale(1.2)' }} />
                </label>
              ))}
            </div>
            {config.modules.modDues && (
              <div style={{ background: '#F4F8FB', padding: 20, borderRadius: 8, border: '1px solid var(--p)' }}>
                <h4 style={{ marginBottom: 12, fontSize: 15, color: 'var(--pd)' }}>Ustawienia Finansowe</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="fg"><label className="fl">Waluta</label><input className="fi" value={config.dueCurrency} onChange={e => setConfig({...config, dueCurrency: e.target.value})} /></div>
                  <div className="fg"><label className="fl">Kwota domyślna</label><input className="fi" type="number" value={config.dueAmount} onChange={e => setConfig({...config, dueAmount: e.target.value})} /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 26, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>🎨 Tożsamość wizualna</h2>
            <p style={{ color: 'var(--tm)', marginBottom: 25, fontSize: 15 }}>Wybierz główny kolor aplikacji.</p>
            <div className="fg" style={{ textAlign: 'center', padding: '20px 0' }}>
              <input type="color" value={config.themePrimary} onChange={e => setConfig({...config, themePrimary: e.target.value})} style={{ width: 120, height: 120, padding: 0, border: 'none', borderRadius: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
              <div style={{ marginTop: 15, fontWeight: 600, color: config.themePrimary }}>{config.themePrimary}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 20, borderTop: '1px solid #eee' }}>
          {step > 1 ? <button className="btn btn-s" onClick={() => setStep(step - 1)} disabled={isUploading}>Wstecz</button> : <div />}
          {step < 4 ? (
            <button className="btn btn-p" onClick={() => { if(step === 2 && !config.orgName) { alert("Wpisz nazwę organizacji!"); return; } setStep(step + 1); }} style={{ padding: '0 30px' }}>
              Dalej {I.chevronRight}
            </button>
          ) : (
            <button className="btn btn-g" onClick={finishSetup} disabled={isUploading} style={{ fontWeight: 700, fontSize: 16, padding: '0 30px' }}>
              {isUploading ? "Tworzenie bazy... ⏳" : "Zakończ i uruchom aplikację! 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}