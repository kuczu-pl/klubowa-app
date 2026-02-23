import React from 'react';
import { MO_S, mName, uName, fDate } from '../utils/helpers';
import I from '../utils/icons';

export default function Dashboard({ 
  user, users, settings, dues, news, events, ideas, recipes, T, 
  setTab, duesAlert, setDuesAlert, addBulkDues, canSeeDues 
}) {
  const tp = dues.filter(d => d.paid).reduce((s, d) => s + d.amount, 0);
  const sn = [...news].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));
  const ue = events.filter(e => e.date >= new Date().toISOString().split("T")[0]).slice(0, 3);
  const ti = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const myUnpaid = dues.filter(d => d.userId === user.id && !d.paid).length;

  return (
    <div>
      <div className="wb">
        {/* Usunięto na sztywno wpisane "Koło" na rzecz nazwy organizacji lub powitania ogólnego */}
        <div className="wt">Witajcie w {settings.orgName}! {T.emoji}</div>
        {/* Tagline pobierany z ustawień Landing Page (White-label) */}
        <div className="wtt">{settings.orgLocation ? `${settings.orgName} w ${settings.orgLocation}` : settings.orgName} — {settings.landingTagline}</div>
        
        <div className="qs">
          <div className="qsi">
            <div className="qsv">{users.length}</div>
            <div className="qsl">{settings.labelMembers || "Członkowie"}</div>
          </div>
          
          {settings.modDues !== false && (
            <div className="qsi">
              <div className="qsv">{tp} {settings.dueCurrency}</div>
              <div className="qsl">Suma wpłat</div>
            </div>
          )}
          
          {settings.modIdeas !== false && (
            <div className="qsi">
              <div className="qsv">{ideas.length}</div>
              <div className="qsl">{settings.labelIdeas || "Pomysły"}</div>
            </div>
          )}
          
          {settings.modRecipes !== false && (
            <div className="qsi">
              <div className="qsv">{recipes.length}</div>
              <div className="qsl">{settings.labelRecipes || "Zasoby"}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Alert składek — dynamiczny tytuł zakładki Skarbnik */}
      {duesAlert && canSeeDues(user.role) && (
        <div className="dues-banner">
          <span className="dues-banner-icon">📅</span>
          <div className="dues-banner-txt">
            <div className="dues-banner-title">Rozliczenia za {mName(duesAlert.month)} — wymagają uwagi</div>
            <div className="dues-banner-sub">Brak przypisanych pozycji dla {duesAlert.count} osób w tym miesiącu.</div>
          </div>
          <div className="dues-banner-actions">
            <button className="btn btn-p" onClick={async () => {
              await addBulkDues({ month: duesAlert.month, amount: settings.dueAmount });
              setDuesAlert(null);
            }}>✓ Nalicz teraz</button>
            <button className="btn btn-s" onClick={() => { setTab("dues"); setDuesAlert(null); }} style={{ fontSize: 12.5 }}>Przejdź do: {settings.labelDues}</button>
            <button className="btn-gh" onClick={() => setDuesAlert(null)} title="Zamknij" style={{ padding: "4px 8px", fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          {/* Tytuł sekcji pobierany z ustawień etykiet */}
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 8 }}>📰 {settings.labelNews || "Aktualności"}</h3>
          {sn.slice(0, 3).map(n => (
            <div key={n.id} className={`card${n.pinned ? " pin" : ""}`} style={{ padding: 12, cursor: "pointer" }} onClick={() => setTab("news")}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                {n.pinned && <span style={{ color: "var(--w)" }}>{I.pin}</span>}
                <span className={`tag tag-${n.category === "wydarzenie" ? "ev" : n.category === "ogłoszenie" ? "an" : "nw"}`}>{n.category}</span>
              </div>
              <div className="ct" style={{ fontSize: 13.5 }}>{n.title}</div>
              <div className="cm">{fDate(n.date)} · {uName(users, n.authorId, settings.orgName)}</div>
            </div>
          ))}
          {sn.length === 0 && <div className="card" style={{ padding: 14, textAlign: "center", color: "var(--tm)" }}>Brak nowych wpisów</div>}
        </div>
        
        <div>
          {/* Tytuł sekcji Kalendarza */}
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 8 }}>📅 {settings.labelEvents || "Nadchodzące"}</h3>
          {ue.map(e => {
            const d = new Date(e.date); return (
              <div key={e.id} className="card" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <div className="edb" style={{ width: 44, height: 44, borderRadius: 7 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 9, textTransform: "uppercase", opacity: .9 }}>{MO_S[d.getMonth()]}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--tm)" }}>{e.time} · {e.place}</div>
                </div>
              </div>
            );
          })}
          
          {settings.modIdeas !== false && <>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, margin: "14px 0 8px" }}>💡 {settings.labelIdeas || "Propozycje"}</h3>
            {ti.map(i => (
              <div key={i.id} className="card" style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{i.title}</div><div style={{ fontSize: 11.5, color: "var(--tm)" }}>{uName(users, i.authorId, settings.orgName)}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#4A7C59", fontWeight: 600, fontSize: 13 }}>{I.vote} {i.votes}</div>
              </div>
            ))}
          </>}
        </div>
      </div>
      
      {myUnpaid > 0 && (
        <div className="card" style={{ marginTop: 16, borderLeft: "4px solid var(--w)", background: T.accentLight + "33" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Masz nieuregulowane płatności ({myUnpaid})</div>
              <div style={{ fontSize: 12.5, color: "var(--tm)" }}>Szczegóły znajdziesz w zakładce: {settings.labelDues}.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}