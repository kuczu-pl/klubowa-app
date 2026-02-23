import React from 'react';
import { avC, ini, ROLES, timeAgo } from '../utils/helpers';
import I from '../utils/icons';

export default function Messages({
  user, users, messages, settings, chatWith, setChatWith,
  msgText, setMsgText, msgBodyRef, sendMessage
}) {
  const isGroup = chatWith === "group_general";
  const activePartner = !isGroup ? users.find(u => u.id === chatWith) : null;
  
  // Logika filtrowania konwersacji
  const conv = isGroup
    ? messages.filter(m => m.to === "group_general")
    : messages.filter(m => (m.from === user.id && m.to === chatWith) || (m.from === chatWith && m.to === user.id));
  
  conv.sort((a, b) => a.date.localeCompare(b.date));

  const otherUsers = users.filter(u => u.id !== user.id);

  function handleSend() {
    if (!msgText.trim() || !chatWith) return;
    sendMessage(chatWith, msgText);
    setMsgText("");
  }

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelMessages || "Wiadomości"}</div>
          <div className="ps">Komunikacja wewnątrz {settings.orgName}</div>
        </div>
      </div>
      
      <div className="msg-layout">
        {/* Lista kontaktów */}
        <div className="msg-list">
          <div className="msg-list-hd">💬 Rozmowy</div>
          
          {/* CZAT GRUPOWY - Zawsze na górze */}
          <div 
            className={`msg-contact group${chatWith === "group_general" ? " active" : ""}`} 
            onClick={() => setChatWith("group_general")}
            style={{ borderBottom: "2px solid var(--bo)", marginBottom: 8 }}
          >
            <div className="msg-contact-av" style={{ background: "var(--p)", color: "#fff" }}>📢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="msg-contact-name" style={{ color: "var(--p)", fontWeight: 700 }}>
                {settings.orgName} (Ogólny)
              </div>
              <div className="msg-contact-preview">Czat całej drużyny</div>
            </div>
          </div>

          {otherUsers.length === 0 && (
            <div style={{ padding: "20px 16px", fontSize: 13, color: "var(--tm)", textAlign: "center" }}>
              Brak innych członków
            </div>
          )}

          {otherUsers.map(u => {
            const unread = messages.filter(m => m.from === u.id && m.to === user.id && !m.read).length;
            const last = [...messages.filter(m => (m.from === u.id && m.to === user.id) || (m.from === user.id && m.to === u.id))]
              .sort((a, b) => b.date.localeCompare(a.date))[0];
              
            return (
              <div key={u.id} className={`msg-contact${chatWith === u.id ? " active" : ""}`} onClick={() => setChatWith(u.id)}>
                <div className="msg-contact-av" style={{ background: avC(u.id) }}>{ini(u.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="msg-contact-name">{u.name}</div>
                  {last
                    ? <div className="msg-contact-preview">{last.from === user.id ? "Ty: " : ""}{last.text}</div>
                    : <div className="msg-contact-preview" style={{ fontStyle: "italic", opacity: .6 }}>Brak wiadomości</div>
                  }
                </div>
                {unread > 0 && <span className="msg-contact-badge">{unread}</span>}
              </div>
            );
          })}
        </div>

        {/* Okno rozmowy */}
        <div className="msg-conv">
          {!chatWith ? (
            <div className="msg-empty">
              <span className="msg-empty-icon">💬</span>
              <span style={{ fontSize: 14, color: "var(--tm)" }}>Wybierz rozmowę, aby zacząć pisać</span>
            </div>
          ) : (
            <>
              <div className="msg-conv-hd">
                <div style={{ 
                  width: 36, height: 36, borderRadius: "50%", 
                  background: isGroup ? "var(--p)" : avC(chatWith), 
                  display: "flex", alignItems: "center", justifyContent: "center", 
                  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 
                }}>
                  {isGroup ? "📢" : ini(activePartner?.name || "?")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {isGroup ? `${settings.orgName} - Ogólny` : (activePartner?.name || "Nieznany")}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--tm)" }}>
                    {isGroup ? "Wszyscy członkowie" : ROLES.find(r => r.value === activePartner?.role)?.label}
                  </div>
                </div>
              </div>

              <div className="msg-conv-body" ref={msgBodyRef}>
                {conv.length === 0 && (
                  <div className="msg-empty">
                    <span className="msg-empty-icon" style={{ fontSize: 32, opacity: .4 }}>👋</span>
                    <span style={{ fontSize: 13, color: "var(--tm)" }}>Przywitaj się!</span>
                  </div>
                )}
                {conv.map(m => {
                  const mine = m.from === user.id;
                  const sender = users.find(u => u.id === m.from);
                  return (
                    <div key={m.id} className={`msg-bubble-wrap ${mine ? "mine" : "theirs"}`}>
                      {!mine && isGroup && (
                        <div style={{ fontSize: 10, fontWeight: 600, marginLeft: 12, marginBottom: 2, color: "var(--p)" }}>
                          {sender?.name}
                        </div>
                      )}
                      <div className={`msg-bubble ${mine ? "mine" : "theirs"}`}>{m.text}</div>
                      <div className="msg-time">{timeAgo(m.date)}</div>
                    </div>
                  );
                })}
                {msgText.trim() && (
                  <div className="msg-bubble-wrap mine">
                    <div className="msg-bubble mine draft">{msgText}</div>
                    <div className="msg-time" style={{ opacity: .6 }}>piszesz…</div>
                  </div>
                )}
              </div>

              <div className="msg-inp">
                <input
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Napisz wiadomość..."
                />
                <button className="msg-send" onClick={handleSend}>{I.send} Wyślij</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}