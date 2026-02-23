import React from 'react';
import { canManage, fDate, uName } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';

export default function Polls({
  user, users, polls, settings, T,
  setModal, closePoll, delPoll, votePoll
}) {
  const cm = canManage(user.role);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelPolls || "Ankiety"}</div>
          <div className="ps">Głosuj i decyduj razem</div>
        </div>
        {cm && (
          <button className="btn btn-p" onClick={() => setModal("addPollModal")}>
            {I.plus} Nowa ankieta
          </button>
        )}
      </div>

      {polls.length === 0 && (
        <Empty 
          emoji="📊" 
          title="Brak ankiet" 
          desc="Utwórz pierwszą ankietę, żeby zebrać opinie członków." 
          action={cm ? "Nowa ankieta" : null} 
          onAction={() => setModal("addPollModal")} 
        />
      )}

      {[...polls].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
        const total = p.totalVoters?.length || 0;
        const now = new Date().toISOString().split("T")[0];
        const expired = p.deadline && p.deadline < now;
        const isClosed = p.closed || expired;

        return (
          <div key={p.id} className="poll-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div className="poll-title">{p.title}</div>
                <div className="poll-meta">
                  {fDate(p.date)} · {uName(users, p.authorId, settings.orgName)}
                  {isClosed && <span className="poll-closed-badge">🔒 Zamknięta</span>}
                  {p.multiSelect && !isClosed && <span style={{ fontSize: 11, color: T.primary, marginLeft: 8 }}>✓ Wielokrotny wybór</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {cm && !isClosed && (
                  <button className="btn btn-s" style={{ fontSize: 12 }} onClick={() => closePoll(p.id)}>Zamknij</button>
                )}
                {cm && (
                  <button className="btn-gh" onClick={() => delPoll(p.id)} style={{ color: "#C44", padding: 3 }}>{I.trash}</button>
                )}
              </div>
            </div>

            {p.description && <div style={{ fontSize: 13, color: "var(--tm)", margin: "8px 0" }}>{p.description}</div>}
            
            <div style={{ margin: "12px 0" }}>
              {p.options.map(opt => {
                const pct = total ? Math.round((opt.voters.length / total) * 100) : 0;
                const voted = opt.voters.includes(user.id);
                return (
                  <div 
                    key={opt.id} 
                    className={`poll-option${voted ? " voted" : ""}${isClosed ? " closed" : ""}`}
                    onClick={() => !isClosed && votePoll(p.id, opt.id)}
                  >
                    <div className="poll-bar" style={{ width: isClosed || total > 0 ? `${pct}%` : "0%" }} />
                    <span className="poll-option-text">{opt.text}</span>
                    {voted && <span className="poll-option-check">{I.check}</span>}
                    {(isClosed || total > 0) && <span className="poll-option-pct">{pct}%</span>}
                  </div>
                );
              })}
            </div>

            <div className="poll-deadline">
              👥 {total} {total === 1 ? "głos" : total < 5 ? "głosy" : "głosów"}
              {p.deadline && <span style={{ marginLeft: 8 }}>· ⏰ do {fDate(p.deadline)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}