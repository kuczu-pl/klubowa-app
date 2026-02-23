import React, { useState, useRef, useEffect } from 'react';
import { uName, ini, canManage } from '../utils/helpers';
import I from '../utils/icons';

export default function TacticsBoard({ event, users, user, onSave, onClose }) {
  const [positions, setPositions] = useState(event.tactics || {});
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  // Sprawdzamy uprawnienia edycji
  const cm = canManage(user.role);

  // Synchronizacja pionków z listą obecności
  useEffect(() => {
    const newPos = { ...positions };
    let changed = false;
    event.attendees?.forEach((uid, index) => {
      if (!newPos[uid]) {
        // Nowy zawodnik ląduje na dole boiska (ławka rezerwowych)
        newPos[uid] = { x: 15 + (index * 15) % 70, y: 92 };
        changed = true;
      }
    });
    if (changed) setPositions(newPos);
  }, [event.attendees]);

  const handleDragStart = (uid, e) => {
    if (!cm) return; // Jeśli nie admin, zablokuj drag
    e.preventDefault();
    setDragging(uid);
  };

  const handleMove = (e) => {
    if (!dragging || !containerRef.current || !cm) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Granice boiska
    x = Math.max(4, Math.min(96, x));
    y = Math.max(4, Math.min(96, y));

    setPositions(prev => ({ ...prev, [dragging]: { x, y } }));
  };

  const stopDrag = () => {
    if (dragging && cm) {
      onSave(event.id, positions);
      setDragging(null);
    }
  };

  return (
    <div className="mo" style={{ background: 'rgba(0,0,0,0.9)', zIndex: 10000 }} onMouseMove={handleMove} onTouchMove={handleMove} onMouseUp={stopDrag} onTouchEnd={stopDrag}>
      <div className="mod" style={{ maxWidth: '500px', width: '95vw', padding: 0, overflow: 'hidden', background: '#2d5a27', borderRadius: '20px' }}>
        
        {/* NAGŁÓWEK */}
        <div style={{ padding: '15px 20px', background: '#1a3a17', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{event.title}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              {cm ? "Przeciągaj zawodników, aby ustawić formację" : "Widok taktyczny (Tylko odczyt)"}
            </div>
          </div>
          <button className="btn-lo" onClick={onClose} style={{ color: '#fff' }}>{I.close}</button>
        </div>

        {/* BOISKO PIONOWE */}
        <div 
          ref={containerRef}
          style={{ 
            height: '75vh', 
            position: 'relative', 
            background: '#34802d',
            backgroundImage: 'linear-gradient(90deg, #2d7526 50%, #34802d 50%)',
            backgroundSize: '20% 100%',
            border: '5px solid #fff',
            margin: '15px',
            borderRadius: '10px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)'
          }}
        >
          {/* Linie boiska */}
          {/* Linia środkowa */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#fff', opacity: 0.6 }} />
          {/* Koło środkowe */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 100, height: 100, border: '3px solid #fff', borderRadius: '50%', opacity: 0.6 }} />
          
          {/* Pole karne góra */}
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '12%', border: '3px solid #fff', borderTop: 0, opacity: 0.6 }} />
          {/* Pole karne dół */}
          <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '12%', border: '3px solid #fff', borderBottom: 0, opacity: 0.6 }} />

          {/* Zawodnicy (Pionki) */}
          {event.attendees?.map(uid => {
            const pos = positions[uid] || { x: 50, y: 92 };
            // Goście (zaczynający się od "guest_") nie są formalnie przydzielani do drużyn A/B z bazy,
            // ale jeśli są na liście składy losowe to potraktują ich neutralnie.
            // Sprawdzamy, czy gość był zapisany do drużyny A.
            const isTeamA = event.teams?.teamA?.includes(uid);
            
            // Jeśli to gość, dla bezpieczeństwa dajmy mu neutralny kolor dopóki nie wylosuje go losowanie składów
            const isGuest = uid.startsWith('guest_');
            const color = isTeamA ? 'var(--p)' : 'var(--w)';

            return (
              <div
                key={uid}
                onMouseDown={(e) => handleDragStart(uid, e)}
                onTouchStart={(e) => handleDragStart(uid, e)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: cm ? (dragging === uid ? 'grabbing' : 'grab') : 'default',
                  zIndex: dragging === uid ? 100 : 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: dragging === uid ? 'none' : 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: 38, height: 38, borderRadius: '50%', 
                  background: color, color: isTeamA ? '#fff' : '#000', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 11, border: '3px solid #fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  overflow: 'hidden'
                }}>
                  {/* OBSŁUGA GOŚCI (G na koszulce, u normalnych graczy inicjały) */}
                  {isGuest ? "G" : ini(uName(users, uid))}
                </div>
                <div style={{ 
                  background: 'rgba(0,0,0,0.7)', color: '#fff', 
                  fontSize: 9, padding: '1px 5px', borderRadius: 4, 
                  marginTop: 4, whiteSpace: 'nowrap', fontWeight: 600
                }}>
                  {/* OBSŁUGA GOŚCI (Imię gościa wyciągnięte z ID lub imię gracza) */}
                  {isGuest ? uid.replace('guest_', '').substring(0, 10) : uName(users, uid).split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}