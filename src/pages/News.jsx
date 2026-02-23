import React from 'react';
import { fDate, uName, canManage } from '../utils/helpers';
import I from '../utils/icons';
import CommentSection from '../components/CommentSection';
import Empty from '../components/Empty';

export default function News({
  user, users, news, settings, comments, newsFilter, setNewsFilter,
  setModal, openEdit, togPin, delNews, addComment, delComment
}) {
  let s = [...news].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));
  if (newsFilter !== "all") s = s.filter(n => n.category === newsFilter);
  const cm = canManage(user.role);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelNews}</div>
          <div className="ps">Ogłoszenia i wiadomości z życia Koła</div>
        </div>
        <button className="btn btn-p" onClick={() => setModal("addNews")}>{I.plus} Dodaj</button>
      </div>
      
      <div className="filter-bar">
        {["all", "aktualność", "ogłoszenie", "wydarzenie"].map(f => (
          <button 
            key={f} 
            className={`filter-btn${newsFilter === f ? " on" : ""}`} 
            onClick={() => setNewsFilter(f)}
          >
            {f === "all" ? "Wszystkie" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {s.map((n, i) => (
        <div key={n.id} className={`card${n.pinned ? " pin" : ""}`} style={{ animationDelay: `${i * .04}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                {n.pinned && <span style={{ color: "var(--w)" }}>{I.pin}</span>}
                <span className={`tag tag-${n.category === "wydarzenie" ? "ev" : n.category === "ogłoszenie" ? "an" : "nw"}`}>
                  {n.category}
                </span>
              </div>
              <div className="ct">{n.title}</div>
              <div className="cm">{fDate(n.date)} · {uName(users, n.authorId, settings.orgName)}</div>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {(cm || n.authorId === user.id) && (
                <button className="btn-gh" onClick={() => openEdit("news", n)} title="Edytuj" style={{ padding: 3 }}>{I.edit}</button>
              )}
              {cm && (
                <>
                  <button className="btn-gh" onClick={() => togPin(n.id)} title="Przypnij" style={{ padding: 3 }}>{I.pin}</button>
                  <button className="btn-gh" onClick={() => delNews(n.id)} style={{ padding: 3, color: "#C44" }}>{I.trash}</button>
                </>
              )}
            </div>
          </div>
          <div className="cb">{n.content}</div>
          <CommentSection 
            type="news" 
            contentId={n.id} 
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
          emoji="📰" 
          title="Brak aktualności" 
          desc="Dodaj pierwszą aktualność, żeby poinformować członków Koła o ważnych sprawach." 
          action="Dodaj aktualność" 
          onAction={() => setModal("addNews")}
        />
      )}
    </div>
  );
}