import React from 'react';
import { avC, ini, ROLES, fDate } from '../utils/helpers';
import I from '../utils/icons';

export default function Profile({
  user, users, recipes, ideas, gallery, settings, allThemes,
  handleProfileSave, handlePwSave
}) {
  const myRecipes = recipes.filter(r => r.authorId === user.id).length;
  const myIdeas = ideas.filter(i => i.authorId === user.id).length;
  const myPhotos = gallery.filter(g => g.authorId === user.id).length;

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelProfile || "Mój Profil"}</div>
          <div className="ps">Twoje dane i statystyki w {settings.orgName}</div>
        </div>
      </div>
      
      <div className="profile-card">
        <div className="profile-av" style={{ background: avC(user.id) }}>{ini(user.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "var(--tm)" }}>{user.email}</div>
          <div style={{ marginTop: 4 }}>
            <span className={`tag tag-r tag-${user.role}`}>
              {ROLES.find(r => r.value === user.role)?.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--tm)", marginTop: 6 }}>
            Dołączył/a: {fDate(user.joined)}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="sc">
          <div className="sl">{settings.labelRecipes || "Przepisy"}</div>
          <div className="sv sv-p">{myRecipes}</div>
        </div>
        <div className="sc">
          <div className="sl">{settings.labelIdeas || "Pomysły"}</div>
          <div className="sv sv-p">{myIdeas}</div>
        </div>
        <div className="sc">
          <div className="sl">{settings.labelGallery || "Zdjęcia"}</div>
          <div className="sv sv-p">{myPhotos}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 14 }}>✏️ Edytuj dane i motyw</h3>
        <form onSubmit={handleProfileSave}>
          <div className="fg">
            <label className="fl">Imię i nazwisko</label>
            <input className="fi" name="name" defaultValue={user.name} required />
          </div>
          <div className="fg">
            <label className="fl">Telefon</label>
            <input className="fi" name="phone" defaultValue={user.phone || ""} placeholder="np. 600 123 456" />
          </div>
          <div className="fg">
            <label className="fl">Motyw aplikacji</label>
            <select className="fse" name="theme" defaultValue={user.theme || "auto"}>
  <option value="auto">Automatyczny (zgodnie z porą roku)</option>
  
  <optgroup label="Standardowe">
    <option value="spring">Wiosna 🌸</option>
    <option value="summer">Lato 🌻</option>
    <option value="autumn">Jesień 🍂</option>
    <option value="winter">Zima ❄️</option>
  </optgroup>

  {/* Dynamiczna lista Twoich motywów */}
  {allThemes && Object.keys(allThemes).filter(k => !['spring','summer','autumn','winter'].includes(k)).length > 0 && (
    <optgroup label="Motywy Organizacji">
      {Object.entries(allThemes)
        .filter(([k]) => !['spring','summer','autumn','winter'].includes(k))
        .map(([key, t]) => (
          <option key={key} value={key}>{t.emoji} {t.name}</option>
        ))
      }
    </optgroup>
  )}
</select>
          </div>
          <button type="submit" className="btn btn-g">{I.save} Zapisz profil</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 14 }}>🔒 Zmiana hasła</h3>
        <form onSubmit={handlePwSave}>
          <div className="fg">
            <label className="fl">Obecne hasło</label>
            <input className="fi" type="password" name="oldPw" required />
          </div>
          <div className="fg">
            <label className="fl">Nowe hasło (min. 6 znaków)</label>
            <input className="fi" type="password" name="newPw" required />
          </div>
          <button type="submit" className="btn btn-p">Zmień hasło</button>
        </form>
      </div>
    </div>
  );
}