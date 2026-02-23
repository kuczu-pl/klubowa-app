import I from "../utils/icons";

export default function Empty({emoji,title,desc,action,onAction}){
  return(<div className="empty">
    <div className="empty-emoji">{emoji}</div>
    <div className="empty-title">{title}</div>
    <div className="empty-desc">{desc}</div>
    {action&&<button className="btn btn-p" onClick={onAction}>{I.plus} {action}</button>}
  </div>);
}
