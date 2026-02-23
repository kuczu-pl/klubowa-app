import { useState } from "react";
import I from "../utils/icons";

export default function DocumentModal({ onClose, onSubmit, folders, defaultFolder }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState(defaultFolder || folders[0]);

  function submit(e) {
    e.preventDefault();
    if (!file) return;
    onSubmit({ file, title, description, folder });
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="mod" onClick={(e) => e.stopPropagation()}>
        <div className="mod-t">Dodaj dokument</div>
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl">Plik *</label>
            <input type="file" className="fi" onChange={e => setFile(e.target.files?.[0])} required />
          </div>
          <div className="fg">
            <label className="fl">Tytuł (zostaw puste, by użyć nazwy pliku)</label>
            <input className="fi" value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Uchwała nr 1/2026" />
          </div>
          <div className="fg">
            <label className="fl">Folder docelowy *</label>
            <select className="fse" value={folder} onChange={e => setFolder(e.target.value)}>
              {folders.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Opis (opcjonalnie)</label>
            <textarea className="fta" value={description} onChange={e => setDescription(e.target.value)} placeholder="Krótki opis, czego dotyczy plik..." rows={2} />
          </div>
          <div className="fa">
            <button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-g" disabled={!file}>{I.upload} Prześlij</button>
          </div>
        </form>
      </div>
    </div>
  );
}