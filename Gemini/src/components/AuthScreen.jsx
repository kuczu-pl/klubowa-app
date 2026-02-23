import { useState } from "react";
import { getSeason, SEASONS } from "../utils/helpers";
import I from "../utils/icons";

export default function AuthScreen({onLogin, onRegister, onBack, settings}){
  const T = SEASONS[getSeason()];
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setErr("");
    if(mode === "register"){
      if(!name.trim()){setErr("Podaj imię i nazwisko");return;}
      if(pw.length < 4){setErr("Hasło musi mieć min. 4 znaki");return;}
      if(pw !== pw2){setErr("Hasła nie pasują");return;}
      setLoading(true);
      const r = await onRegister({name: name.trim(), email, password: pw});
      if(r) setErr(r);
      setLoading(false);
    } else {
      setLoading(true);
      const r = await onLogin({email, password: pw});
      if(r) setErr(r);
      setLoading(false);
    }
  }

  return(
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <img src={settings?.orgLogoUrl || "/logo.png"} alt="Logo" onError={(e)=>{e.target.style.display='none';e.target.parentElement.textContent=T.emoji;}}/>
        </div>
        
        {/* Dynamiczny nagłówek na podstawie ustawień (White-Label) */}
        <div className="auth-h">{settings?.orgName || "Witaj w aplikacji"}</div>
        <div className="auth-sub">{settings?.orgLocation || "Twoje miasto"} {settings?.orgGmina ? `· ${settings.orgGmina}` : ""}</div>
        
        <div className="auth-season" style={{ marginBottom: 20 }}>{T.emoji} Sezon: {T.name} {new Date().getFullYear()}</div>
        
        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="fg">
              <label className="fl">Imię i nazwisko *</label>
              <input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Jan Kowalski"/>
            </div>
          )}
          <div className="fg">
            <label className="fl">Adres e-mail *</label>
            <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@example.pl"/>
          </div>
          <div className="fg">
            <label className="fl">Hasło *</label>
            <div className="pw-w">
              <input className="fi" type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••"/>
              <button type="button" className="pw-t" onClick={() => setShowPw(!showPw)}>{showPw ? I.eyeOff : I.eye}</button>
            </div>
            {mode === "register" && <div className="fh">Minimum 4 znaki</div>}
          </div>
          {mode === "register" && (
            <div className="fg">
              <label className="fl">Powtórz hasło *</label>
              <input className="fi" type={showPw ? "text" : "password"} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="••••••"/>
            </div>
          )}
          {err && <div className="fe" style={{marginBottom:10}}>⚠️ {err}</div>}
          
          <button type="submit" className="btn btn-p" disabled={loading} style={{width:"100%",justifyContent:"center",padding:"11px",fontSize:14.5}}>
            {loading ? "Chwileczkę..." : mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
          </button>
        </form>
        
        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.textM}}>
          {mode === "login" ? (
            <>Nie masz konta? <button onClick={()=>{setMode("register");setErr("");}} style={{background:"none",border:"none",color:T.primary,cursor:"pointer",fontWeight:600,fontFamily:"inherit",fontSize:13}}>Zarejestruj się</button></>
          ) : (
            <>Masz konto? <button onClick={()=>{setMode("login");setErr("");}} style={{background:"none",border:"none",color:T.primary,cursor:"pointer",fontWeight:600,fontFamily:"inherit",fontSize:13}}>Zaloguj się</button></>
          )}
        </div>
        
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:T.textM,opacity:.55}}>
          Wykonał - Błażej Kuczyński-Cichocki
        </div>
        
        {onBack && (
          <div style={{textAlign:"center",marginTop:10}}>
            <button onClick={onBack} style={{background:"none",border:"none",color:T.textM,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              ← Wróć do strony głównej
            </button>
          </div>
        )}
      </div>
    </div>
  );
}