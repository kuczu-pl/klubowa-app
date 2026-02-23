export default function Sidebar({ settings, T, sideOpen, setSideOpen, searchRef, searchQ, setSearchQ, searchOpen, setSearchOpen, searchResults, setTab, setNotifOpen, notifOpen, markNotifsRead, notifs, user, nav, tab, doLogout, avC, ini, ROLES, myUnreadNotifs }){
  return (<aside className={`side${sideOpen?" open":""}`}>
    <div className="side-hd">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div className="side-logo"><img src="/logo.png" alt="Logo" onError={(e)=>{e.target.style.display='none';e.target.parentElement.textContent='KG';}}/></div>
          <div className="side-t">{settings.orgName}</div>
          <div className="side-st">{settings.orgLocation} · {settings.orgGmina}</div>
          <div className="side-season">{T.emoji} {T.name}</div>
        </div>
        {sideOpen&&<button className="hb" onClick={()=>setSideOpen(false)} style={{marginTop:-2}}>✖</button>}
      </div>
    </div>

    <div className="side-search" style={{position:"relative"}}>
      <div className="side-search-wrap">
        <span style={{opacity:.4,display:"flex"}}>🔍</span>
        <input ref={searchRef} value={searchQ} onChange={e=>{setSearchQ(e.target.value);setSearchOpen(true);}} onFocus={()=>setSearchOpen(true)} onBlur={()=>setTimeout(()=>setSearchOpen(false),200)} placeholder="Szukaj..."/>
      </div>
      {searchOpen&&searchResults.length>0&&<div className="search-results">
        {searchResults.map((r,i)=><div key={i} className="search-item" onMouseDown={()=>{setTab(r.tab);setSearchQ("");setSearchOpen(false);setSideOpen(false);}}>
          <span className="search-item-type">{r.type}</span>
          <span>{r.label}</span>
        </div>)}
      </div>}
    </div>

    <div style={{padding:"6px 14px",display:"flex",justifyContent:"flex-end"}}>
      <div className="notif-wrap">
        <button className="notif-btn" style={{color:"rgba(255,255,255,.55)"}} onClick={()=>{setNotifOpen(!notifOpen);if(!notifOpen)markNotifsRead();}}>{/* bell */}🔔{myUnreadNotifs>0&&<span className="notif-badge">{myUnreadNotifs}</span>}</button>
        {notifOpen&&<div className="notif-dd">
          <div className="notif-hd"><span>Powiadomienia</span><span style={{fontSize:11,color:"var(--tm)",fontWeight:400}}>{myUnreadNotifs} nowych</span></div>
          {notifs.filter(n=>n.userId===user.id).slice(0,15).map(n=><div key={n.id} className={`notif-item${!n.read?" unread":""}`}>
            {!n.read&&<div className="notif-dot"/>}
            <div><div style={{fontSize:12.5}}>{n.msg}</div><div style={{fontSize:10.5,opacity:.6,marginTop:2}}>{/* timeAgo not available here */}{n.date}</div></div>
          </div>)}
          {notifs.filter(n=>n.userId===user.id).length===0&&<div style={{padding:20,textAlign:"center",color:"var(--tm)",fontSize:13}}>Brak powiadomień</div>}
        </div>}
      </div>
    </div>

    <nav className="side-nav">
      {nav.map(n=><button key={n.id} className={`ni${tab===n.id?" act":""}`} onClick={()=>{setTab(n.id);setSideOpen(false);setNotifOpen(false);}}>
        <span className="ni-icon">{n.icon}</span>
        <span className="ni-label">{n.label}</span>
        {n.badge!=null&&n.badge>0&&<span className="ni-badge">{n.badge}</span>}
      </button>)}
    </nav>
    <div className="side-user">
      <div className="side-av" style={{background:avC(user.id)}} onClick={()=>{setTab("profile");setSideOpen(false);}} title="Mój profil">{ini(user.name)}</div>
      <div style={{flex:1,minWidth:0}}><div className="side-un">{user.name}</div><div className="side-ur">{ROLES.find(r=>r.value===user.role)?.label}</div></div>
      <button className="side-lo" onClick={doLogout} title="Wyloguj">🔓</button>
    </div>
    <div className="side-ft">© 2026 KGiGW Ceradz Dolny</div>
  </aside>);
}
