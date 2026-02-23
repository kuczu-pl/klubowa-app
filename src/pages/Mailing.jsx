import React from 'react';
import I from '../utils/icons';

export default function Mailing({
  users, settings, storage, 
  mailSubject, setMailSubject, mailAudience, setMailAudience,
  mailCustomUsers, setMailCustomUsers, mailAttachments, setMailAttachments,
  mailEditorRef, flash, askConfirm, queueMassMail, fbRef, uploadBytes, getDownloadURL
}) {

  const tags = [
    { t: "{{name}}", d: "Imię członka" },
    { t: "{{orgName}}", d: "Nazwa organizacji" },
    { t: "{{date}}", d: "Dzisiejsza data" }
  ];

  async function handleImageInsert(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { flash("Maksymalny rozmiar obrazka to 2MB"); return; }
    
    flash("Przesyłanie grafiki...");
    try {
      const sRef = fbRef(storage, `mail_images/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      exec("insertImage", url);
      flash("Grafika wstawiona!");
    } catch (err) { flash("Błąd: " + err.message); }
    e.target.value = ""; 
  }

  async function handleSend() {
    const html = mailEditorRef.current.innerHTML;
    if (!mailSubject.trim() || html.trim() === "" || html === "<br>") { 
      flash("Wypełnij temat i treść wiadomości!"); 
      return; 
    }
    
    askConfirm(
      `Czy na pewno chcesz wysłać tę wiadomość do wybranej grupy odbiorców?`, 
      async () => {
        try {
          flash("Przetwarzanie i wysyłanie...");
          const uploadedAttachments = [];
          
          if (mailAttachments.length > 0) {
            for (const file of mailAttachments) {
              const sRef = fbRef(storage, `mail_attachments/${Date.now()}_${file.name}`);
              await uploadBytes(sRef, file);
              const url = await getDownloadURL(sRef);
              uploadedAttachments.push({ filename: file.name, href: url }); 
            }
          }

          await queueMassMail({ 
            subject: mailSubject, 
            htmlBody: html, 
            audience: mailAudience,
            customUsers: mailCustomUsers,
            attachments: uploadedAttachments 
          });

          setMailSubject("");
          if (mailEditorRef.current) mailEditorRef.current.innerHTML = "";
          setMailAttachments([]);
          flash("Wiadomość została zakolejkowana do wysyłki!");
        } catch (err) {
          flash("Błąd wysyłania: " + err.message);
        }
      },
      "Wyślij"
    );
  }

  function exec(cmd, arg = null) { 
    document.execCommand(cmd, false, arg); 
    mailEditorRef.current.focus(); 
  }

  return (
    <div className="mailing-page">
      <div className="ph">
        <div>
          <div className="pt">{settings.labelMailing || "Biuletyn i Mailing"}</div>
          <div className="ps">Personalizowana komunikacja masowa dla {settings.orgName}</div>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '950px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="fg">
            <label className="fl">Odbiorcy wiadomości</label>
            <select className="fse" value={mailAudience} onChange={e => {
              setMailAudience(e.target.value);
              if (e.target.value === "custom" && mailCustomUsers.length === 0) {
                setMailCustomUsers(users.map(u => u.id));
              }
            }}>
              <option value="all">Wszyscy ({users.length})</option>
              <option value="unpaid">Osoby z zaległościami</option>
              <option value="zarzad">Zarząd / Kadra</option>
              <option value="custom">Wybrani ręcznie...</option>
            </select>
          </div>
          <div className="fg">
            <label className="fl">Temat wiadomości</label>
            <input className="fi" value={mailSubject} onChange={e => setMailSubject(e.target.value)} placeholder="Wpisz temat..." />
          </div>
        </div>

        {mailAudience === "custom" && (
          <div style={{ background: "var(--cr)", border: "1px solid var(--bo)", borderRadius: 8, padding: "12px", marginBottom: 20 }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <small>Zaznaczono odbiorców: {mailCustomUsers.length}</small>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn-gh" style={{ fontSize: 10 }} onClick={() => setMailCustomUsers(users.map(u => u.id))}>Wszyscy</button>
                  <button className="btn-gh" style={{ fontSize: 10 }} onClick={() => setMailCustomUsers([])}>Odznacz wszystkich</button>
                </div>
             </div>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 5, maxHeight: 120, overflowY: "auto" }}>
                {users.map(u => (
                  <label key={u.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mailCustomUsers.includes(u.id)} onChange={e => e.target.checked ? setMailCustomUsers([...mailCustomUsers, u.id]) : setMailCustomUsers(mailCustomUsers.filter(id => id !== u.id))} />
                    {u.name}
                  </label>
                ))}
             </div>
          </div>
        )}

        <div className="fg">
          <label className="fl">Dostępne zmienne (kliknij, aby skopiować)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {tags.map(tag => (
              <button 
                key={tag.t} 
                className="btn-gh" 
                onClick={() => { navigator.clipboard.writeText(tag.t); flash(`Skopiowano: ${tag.t}`); }}
                style={{ fontSize: '12px', background: 'var(--cr)', border: '1px solid var(--bo)', padding: '4px 10px' }}
                title={tag.d}
              >
                <code style={{ color: 'var(--p)', fontWeight: '700' }}>{tag.t}</code>
                <span style={{ fontSize: '10px', marginLeft: '6px', opacity: 0.7 }}>{tag.d}</span>
              </button>
            ))}
          </div>

          <div className="editor-container" style={{ border: '1px solid var(--bo)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <div className="mail-toolbar" style={{ background: '#f8f9fa', padding: '8px', borderBottom: '1px solid var(--bo)', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-editor" onClick={() => exec("formatBlock", "<h2>")}>H2</button>
              <button className="btn-editor" onClick={() => exec("formatBlock", "<p>")}>P</button>
              <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 4px' }} />
              <button className="btn-editor" onClick={() => exec("bold")}><b>B</b></button>
              <button className="btn-editor" onClick={() => exec("italic")}><i>I</i></button>
              <button className="btn-editor" onClick={() => exec("underline")}><u>U</u></button>
              <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 4px' }} />
              <button className="btn-editor" onClick={() => exec("justifyLeft")}> {I.alignLeft || 'L'} </button>
              <button className="btn-editor" onClick={() => exec("justifyCenter")}> {I.alignCenter || 'C'} </button>
              <button className="btn-editor" onClick={() => exec("insertUnorderedList")}>• Lista</button>
              <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 4px' }} />
              <select style={{ fontSize: '11px', padding: '2px', borderRadius: '4px', border: '1px solid #ccc' }} onChange={(e) => exec("foreColor", e.target.value)}>
                <option value="#000000">Czarny</option>
                <option value="#b8383b">Czerwony</option>
                <option value="#4a7c59">Zielony</option>
                <option value="#3b6b8a">Niebieski</option>
              </select>
              <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 4px' }} />
              <label className="btn-editor" style={{ cursor: 'pointer' }}>
                🖼️ Wstaw foto
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageInsert} />
              </label>
            </div>
            <div 
              className="mail-editor" 
              contentEditable 
              fbRef={mailEditorRef}
              style={{ 
                minHeight: '400px', 
                padding: '25px', 
                outline: 'none', 
                fontSize: '15px', 
                lineHeight: '1.7',
                color: '#333'
              }}
            />
          </div>
        </div>

        <div className="fg" style={{ marginTop: '15px' }}>
          <label className="fl">Załączniki</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="file" multiple onChange={e => setMailAttachments(Array.from(e.target.files))} id="mail-file" style={{ display: 'none' }} />
            <label htmlFor="mail-file" className="btn btn-s" style={{ cursor: 'pointer' }}>{I.upload} Wybierz pliki z dysku</label>
            <span style={{ fontSize: '12px', color: 'var(--tm)' }}>Wybrano: {mailAttachments.length}</span>
          </div>
          {mailAttachments.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {mailAttachments.map((f, i) => (
                <div key={i} style={{ background: 'var(--cr)', border: '1px solid var(--bo)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  📎 {f.name} <small style={{ opacity: 0.6 }}>({(f.size/1024).toFixed(0)} KB)</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-p" onClick={handleSend} style={{ width: "100%", marginTop: "25px", height: "48px", fontSize: "15px", fontWeight: "600" }}>
          {I.send} Wyślij teraz do {mailAudience === 'all' ? 'wszystkich' : 'wybranej grupy'}
        </button>
      </div>
    </div>
  );
}