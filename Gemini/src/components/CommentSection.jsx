import { useState } from "react";
import { avC, ini, timeAgo } from "../utils/helpers";
import I from "../utils/icons";

export default function CommentSection({type,contentId,comments,onAdd,onDel,users:allUsers,userId,canMng}){
  const[open,setOpen]=useState(false);
  const[text,setText]=useState("");
  const mine=comments.filter(c=>c.type===type&&c.contentId===contentId);
  function submit(e){e.preventDefault();if(!text.trim())return;onAdd(type,contentId,text.trim());setText("");}
  function uName(aid){const u=allUsers.find(x=>x.id===aid);return u?u.name:"Anonim";}
  return(<div className="cmt-section">
    <div className="cmt-count" onClick={()=>setOpen(!open)}>{I.msg} {mine.length} {mine.length===1?"komentarz":mine.length<5?"komentarze":"komentarzy"} {open?"▲":"▼"}</div>
    {open&&<><div className="cmt-list">{mine.map(c=><div key={c.id} className="cmt-item">
      <div className="cmt-av" style={{background:avC(c.authorId)}}>{ini(uName(c.authorId))}</div>
      <div className="cmt-body">
        <div><span className="cmt-author">{uName(c.authorId)}</span><span className="cmt-time">{timeAgo(c.date)}</span></div>
        <div className="cmt-text">{c.text}</div>
      </div>
      {(c.authorId===userId||canMng)&&<button className="cmt-del" onClick={()=>onDel(c.id)} title="Usuń">{I.x}</button>}
    </div>)}</div>
    <form className="cmt-form" onSubmit={submit}>
      <input className="cmt-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Napisz komentarz..." />
      <button className="cmt-send" type="submit">{I.plus}</button>
    </form></>}
  </div>);
}
