import React from 'react';
import { canManage, uName, MO_PL, MO_S, balanceTeams } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';
import WeatherBadge from '../components/WeatherBadge';

export default function Events({
  user, users, events, settings, calView, setCalView, calMonth, setCalMonth,
  setModal, openEdit, delEvent, toggleRSVP, saveMatchTeams, setTacticsEvent, resolveCancellation, toggleEquipment, toggleEventPayment
}) {
  const s = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const cm = canManage(user.role);
  const today = new Date().toISOString().split("T")[0];
  const [showMap, setShowMap] = React.useState(null);

  function CalGrid() {
    const { y, m } = calMonth;
    const first = new Date(y, m, 1).getDay(); 
    const startOffset = (first + 6) % 7; 
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    
    for (let i = 0; i < startOffset; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push({ day: null });
    
    const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"];
    const monthStr = `${y}-${String(m + 1).padStart(2, "0")}`;
    
    return (
      <>
        <div className="cal-nav">
          <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
          <div className="cal-nav-title">{MO_PL[m]} {y}</div>
          <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
        </div>
        <div className="cal-grid">
          {dayNames.map(d => <div key={d} className="cal-hd">{d}</div>)}
          {cells.map((c, i) => {
            if (!c.day) return <div key={i} className="cal-day other-month" />;
            const dateStr = `${monthStr}-${String(c.day).padStart(2, "0")}`;
            const dayEvents = s.filter(e => e.date === dateStr);
            const isToday = dateStr === today;
            
            return (
              <div key={i} className={`cal-day${isToday ? " today" : ""}`}>
                <div className="cal-day-num">{c.day}</div>
                {dayEvents.map(e => (
                  <div key={e.id} className="cal-event-dot" title={`${e.time} ${e.place}`}>
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelEvents || "Kalendarz"}</div>
          <div className="ps">Wydarzenia i mecze {settings.orgName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="view-toggle">
            <button className={!calView ? "active" : ""} onClick={() => setCalView(false)}>{I.list} Lista</button>
            <button className={calView ? "active" : ""} onClick={() => setCalView(true)}>{I.grid} Siatka</button>
          </div>
          {cm && <button className="btn btn-p" onClick={() => setModal("addEvent")}>{I.plus} Dodaj</button>}
        </div>
      </div>
      
      {calView ? (
        <CalGrid />
      ) : s.length > 0 ? (
        <div style={{ display: "grid", gap: 16 }}>
          {s.map((e, i) => {
            const d = new Date(e.date);
            const past = e.date < today;
            const att = e.attendees || [];
            const isGoing = att.includes(user.id);
            const pend = e.pendingCancellations || [];
            const isPending = pend.includes(user.id);
            const teams = e.teams; 
            const paidList = e.paid || [];
            const reserve = e.reserve || [];
            const isReserve = reserve.includes(user.id);
            const limit = e.limit || 0;
            const isFull = limit > 0 && att.length >= limit;
            
            return (
              <div key={e.id} className="card" style={{ animationDelay: `${i * .04}s`, opacity: past ? .7 : 1 }}>
                <div className="ei" style={{ border: 'none', padding: 0 }}>
                  <div className="edb">
                    <div className="edd">{d.getDate()}</div>
                    <div className="edm">{MO_S[d.getMonth()]}</div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700 }}>{e.title}</div>
                      {/* POGODA */}
                      <WeatherBadge place={e.place} date={e.date} time={e.time} />
                    </div>
                    
                    {/* INFO: CZAS, MIEJSCE, MAPA */}
                    <div style={{ fontSize: 13, color: "var(--tm)", display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                      <span>🕐 {e.time}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📍</span>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.place)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--p)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {e.place}
                        </a>
                        <button 
                          onClick={() => setShowMap(showMap === e.id ? null : e.id)}
                          style={{ background: 'none', border: 'none', fontSize: 11, color: '#666', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginLeft: 4 }}
                        >
                          {showMap === e.id ? "(ukryj mapę)" : "(pokaż mapę)"}
                        </button>
                      </div>
                    </div>

                    {showMap === e.id && (
                      <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--bo)', height: 200 }}>
                        <iframe
                          width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(e.place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      {!past && (
                        <button 
                          className={`rsvp-btn ${isGoing ? (isPending ? "pending-btn" : "on") : isReserve ? "reserve-btn" : ""}`} 
                          onClick={() => toggleRSVP(e.id)}
                          style={
                            isPending ? { background: '#f5a623', color: '#fff', border: 'none' } : 
                            isReserve ? { background: '#17a2b8', color: '#fff', border: 'none' } : 
                            (isFull && !isGoing) ? { background: '#6c757d', color: '#fff', border: 'none' } : {}
                          }
                        >
                          {isPending ? "⏳ Oczekuje na wypisanie" : 
                           isGoing ? <>{I.check} Biorę udział</> : 
                           isReserve ? "Zrezygnuj z rezerwy" : 
                           isFull ? "Trafisz na listę rezerwową" : "🙋 Wezmę udział"}
                        </button>
                      )}
                    </div>

                    {/* INTERAKTYWNA LISTA SKŁADU */}
                    {(att.length > 0 || reserve.length > 0) && (
                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {att.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--tm)' }}>
                              👥 Podstawowy skład ({limit > 0 ? `${att.length}/${limit}` : att.length}):
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {att.map((uid, idx) => {
  const isPaid = paidList.includes(uid);
  // Definiujemy, czy pokazywać status finansowy (tylko dla zarządu/skarbnika/admina)
  const showFin = cm; 
  
  return (
    <button
      key={uid}
      onClick={() => cm ? toggleEventPayment(e.id, uid) : null}
      style={{
        padding: '4px 10px',
        fontSize: 12,
        borderRadius: 16,
        // Dla członka (!showFin) wymuszamy neutralne ramki i tła
        border: `1px solid ${showFin ? (isPaid ? '#28a745' : 'rgba(220, 53, 69, 0.4)') : 'var(--bo)'}`,
        background: showFin ? (isPaid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.05)') : '#fff',
        color: showFin ? (isPaid ? '#155724' : '#721c24') : 'var(--tm)',
        cursor: cm ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s'
      }}
    >
      {/* Kolorowe kółko wyświetlamy tylko uprawnionym rolom */}
      {showFin && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPaid ? '#28a745' : '#dc3545' }} />
      )}
      {idx + 1}. {uName(users, uid)}
    </button>
  );
})}
                            </div>
                          </div>
                        )}

                        {reserve.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#17a2b8' }}>
                              ⏳ Lista Rezerwowa ({reserve.length}):
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {reserve.map((uid, idx) => (
                                <div key={uid} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 16, border: '1px solid #17a2b8', background: 'rgba(23, 162, 184, 0.1)', color: '#0c5460' }}>
                                  {idx + 1}. {uName(users, uid)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SPRZĘT NA MECZ */}
                    <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--al)', borderRadius: 12, border: '1px solid var(--bo)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--tm)' }}>🎒 Sprzęt na mecz (kto zabiera?):</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleEquipment(e.id, 'ball')}
                          className="btn btn-s"
                          style={{
                            background: e.equipment?.ball === user.id ? 'var(--p)' : e.equipment?.ball ? '#fff' : '#fff',
                            color: e.equipment?.ball === user.id ? '#fff' : e.equipment?.ball ? 'var(--tm)' : '#e74c3c',
                            border: e.equipment?.ball === user.id ? 'none' : e.equipment?.ball ? '1px solid var(--bo)' : '1px dashed #e74c3c',
                          }}
                        >
                          ⚽ Piłka: {e.equipment?.ball ? uName(users, e.equipment.ball) : "Brak chętnego!"}
                        </button>
                        <button
                          onClick={() => toggleEquipment(e.id, 'bibs')}
                          className="btn btn-s"
                          style={{
                            background: e.equipment?.bibs === user.id ? 'var(--p)' : e.equipment?.bibs ? '#fff' : '#fff',
                            color: e.equipment?.bibs === user.id ? '#fff' : e.equipment?.bibs ? 'var(--tm)' : '#e74c3c',
                            border: e.equipment?.bibs === user.id ? 'none' : e.equipment?.bibs ? '1px solid var(--bo)' : '1px dashed #e74c3c',
                          }}
                        >
                          🎽 Znaczniki: {e.equipment?.bibs ? uName(users, e.equipment.bibs) : "Brak chętnego!"}
                        </button>
                      </div>
                    </div>

                    {cm && pend.length > 0 && !past && (
                      <div style={{ marginTop: 10, background: '#fff3cd', border: '1px solid #ffeeba', padding: '10px 14px', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#856404', marginBottom: 6 }}>⚠️ Prośby o wypisanie (<span style={{color: "red"}}>wymagana decyzja</span>):</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {pend.map(uid => (
                            <div key={uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                              <span style={{ fontWeight: 600 }}>{uName(users, uid)}</span>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-s" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 11 }} onClick={() => resolveCancellation(e.id, uid, true)}>Zgoda</button>
                                <button className="btn btn-s" style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 11 }} onClick={() => resolveCancellation(e.id, uid, false)}>Odrzuć</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 4 }}>
                    {cm && (
                      <button 
                        className="btn-gh" 
                        onClick={() => setModal({ type: "importMessenger", eventId: e.id })} 
                        style={{ padding: 6, color: "#8a2be2", fontWeight: 600 }} 
                        title="Skanuj i dodaj automatycznie z Messengera"
                      >
                        🤖 Skaner
                      </button>
                    )}
                    {cm && (
                      <button className="btn-gh" onClick={() => setModal({ type: "addEventDue", eventId: e.id })} style={{ padding: 6, color: "var(--p)" }} title="Rozlicz">{I.wallet}</button>
                    )}
                    {cm && <button className="btn-gh" onClick={() => openEdit("event", e)} style={{ padding: 6 }}>{I.edit}</button>}
                    {cm && <button className="btn-gh" onClick={() => delEvent(e.id)} style={{ color: "#C44", padding: 6 }}>{I.trash}</button>}
                  </div>
                </div>

                {/* SEKCJA SKŁADÓW I TAKTYKI */}
                {att.length >= 2 && (
                  <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--bo)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>⚽</span>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Składy na mecz</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(cm || e.tactics) && (
                          <button 
                            className="btn btn-s" 
                            style={{ 
                              fontSize: 11, 
                              padding: '5px 12px',
                              background: !cm ? 'var(--al)' : undefined, 
                              color: !cm ? 'var(--p)' : undefined
                            }} 
                            onClick={() => setTacticsEvent(e)}
                          >
                            {I.grid} {cm ? "Ustaw taktykę" : "Zobacz taktykę"}
                          </button>
                        )}
                        {cm && (
                          <button 
                            className="btn btn-s" 
                            style={{ fontSize: 11, padding: '5px 12px' }} 
                            onClick={() => setModal({ 
                              type: "balanceSettings", 
                              eventId: e.id, 
                              attendees: att 
                            })}
                          >
                            {I.refresh} Losuj składy
                          </button>
                        )}
                      </div>
                    </div>

                    {teams ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ background: 'var(--al)', padding: 14, borderRadius: 12, border: '1px solid var(--bo)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ color: 'var(--p)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>Ekipa A</span>
                            {cm && <span style={{ fontSize: 10, background: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>💪 {teams.powerA} pkt</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {teams.teamA.map(uid => (
                              <div key={uid} style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--p)' }} />
                                {uName(users, uid)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div style={{ background: 'rgba(196, 107, 62, 0.05)', padding: 14, borderRadius: 12, border: '1px solid var(--bo)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ color: 'var(--w)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>Ekipa B</span>
                            {cm && <span style={{ fontSize: 10, background: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>💪 {teams.powerB} pkt</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {teams.teamB.map(uid => (
                              <div key={uid} style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--w)' }} />
                                {uName(users, uid)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', background: 'var(--cr)', borderRadius: 12, fontSize: 13, color: 'var(--tm)', border: '1px dashed var(--bo)' }}>
                        Składy nie zostały jeszcze wylosowane.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty 
          emoji="📅" 
          title="Brak wydarzeń" 
          desc="Zaplanuj pierwszy termin i zaproś innych." 
          action={cm ? "Dodaj wydarzenie" : null} 
          onAction={() => setModal("addEvent")}
        />
      )}
    </div>
  );
}