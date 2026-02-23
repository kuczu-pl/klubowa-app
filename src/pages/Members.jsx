import React from 'react';
import { canManage, avC, ini, ROLES, fDate } from '../utils/helpers';
import I from '../utils/icons';

export default function Members({
  user, users, exportMembersCSV, setChatWith, setTab, updatePlayerRating
}) {
  const cm = canManage(user.role);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">Członkowie</div>
          <div className="ps">{users.length} osób w organizacji</div>
        </div>
        {cm && (
          <button className="btn btn-s" onClick={exportMembersCSV}>
            {I.download} Eksport CSV
          </button>
        )}
      </div>

      <div className="mg">
        {users.map((m, i) => (
          <div key={m.id} className="mc" style={{ animationDelay: `${i * .04}s`, position: 'relative' }}>
            <div className="mav" style={{ background: avC(m.id) }}>
              {ini(m.name)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="mn">{m.name}</div>
              <div className="mr">
                <span className={`tag tag-r tag-${m.role}`}>
                  {ROLES.find(r => r.value === m.role)?.label}
                </span>
              </div>

              {/* SEKRETY ADMINA: SYSTEM OCEN */}
              {cm && (
                <div style={{ 
                  marginTop: 10, 
                  paddingTop: 8, 
                  borderTop: '1px solid var(--bo)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--tm)', letterSpacing: 0.5 }}>
                    Poziom zawodnika (ukryte)
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlayerRating(m.id, star);
                        }}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', 
                          padding: '2px 0', fontSize: 18, 
                          color: star <= (m.rating || 0) ? '#EDBB00' : '#E0E0E0',
                          transition: 'transform 0.1s'
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                {m.phone && <div className="mco">📞 {m.phone}</div>}
                <div className="mco">✉️ {m.email}</div>
                <div className="mco" style={{ fontSize: 10.5, marginTop: 2, opacity: 0.7 }}>
                  W klubie od: {fDate(m.joined)}
                </div>
              </div>

              <button 
                className="btn-gh" 
                style={{ marginTop: 10, fontSize: 12, padding: '4px 0' }} 
                onClick={() => { 
                  setChatWith(m.id); 
                  setTab("messages"); 
                }}
              >
                {I.chatSm} Wyślij wiadomość
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}