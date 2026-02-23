import { useState, useRef } from "react";

export function DocumentModal({onClose,onSubmit}){
  const[title,setTitle]=useState("");const[desc,setDesc]=useState("");const[cat,setCat]=useState("inne");const[file,setFile]=useState(null);const fr=useRef();
  function onFile(e){const f=e.target.files?.[0];if(!f)return;setFile(f);if(!title)setTitle(f.name.replace(/\.[^.]+$/,""));}
  function submit(e){e.preventDefault();if(!file)return;onSubmit({title:title.trim()||file.name,description:desc.trim(),category:cat,file});}
  return(<div className="mo" onClick={onClose}><div className="mod" onClick={e=>e.stopPropagation()}>
    <div className="mod-t">Dodaj dokument</div>
    <form onSubmit={submit}>
      <div className="fg"><label className="fl">Plik *</label><input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.odt,.ods" ref={fr} onChange={onFile} style={{fontSize:13}} required/></div>
      <div className="fg"><label className="fl">Tytuł *</label><input className="fi" value={title} onChange={e=>setTitle(e.target.value)} placeholder="np. Protokół z zebrania 2024" required/></div>
      <div className="fg"><label className="fl">Opis</label><textarea className="fta" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Krótki opis..."/></div>
      <div className="fg"><label className="fl">Kategoria</label>
        <select className="fse" value={cat} onChange={e=>setCat(e.target.value)}>
          { ["uchwały","protokoły","regulaminy","sprawozdania","wnioski / dotacje","inne" ].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>) }
        </select>
      </div>
      <div className="fa"><button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button><button type="submit" className="btn btn-g" disabled={!file}>Dodaj</button></div>
    </form>
  </div></div>);
}

export function FModal({title,fields,onSubmit,onClose}){
  const[fd,setFd]=useState(()=>{const o={};fields.forEach(f=>{if(f.def!==undefined)o[f.n]=f.def;else if(f.t==="select"&&f.o?.length)o[f.n]=f.o[0].v;else o[f.n]=""});return o;});
  function submit(e){e.preventDefault();if(!fields.filter(f=>f.req).every(f=>String(fd[f.n]).trim()))return;const out={};fields.forEach(f=>{out[f.n]=fd[f.n]});onSubmit(out);}
  return(<div className="mo" onClick={onClose}><div className="mod" onClick={e=>e.stopPropagation()}>
    <div className="mod-t">{title}</div>
    <form onSubmit={submit}>
      {fields.map(f=><div className="fg" key={f.n}><label className="fl">{f.l}{f.req?" *":""}</label>
        {f.t==="textarea"?<textarea className="fta" value={fd[f.n]} onChange={e=>setFd({...fd,[f.n]:e.target.value})} required={f.req}/>
        :f.t==="select"?<select className="fse" value={fd[f.n]} onChange={e=>setFd({...fd,[f.n]:e.target.value})}>{f.o.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
        :<input className="fi" type={f.t} value={fd[f.n]} onChange={e=>setFd({...fd,[f.n]:e.target.value})} required={f.req}/>}
      </div>)}
      <div className="fa"><button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button><button type="submit" className="btn btn-g">Zapisz</button></div>
    </form>
  </div></div>);
}

export function GalleryModal({onClose,onSubmit}){
  const[title,setTitle]=useState("");const[file,setFile]=useState(null);const[preview,setPreview]=useState(null);const fr=useRef();
  function onFile(e){const f=e.target.files?.[0];if(!f)return; if(f.size>5*1024*1024){alert("Max 5 MB!");return;} setFile(f); setPreview(URL.createObjectURL(f));}
  function submit(e){e.preventDefault();if(!title.trim()||!file)return;onSubmit({title:title.trim(),file});}
  return(<div className="mo" onClick={onClose}><div className="mod" onClick={e=>e.stopPropagation()}>
    <div className="mod-t">Dodaj zdjęcie</div>
    <form onSubmit={submit}>
      <div className="fg"><label className="fl">Tytuł *</label><input className="fi" value={title} onChange={e=>setTitle(e.target.value)} placeholder="np. Dożynki 2024" required/></div>
      <div className="fg"><label className="fl">Zdjęcie * (max 5 MB)</label><input type="file" accept="image/*" ref={fr} onChange={onFile} style={{fontSize:13}} required/>
        {preview&&<img src={preview} alt="podgląd" style={{marginTop:8,maxWidth:"100%",maxHeight:180,borderRadius:8,objectFit:"cover"}}/>}</div>
      <div className="fa"><button type="button" className="btn btn-s" onClick={onClose}>Anuluj</button><button type="submit" className="btn btn-g" disabled={!file}>Dodaj</button></div>
    </form>
  </div></div>);
}
