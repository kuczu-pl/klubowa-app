import { useState } from "react";

export default function FModal({title,fields,onSubmit,onClose}){
  const[fd,setFd]=useState(()=>{const o={};fields.forEach(f=>{if(f.def!==undefined)o[f.n]=f.def;else if(f.t==="select"&&f.o?.length)o[f.n]=f.o[0].v;else o[f.n]="";});return o;});
  function submit(e){e.preventDefault();if(!fields.filter(f=>f.req).every(f=>String(fd[f.n]).trim()))return;
    const out={};fields.forEach(f=>{out[f.n]=fd[f.n];});onSubmit(out);}
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
