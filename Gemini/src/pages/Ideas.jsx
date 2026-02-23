import React from 'react';
import { canManage, fDate, uName } from '../utils/helpers';
import I from '../utils/icons';
import CommentSection from '../components/CommentSection';
import Empty from '../components/Empty';

export default function Ideas({
  user, users, ideas, comments, settings, ideaFilter, setIdeaFilter,
  setModal, openEdit, setIdeaStatus, voteIdea, delIdea,
  addComment, delComment
}) {
  let s = [...ideas].sort((a, b) => b.votes - a.votes);
  if (ideaFilter !== "all") s = s.filter(i => i.status === ideaFilter);
  const cm = canManage(user.role);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelIdeas || "Skrzynka Pomysłów"}</div>
          <div className="ps">Proponuj i głosuj</div>
        </div>
        <button className="btn btn-p" onClick={() => setModal("addIdea")}>
          {I.plus} Zaproponuj
        </button>
      </div>

      <div className="filter-bar">
        {["all", "nowy", "zaakceptowany", "zrealizowany"].map(f => (
          <button 
            key={f} 
            className={`filter-btn${ideaFilter === f ? " on" : ""}`} 
            onClick={() => setIdeaFilter(f)}
          >
            {f === "all" ? "Wszystkie" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {s.map((idea, i) => (
        <div key={idea.id} className="card" style={{ animationDelay: `${i * .04}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                <span className={`tag tag-${idea.status === "zaakceptowany" ? "acc" : idea.status === "zrealizowany" ? "done" : "new"}`}>
                  {idea.status}
                </span>
                {cm && (
                  <select 
                    value={idea.status} 
                    onChange={e => setIdeaStatus(idea.id, e.target.value)} 
                    style={{ fontSize: 11, padding: "2px 6px", border: "1px solid var(--bo)", borderRadius: 4, background: "#fff", cursor: "pointer" }}
                  >
                    <option value="nowy">Nowy</option>
                    <option value="zaakceptowany">Zaakceptowany</option>
                    <option value="zrealizowany">Zrealizowany</option>
                  </select>
                )}
              </div>
              <div className="ct">{idea.title}</div>
              <div className="cm">{fDate(idea.date)} · {uName(users, idea.authorId, settings.orgName)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button 
                className={`btn-v${idea.voters.includes(user.id) ? " on" : ""}`} 
                onClick={() => voteIdea(idea.id)}
              >
                {I.vote} {idea.votes}
              </button>
              {(cm || idea.authorId === user.id) && (
                <button className="btn-gh" onClick={() => openEdit("idea", idea)} title="Edytuj" style={{ padding: 3 }}>
                  {I.edit}
                </button>
              )}
              {(cm || idea.authorId === user.id) && (
                <button className="btn-gh" onClick={() => delIdea(idea.id)} style={{ padding: 3, color: "#C44" }}>
                  {I.trash}
                </button>
              )}
            </div>
          </div>
          <div className="cb">{idea.description}</div>
          <CommentSection 
            type="idea" 
            contentId={idea.id} 
            comments={comments} 
            onAdd={addComment} 
            onDel={delComment} 
            users={users} 
            userId={user.id} 
            canMng={cm} 
          />
        </div>
      ))}

      {s.length === 0 && (
        <Empty 
          emoji="💡" 
          title="Brak pomysłów" 
          desc="Zaproponuj coś nowego! Każdy członek może zgłosić pomysł." 
          action="Zaproponuj pomysł" 
          onAction={() => setModal("addIdea")} 
        />
      )}
    </div>
  );
}