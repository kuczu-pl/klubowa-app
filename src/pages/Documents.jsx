import React from 'react';
import { canManage, fDate, uName } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';

export default function Documents({
  user, users, documents, settings, docFolder, setDocFolder,
  setModal, delDocument
}) {
  const cm = canManage(user.role);
  
  // Jeśli organizacja nie ma własnych folderów w ustawieniach, używamy domyślnych:
  const folders = settings.docFolders || ["Uchwały", "Protokoły z zebrań", "Regulaminy", "Sprawozdania finansowe", "Wnioski", "Inne"];

  function docIcon(name) {
    const ext = (name || "").split(".").pop().toLowerCase();
    if (ext === "pdf") return { cls: "pdf", emoji: "📄" };
    if (["doc", "docx"].includes(ext)) return { cls: "doc", emoji: "📝" };
    if (["xls", "xlsx"].includes(ext)) return { cls: "doc", emoji: "📊" };
    return { cls: "other", emoji: "📎" };
  }

  function fSize(b) {
    if (!b) return "";
    if (b < 1024) return b + "B";
    if (b < 1048576) return (b / 1024).toFixed(1) + "KB";
    return (b / 1048576).toFixed(1) + "MB";
  }

  // WIDOK GŁÓWNY: Lista folderów
  if (!docFolder) {
    return (
      <div>
        <div className="ph">
          <div>
            <div className="pt">{settings.labelDocs || "Dokumenty"}</div>
            <div className="ps">Wybierz folder, aby przeglądać pliki</div>
          </div>
          {cm && (
            <button className="btn btn-p" onClick={() => setModal("addDocument")}>
              {I.upload} Dodaj plik
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 16, marginTop: 10 }}>
          {folders.map(f => {
            // Liczymy ile dokumentów jest w danym folderze
            const count = documents.filter(d => (d.folder || d.category) === f).length;
            return (
              <div 
                key={f} 
                className="card" 
                onClick={() => setDocFolder(f)}
                style={{ padding: 16, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                <div style={{ fontSize: 48, lineHeight: 1 }}>📁</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f}</div>
                <div style={{ fontSize: 12.5, color: "var(--tm)" }}>
                  {count} {count === 1 ? "plik" : count < 5 ? "pliki" : "plików"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // WIDOK WNĘTRZA FOLDERU
  const currentDocs = documents.filter(d => (d.folder || d.category) === docFolder);
  
  return (
    <div>
      <div className="ph">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <button className="btn-gh" onClick={() => setDocFolder(null)} style={{ padding: "4px 8px", fontSize: 13 }}>
              ‹ Wróć
            </button>
            <div className="pt" style={{ fontSize: 20 }}>📁 {docFolder}</div>
          </div>
          <div className="ps">
            {currentDocs.length} {currentDocs.length === 1 ? "plik" : currentDocs.length < 5 ? "pliki" : "plików"} w folderze
          </div>
        </div>
        {cm && (
          <button className="btn btn-p" onClick={() => setModal("addDocument")}>
            {I.upload} Dodaj plik
          </button>
        )}
      </div>

      {currentDocs.length === 0 && (
        <Empty 
          emoji="📄" 
          title="Folder jest pusty" 
          desc="Dodaj tu pierwszy plik." 
          action={cm ? "Dodaj plik" : null} 
          onAction={() => setModal("addDocument")}
        />
      )}

      <div className="doc-grid">
        {[...currentDocs].sort((a, b) => b.date.localeCompare(a.date)).map(d => {
          const ic = docIcon(d.fileName);
          return (
            <div key={d.id} className="doc-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div className={`doc-icon ${ic.cls}`}>{ic.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="doc-name">{d.title}</div>
                  {d.description && <div className="doc-desc">{d.description}</div>}
                </div>
              </div>
              <div className="doc-meta">
                {fDate(d.date)} · {uName(users, d.authorId, settings.orgName)}
                {d.fileSize ? ` · ${fSize(d.fileSize)}` : ""}
              </div>
              <div className="doc-actions">
                <a href={d.url} target="_blank" rel="noreferrer" className="btn btn-s" style={{ fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {I.download} Pobierz
                </a>
                {(cm || d.authorId === user.id) && (
                  <button className="btn-gh" onClick={() => delDocument(d.id)} style={{ color: "#C44", padding: "4px 6px" }}>
                    {I.trash}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}