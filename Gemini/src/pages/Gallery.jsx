import React from 'react';
import { canManage, fDate, uName } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';

export default function Gallery({
  user, users, gallery, albums, settings,
  galleryAlbum, setGalleryAlbum,
  setModal, setLightbox, delGallery, delAlbum
}) {
  const cm = canManage(user.role);

  // 1. LOGIKA FILTROWANIA
  const filtered = galleryAlbum === "all" 
    ? gallery 
    : galleryAlbum === "unassigned"
      ? gallery.filter(g => !g.albumId)
      : gallery.filter(g => g.albumId === galleryAlbum);

  // 2. DEFINICJA WYBRANEGO ALBUMU
  const selAlbum = (galleryAlbum !== "all" && galleryAlbum !== "unassigned") 
    ? albums.find(a => a.id === galleryAlbum) 
    : null;

  const GHOST_MIN = 4;
  const ghosts = filtered.length === 0 ? 0 : Math.max(0, GHOST_MIN - filtered.length);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">
            {selAlbum ? selAlbum.name : (galleryAlbum === "unassigned" ? "Multimedia nieprzypisane" : (settings.labelGallery || "Galeria"))}
          </div>
          <div className="ps">
            {selAlbum ? selAlbum.description || "Materiały z tego albumu" : "Wspomnienia, relacje i multimedia"}
            {filtered.length > 0 && (
              <span style={{ marginLeft: 8, background: "var(--cr)", border: "1px solid var(--bo)", borderRadius: 20, padding: "1px 10px", fontSize: 12, color: "var(--tm)", fontWeight: 500 }}>
                {filtered.length} {filtered.length === 1 ? "plik" : filtered.length < 5 ? "pliki" : "plików"}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cm && <button className="btn btn-s" onClick={() => setModal("addAlbum")}>{I.plus} Nowy album</button>}
          {cm && selAlbum && <button className="btn btn-d" onClick={() => delAlbum && delAlbum(galleryAlbum)}>{I.trash} Usuń album</button>}
          <button className="btn btn-p" onClick={() => setModal("addGallery")}>{I.plus} Dodaj materiał</button>
        </div>
      </div>

      {albums.length > 0 && (
        <div className="filter-bar">
          <button className={`filter-btn${galleryAlbum === "unassigned" ? " on" : ""}`} onClick={() => setGalleryAlbum("unassigned")}>
            Nieprzypisane ({gallery.filter(g => !g.albumId).length})
          </button>
          
          {albums.map(a => (
            <button key={a.id} className={`filter-btn${galleryAlbum === a.id ? " on" : ""}`} onClick={() => setGalleryAlbum(a.id)}>
              {a.name} ({gallery.filter(g => g.albumId === a.id).length})
            </button>
          ))}

          <button className={`filter-btn${galleryAlbum === "all" ? " on" : ""}`} onClick={() => setGalleryAlbum("all")}>
            Wszystkie ({gallery.length})
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty 
          emoji="📸" 
          title={galleryAlbum !== "all" ? "Brak materiałów w tym widoku" : "Brak multimediów"} 
          desc="Dodaj pierwsze zdjęcie lub relację, aby zapełnić tę sekcję." 
          action="Dodaj zdjęcie" 
          onAction={() => setModal("addGallery")}
        />
      ) : (
        <div className="gg">
          {filtered.map((g, i) => (
            <div key={g.id} className="gi" style={{ animationDelay: `${i * .04}s` }}>
              <img src={g.imageData} alt={g.title} onClick={() => setLightbox(g)} />
              <div className="gi-i">
                <div className="gi-t">{g.title}</div>
                {!galleryAlbum && g.albumId && albums.find(a => a.id === g.albumId) && (
                  <div className="gi-album">{albums.find(a => a.id === g.albumId).name}</div>
                )}
                <div className="gi-m">{uName(users, g.authorId, settings.orgName)} · {fDate(g.date)}</div>
                {(cm || g.authorId === user.id) && (
                  <button className="btn-gh" onClick={() => delGallery && delGallery(g.id)} style={{ color: "#C44", padding: 1, marginTop: 3, fontSize: 11.5 }}>
                    {I.trash} Usuń
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {Array.from({ length: ghosts }).map((_, i) => (
            <button key={`ghost-${i}`} className="ghost-card" style={{ minHeight: 220 }} onClick={() => setModal("addGallery")}>
              <span className="ghost-card-emoji">📷</span>
              <span className="ghost-card-label">Dodaj materiał<br/><span style={{ fontSize: 11, opacity: .7 }}>Podziel się zdjęciem z relacji</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}