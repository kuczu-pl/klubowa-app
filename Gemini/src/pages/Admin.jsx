import React from 'react';
import { ROLES } from '../utils/helpers';
import I from '../utils/icons';

export default function Admin({
  user, users, news, ideas, recipes, events, gallery, comments, settings,
  changeRole, removeUser
}) {
  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelAdmin || "Zarządzanie"}</div>
          <div className="ps">Zarządzanie rolami i statystykami {settings.orgName}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 12 }}>
          👥 Role członków
        </h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Imię</th>
              <th>E-mail</th>
              <th>Rola</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>
                  {u.name} {u.id === user.id && <span style={{ fontSize: 10.5, color: "var(--p)" }}>(Ty)</span>}
                </td>
                <td style={{ fontSize: 12.5 }}>{u.email}</td>
                <td>
                  <span className={`tag tag-r tag-${u.role}`}>
                    {ROLES.find(r => r.value === u.role)?.label}
                  </span>
                </td>
                <td style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "none" }}>
                  <select 
                    value={u.role} 
                    onChange={e => changeRole(u.id, e.target.value)} 
                    style={{ fontSize: 13, padding: "5px 10px", border: "1px solid var(--bo)", borderRadius: 5, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "var(--tx)", colorScheme: "light" }}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {u.id !== user.id && (
                    <button className="btn-gh" onClick={() => removeUser(u.id)} style={{ color: "#C44", padding: "4px 6px" }} title="Usuń">
                      {I.trash}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 10 }}>
          📊 Statystyki
        </h3>
        <div className="sg">
          {[
            [settings.labelMembers || "Członkowie", users.length],
            [settings.labelNews || "Aktualności", news.length],
            [settings.labelIdeas || "Pomysły", ideas.length],
            [settings.labelRecipes || "Zasoby", recipes.length],
            [settings.labelEvents || "Wydarzenia", events.length],
            [settings.labelGallery || "Zdjęcia", gallery.length],
            ["Komentarze", comments.length]
          ].map(([label, value]) => (
            <div key={label} className="sc">
              <div className="sl">{label}</div>
              <div className="sv sv-p">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}