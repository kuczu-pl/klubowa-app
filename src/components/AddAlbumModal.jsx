import { useState } from "react";

export default function AddAlbumModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="mod" onClick={e => e.stopPropagation()}>
        <div className="mod-t">Nowy album</div>
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl">Nazwa *</label>
            <input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="np. Dożynki 2024" required />
          </div>
          <div className="fg">
            <label className="fl">Opis (opcjonalnie)</label>
            <input className="fi" value={description} onChange={e => setDescription(e.target.value)} placeholder="Krótki opis albumu..." />
          </div>
          <div className="fa">
            <button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn btn-g" disabled={!name.trim()}>Dodaj</button>
          </div>
        </form>
      </div>
    </div>
  );
}