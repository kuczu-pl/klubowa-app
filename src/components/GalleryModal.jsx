import { useState, useRef } from "react";
import I from "../utils/icons"; // <--- DODAJ TĘ LINIJKĘ

export default function GalleryModal({ onClose, onSubmit, albums = [], defaultAlbum = null }) {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [albumId, setAlbumId] = useState(defaultAlbum || ""); 
  const fr = useRef();

  function onFile(e) {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    
    // Filtrowanie plików powyżej 5MB
    const validFiles = selectedFiles.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < selectedFiles.length) {
      alert("Pominięto pliki powyżej 5 MB!");
    }
    
    setFiles(validFiles);
    
    // Generowanie miniaturek podglądu dla wszystkich zdjęć
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }

  function submit(e) {
    e.preventDefault();
    if (!files.length) return;
    onSubmit({ files, title: title.trim(), albumId: albumId || null }); 
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="mod" onClick={e => e.stopPropagation()}>
        <div className="mod-t">Dodaj zdjęcia</div>
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl">Tytuł (zostaw puste, by użyć oryginalnych nazw plików)</label>
            <input className="fi" value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Dożynki 2026" />
            {title && files.length > 1 && <div style={{fontSize: 11, color: "var(--tm)", marginTop: 4}}>* Zdjęcia zostaną automatycznie ponumerowane (np. {title} 1, {title} 2)</div>}
          </div>

          <div className="fg">
            <label className="fl">Album (opcjonalnie)</label>
            <select className="fse" value={albumId} onChange={e => setAlbumId(e.target.value)}>
              <option value="">Bez albumu (ogólne)</option>
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label className="fl">Zdjęcia * (max 5 MB każde)</label>
            {/* Atrybut 'multiple' pozwala zaznaczyć wiele plików na raz! */}
            <input type="file" accept="image/*" multiple ref={fr} onChange={onFile} style={{ fontSize: 13 }} required />
            
            {previews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginTop: 12, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`podgląd ${i}`} style={{ width: "100%", height: 70, borderRadius: 6, objectFit: "cover" }} />
                ))}
              </div>
            )}
          </div>

          <div className="fa">
            <button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-g" disabled={!files.length}>
              {I.upload} Dodaj {files.length > 0 ? `(${files.length})` : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}