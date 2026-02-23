import { useState, useEffect, useCallback, useRef } from "react";
import { auth, db, storage } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc, updateDoc, runTransaction, writeBatch, arrayUnion, arrayRemove, increment, query, where, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { uName, balanceTeams, getSeason, SEASONS, DEFAULT_SETTINGS, SEED_NEWS, ROLES, MO_PL, MO_S, AV_C, canSeeDues, canManage, isAdmin, fDate, mName, ini, avC, timeAgo, uid, tplt, mailWrapper } from "./utils/helpers";
import I from "./utils/icons";
import CommentSection from "./components/CommentSection";
import Empty from "./components/Empty";
import SetupWizard from "./components/SetupWizard";
import LandingPage from "./components/LandingPage";
import DocumentModal from "./components/DocumentModal";
import AuthScreen from "./components/AuthScreen";
import FModal from "./components/FModal";
import GalleryModal from "./components/GalleryModal";
import AddAlbumModal from "./components/AddAlbumModal";
import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Members from "./pages/Members";
import Dues from "./pages/Dues";
import Ideas from "./pages/Ideas";
import Polls from "./pages/Polls";
import Recipes from "./pages/Recipes";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Finances from "./pages/Finances";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Mailing from "./pages/Mailing";
import Guide from "./pages/Guide";
import TacticsBoard from "./pages/TacticsBoard";

// ═══════════════════════════════════════════════════════════════════
// THEME CSS GENERATOR
// ═══════════════════════════════════════════════════════════════════
function getThemeCSS(t) {
  // Wyliczamy kolor tekstu w menu na podstawie jasności tła panelu (uproszczone)
  // Jeśli s1 jest bardzo ciemne, wymuszamy biały tekst w menu
  return `
    :root {
      --p: ${t.primary};
      --pd: ${t.primaryDark};
      --ac: ${t.accent};
      --al: ${t.accentLight};
      --bg: ${t.bg};
      --s1: ${t.side1};
      --s2: ${t.side2};
      --bo: ${t.border};
      --tx: ${t.text || '#1a1a1a'}; /* Używamy koloru z motywu! */
      --tm: ${t.textM || '#666'};
      --tx-side: ${t.textSide || '#ffffff'}; /* Osobny kolor dla menu */
      --ban: ${t.banner};
      --cr: ${t.cream || '#f0f0f0'};
      --cd: ${t.creamDark || '#e0e0e0'};
      --r: 12px;
      --sh: 0 2px 12px rgba(0,0,0,.06);
    }
    /* Poprawka czytelności paska bocznego */
    .nav-item, .side-user-name, .side-org-name { color: var(--tx-side) !important; }
    .nav-item svg { fill: var(--tx-side) !important; }
    .nav-item.active { background: var(--ac); color: #1a1a1a !important; }
    .nav-item.active svg { fill: #1a1a1a !important; }
    .wb { color: #fff; } /* Tekst na bannerze powitalnym zawsze biały */
  `;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [activeSetTab, setActiveSetTab] = useState("general");
  const [booted,setBooted]=useState(false);
  const [user,setUser]=useState(null);
  const [users,setUsers]=useState([]);
  const [tab,setTab]=useState("dashboard");
  const [sideOpen,setSideOpen]=useState(false);
  const [modal,setModal]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const [news,setNews]=useState([]);
  const [ideas,setIdeas]=useState([]);
  const [recipes,setRecipes]=useState([]);
  const [events,setEvents]=useState([]);
  const [dues,setDues]=useState([]);
  const [gallery,setGallery]=useState([]);
  const [albums,setAlbums]=useState([]);
  const [galleryAlbum, setGalleryAlbum] = useState("unassigned");
  const [comments,setComments]=useState([]);
  const [notifs,setNotifs]=useState([]);
  const [finances,setFinances]=useState([]);
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [lightbox,setLightbox]=useState(null);
  const [toast,setToast]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [showOnboard,setShowOnboard]=useState(false);
  const [onbStep,setOnbStep]=useState(0);
  const [notifOpen,setNotifOpen]=useState(false);
  const [searchQ,setSearchQ]=useState("");
  const [searchOpen,setSearchOpen]=useState(false);
  const [newsFilter,setNewsFilter]=useState("all");
  const [recipeFilter,setRecipeFilter]=useState("all");
  const [ideaFilter,setIdeaFilter]=useState("all");
  const [duesAlert,setDuesAlert]=useState(null); // { month, count } — banner naliczania składek
  const [polls,setPolls]=useState([]);
  const [messages,setMessages]=useState([]);
  const [documents,setDocuments]=useState([]);
  const [docFolder,setDocFolder]=useState(null);
  const [chatWith,setChatWith]=useState(null); // userId of chat partner
  const [msgText,setMsgText]=useState("");       // wiadomość w polu input czatu
  const msgBodyRef=useRef(null);                  // ref do scrollowania czatu
  const [calView,setCalView]=useState(false); // calendar grid vs list for events
  const [calMonth,setCalMonth]=useState(()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth()};});
  const [showLanding,setShowLanding]=useState(true); // public landing page
  const [tacticsEvent, setTacticsEvent] = useState(null);
  const searchRef=useRef();

  // STANY DLA MAILINGU (muszą być tutaj na samej górze!)
  const [mailSubject, setMailSubject] = useState("");
  const [mailAudience, setMailAudience] = useState("all");
  const [mailAttachments, setMailAttachments] = useState([]);
  const [mailCustomUsers, setMailCustomUsers] = useState([]);
  const mailEditorRef = useRef(null);

  // --- DYNAMICZNY MOTYW ---
  const ALL_THEMES = { ...SEASONS };
  if (settings.customThemes) {
    settings.customThemes.forEach(t => {
      const key = t.name.replace(/\s+/g, '').toLowerCase();
      ALL_THEMES[key] = t;
    });
  }

  const activeThemeKey = (user && user.theme && user.theme !== "auto") ? user.theme : getSeason();
  const T = ALL_THEMES[activeThemeKey] || SEASONS[getSeason()];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. ZABEZPIECZENIE: Oczekujemy na utworzenie dokumentu usera (podczas pierwszej rejestracji)
          let userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          let retries = 0;
          while (!userDoc.exists() && retries < 5) {
            await new Promise(r => setTimeout(r, 400)); // Czekamy 0.4s
            userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            retries++;
          }

          if (userDoc.exists()) {
            const ud = userDoc.data();
            setUser({...ud, id: firebaseUser.uid});
            if (!ud.onboarded) setShowOnboard(true);
            
            const usersSnap = await getDocs(collection(db, "users"));
            setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            const fetchCol = async (colName) => {
              const snap = await getDocs(collection(db, colName));
              return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            };

            // Pobieranie publicznych danych dla zalogowanych
            const fetchedNews = await fetchCol("news");
            setNews(fetchedNews.length > 0 ? fetchedNews : SEED_NEWS);
            setIdeas(await fetchCol("ideas"));
            setRecipes(await fetchCol("recipes"));
            setEvents(await fetchCol("events"));
            setGallery(await fetchCol("gallery"));
            setAlbums(await fetchCol("albums"));
            setComments(await fetchCol("comments"));
            setPolls(await fetchCol("polls"));
            setDocuments(await fetchCol("documents"));

            const notifSnap = await getDocs(query(collection(db, "notifications"), where("userId", "==", firebaseUser.uid)));
            setNotifs(notifSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            const msgsCol = collection(db, "messages");
            const [sentSnap, recvSnap] = await Promise.all([
              getDocs(query(msgsCol, where("from", "==", firebaseUser.uid))),
              getDocs(query(msgsCol, where("to", "==", firebaseUser.uid)))
            ]);
            const msgMap = new Map();
            [...sentSnap.docs, ...recvSnap.docs].forEach(d => msgMap.set(d.id, { id: d.id, ...d.data() }));
            setMessages([...msgMap.values()]);

            const settingsDoc = await getDoc(doc(db, "settings", "main"));
            if(settingsDoc.exists()) setSettings(settingsDoc.data());

            // 2. ZABEZPIECZENIE: Pobieranie Finansów tylko dla uprawnionych!
            const uRole = ud.role;
            const isBoard = ["admin", "skarbnik", "zarzad"].includes(uRole);
            
            if (isBoard) {
              const duesData = await fetchCol("dues");
              setDues(duesData);
              setFinances(await fetchCol("finances"));

              // Client-side scheduler dla Zarządu
              const now = new Date();
              const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
              const thisMonthDues = duesData.filter(d => d.month === monthKey && (!d.title || d.title === "Składka miesięczna"));
              if(usersSnap.size > 0 && thisMonthDues.length === 0){
                setDuesAlert({ month: monthKey, count: usersSnap.size });
              }
            } else {
              // Zwykły członek pobiera TYLKO własne składki i nie pobiera finansów
              const myDuesSnap = await getDocs(query(collection(db, "dues"), where("userId", "==", firebaseUser.uid)));
              setDues(myDuesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
              setFinances([]);
            }
          }
        } catch (error) {
          console.error("Błąd podczas pobierania z bazy:", error);
        }
      } else {
        setUser(null);
        // Pobierz publiczne dane dla strony głównej (bez logowania)
        try {
          const fetchCol=async(c)=>{const s=await getDocs(collection(db,c));return s.docs.map(d=>({id:d.id,...d.data()}));};
          const pubNews=await fetchCol("news");
          if(pubNews.length>0)setNews(pubNews);
          const pubGallery=await fetchCol("gallery");
          if(pubGallery.length>0)setGallery(pubGallery);
          const pubEvents=await fetchCol("events");
          if(pubEvents.length>0)setEvents(pubEvents);
          const sd=await getDoc(doc(db,"settings","main"));
          if(sd.exists())setSettings(sd.data());
        } catch{}
      }
      setBooted(true);
    });
    return () => unsubscribe();
  }, []);
  
  // ── ESC KEY handler ──
  useEffect(()=>{
    function onKey(e){
      if(e.key==="Escape"){
        if(lightbox) setLightbox(null);
        else if(confirm) setConfirm(null);
        else if(modal||editItem){setModal(null);setEditItem(null);}
        else if(notifOpen) setNotifOpen(false);
      }
    }
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[lightbox,confirm,modal,editItem,notifOpen]);

  // ── CHAT: scroll na dół przy nowej wiadomości lub zmianie rozmówcy ──
  useEffect(()=>{
    if(msgBodyRef.current) msgBodyRef.current.scrollTop=msgBodyRef.current.scrollHeight;
  },[messages,chatWith,msgText]);

  // ── CHAT: oznacz jako przeczytane przy otwarciu rozmowy ──
  useEffect(()=>{
    if(chatWith) markMessagesRead(chatWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[chatWith]);

  const flash=useCallback(m=>{setToast(m);setTimeout(()=>setToast(null),2500);},[]);
  const askConfirm = useCallback((msg, onOk, btnLabel = "Tak") => {
  setConfirm({ msg, onOk, btnLabel });
}, []);
  

  // ── DYNAMICZNY TYTUŁ ZAKŁADKI (WHITE-LABEL) ──
  useEffect(() => {
    document.title = settings.orgName || "Aplikacja Koła";
  }, [settings.orgName]);

  // ── NOTIFICATION HELPER ──
  async function addNotif(userId,type,msg){
    const n={userId,type,msg,date:new Date().toISOString(),read:false};
    const r=await addDoc(collection(db,"notifications"),n);
    setNotifs(prev=>[{id:r.id,...n},...prev]);
  }
  async function markNotifsRead(){
    const unread=notifs.filter(n=>n.userId===user?.id&&!n.read);
    for(const n of unread){
      await updateDoc(doc(db,"notifications",n.id),{read:true});
    }
    setNotifs(prev=>prev.map(n=>n.userId===user?.id?{...n,read:true}:n));
  }
  const myUnreadNotifs=notifs.filter(n=>n.userId===user?.id&&!n.read).length;

  // ── AUTH ──
  async function doRegister({name, email, password}) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const usersSnap = await getDocs(collection(db, "users"));
      const isFirst = usersSnap.empty;
      const newUser = { 
  id: cred.user.uid, 
  name, 
  email, 
  role: isFirst ? "admin" : "member", 
  phone: "", 
  joined: new Date().toISOString().split("T")[0], 
  onboarded: false,
  rating: 3 // <--- Dodaj to, żeby każdy miał bazowe 3 punkty na start
};
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      setUsers(prev=>[...prev, newUser]);
      setUser(newUser);
     // WYSYŁKA MAILA POWITALNEGO
  const bodyTpl = settings.welcomeBody || DEFAULT_SETTINGS.welcomeBody;
  const subjTpl = settings.welcomeSubject || DEFAULT_SETTINGS.welcomeSubject;

  await addDoc(collection(db, "mail_queue"), {
    to: [email],
    message: {
      subject: tplt(subjTpl, { name, orgName: settings.orgName }),
      html: mailWrapper(tplt(bodyTpl, { name, orgName: settings.orgName })) 
    },
  authorId: "system",
  createdAt: new Date().toISOString(),
  status: "queued"
});
      setShowOnboard(true);
      flash(isFirst ? "Witaj! Masz rolę Administratora." : "Rejestracja udana!");
      return null;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') return "Ten e-mail jest już zarejestrowany";
      if (err.code === 'auth/weak-password') return "Hasło musi mieć min. 6 znaków";
      return "Błąd rejestracji: " + err.message;
    }
  }
  async function doLogin({email, password}) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) { setUser(userDoc.data()); flash(`Witaj, ${userDoc.data().name}!`); }
      return null;
    } catch { return "Nieprawidłowy e-mail lub hasło"; }
  }
  async function doLogout() { await signOut(auth); setTab("dashboard"); }

  // ── ONBOARDING COMPLETE ──
  async function finishOnboard(){
    setShowOnboard(false);
    if(user&&!user.onboarded){
      await updateDoc(doc(db,"users",user.id),{onboarded:true});
      setUser({...user,onboarded:true});
      setUsers(prev=>prev.map(u=>u.id===user.id?{...u,onboarded:true}:u));
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CRUD — NEWS
  // ══════════════════════════════════════════════════════════════
  async function addNews(fd){
    const i={title:fd.title,content:fd.content,category:fd.category,date:new Date().toISOString().split("T")[0],authorId:user.id,pinned:false};
    const r = await addDoc(collection(db, "news"), i);
    setNews(prev=>[{ id: r.id, ...i },...prev]); setModal(null); flash("Dodano!");
  }
  async function editNews(fd){
    await updateDoc(doc(db,"news",editItem.id),{title:fd.title,content:fd.content,category:fd.category});
    setNews(prev=>prev.map(n=>n.id===editItem.id?{...n,title:fd.title,content:fd.content,category:fd.category}:n));
    setEditItem(null); flash("Zaktualizowano!");
  }
  async function delNews(id){
    askConfirm("Usunąć tę aktualność?",async()=>{
      await deleteDoc(doc(db,"news",id)); setNews(prev=>prev.filter(n=>n.id!==id)); flash("Usunięto");
    });
  }
  async function togPin(id){
    const item=news.find(n=>n.id===id);
    if(item){await updateDoc(doc(db,"news",id),{pinned:!item.pinned});setNews(prev=>prev.map(n=>n.id===id?{...n,pinned:!n.pinned}:n));}
  }

  // ── IDEAS ──
  async function addIdea(fd){
    const i={title:fd.title,description:fd.description,authorId:user.id,date:new Date().toISOString().split("T")[0],votes:0,voters:[],status:"nowy"};
    const r=await addDoc(collection(db,"ideas"),i);
    setIdeas(prev=>[{id:r.id,...i},...prev]); setModal(null); flash("Dodano!");
  }
  async function editIdea(fd){
    await updateDoc(doc(db,"ideas",editItem.id),{title:fd.title,description:fd.description});
    setIdeas(prev=>prev.map(i=>i.id===editItem.id?{...i,title:fd.title,description:fd.description}:i));
    setEditItem(null); flash("Zaktualizowano!");
  }
  async function delIdea(id){askConfirm("Usunąć?",async()=>{await deleteDoc(doc(db,"ideas",id));setIdeas(prev=>prev.filter(i=>i.id!==id));flash("Usunięto");});}
  async function voteIdea(id){
    const idea=ideas.find(i=>i.id===id);if(!idea)return;
    const alreadyVoted=idea.voters.includes(user.id);
    const ideaRef=doc(db,"ideas",id);
    try {
      await runTransaction(db,async(tx)=>{
        const snap=await tx.get(ideaRef);
        if(!snap.exists())throw new Error("not-found");
        const voters=snap.data().voters||[];
        const hasVoted=voters.includes(user.id);
        if(hasVoted){
          tx.update(ideaRef,{voters:arrayRemove(user.id),votes:increment(-1)});
        } else {
          tx.update(ideaRef,{voters:arrayUnion(user.id),votes:increment(1)});
        }
      });
      const newVoters=alreadyVoted?idea.voters.filter(x=>x!==user.id):[...idea.voters,user.id];
      setIdeas(prev=>prev.map(i=>i.id===id?{...i,voters:newVoters,votes:alreadyVoted?i.votes-1:i.votes+1}:i));
      if(!alreadyVoted&&idea.authorId!==user.id) addNotif(idea.authorId,"vote",`${user.name} zagłosował/a na Twój pomysł: "${idea.title}"`);
    } catch(e){ flash("Błąd głosowania: "+e.message); }
  }
  async function setIdeaStatus(id,st){
    await updateDoc(doc(db,"ideas",id),{status:st});
    setIdeas(prev=>prev.map(i=>i.id===id?{...i,status:st}:i));flash("Status zmieniony");
  }

  // ── RECIPES ──
  async function addRecipe(fd){
    const i={title:fd.title,category:fd.category,ingredients:fd.ingredients,instructions:fd.instructions,authorId:user.id,date:new Date().toISOString().split("T")[0],likes:0,likers:[]};
    const r=await addDoc(collection(db,"recipes"),i);
    setRecipes(prev=>[{id:r.id,...i},...prev]); setModal(null); flash("Dodano!");
  }
  async function editRecipe(fd){
    await updateDoc(doc(db,"recipes",editItem.id),{title:fd.title,category:fd.category,ingredients:fd.ingredients,instructions:fd.instructions});
    setRecipes(prev=>prev.map(r=>r.id===editItem.id?{...r,...fd}:r));
    setEditItem(null); flash("Zaktualizowano!");
  }
  async function delRecipe(id){askConfirm("Usunąć?",async()=>{await deleteDoc(doc(db,"recipes",id));setRecipes(prev=>prev.filter(r=>r.id!==id));flash("Usunięto");});}
  async function likeRecipe(id){
    const r=recipes.find(x=>x.id===id);if(!r)return;
    const alreadyLiked=(r.likers||[]).includes(user.id);
    const recipeRef=doc(db,"recipes",id);
    try {
      await runTransaction(db,async(tx)=>{
        const snap=await tx.get(recipeRef);
        if(!snap.exists())throw new Error("not-found");
        const likers=snap.data().likers||[];
        const hasLiked=likers.includes(user.id);
        if(hasLiked){
          tx.update(recipeRef,{likers:arrayRemove(user.id),likes:increment(-1)});
        } else {
          tx.update(recipeRef,{likers:arrayUnion(user.id),likes:increment(1)});
        }
      });
      setRecipes(prev=>prev.map(x=>{
        if(x.id!==id)return x;
        const newLikers=alreadyLiked?x.likers.filter(l=>l!==user.id):[...(x.likers||[]),user.id];
        return{...x,likers:newLikers,likes:alreadyLiked?x.likes-1:x.likes+1};
      }));
    } catch(e){ flash("Błąd polubienia: "+e.message); }
  }
  async function updatePlayerRating(uid, rating) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { rating });
    
    // Aktualizacja lokalnego stanu, aby zmiany były widoczne natychmiast
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, rating } : u));
    flash("Ocena zawodnika została zaktualizowana!");
  } catch (err) {
    console.error(err);
    flash("Błąd podczas aktualizacji oceny.");
  }
}

async function saveMatchTeams(eventId, teams) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { teams });
    
    // Aktualizujemy lokalny stan
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, teams } : e));
    flash("Składy zostały wylosowane i zapisane!");
  } catch (err) {
    console.error(err);
    flash("Błąd zapisu składów.");
  }
}

async function updateEventTactics(eventId, positions) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { tactics: positions });
    
    // Aktualizacja stanu lokalnego
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, tactics: positions } : e));
  } catch (err) {
    console.error("Błąd zapisu taktyki:", err);
    flash("Nie udało się zapisać ustawienia.");
  }
}

 // ── EVENTS + RSVP ──
  async function addEvent(fd){
    const limit = fd.limit ? parseInt(fd.limit) : 0;
    const cost = fd.cost ? parseFloat(fd.cost) : 0; // Nowe pole
    const i = {
      title: fd.title, date: fd.date, time: fd.time, place: fd.place, description: fd.description, 
      limit: limit, cost: cost, attendees: [], reserve: [], pendingCancellations: []
    };
    const r = await addDoc(collection(db, "events"), i);
    setEvents(prev => [...prev, {id: r.id, ...i}].sort((a,b) => a.date.localeCompare(b.date))); 
    setModal(null); flash("Dodano wydarzenie!");
  }

  async function editEvent(fd){
    const limit = fd.limit ? parseInt(fd.limit) : 0;
    await updateDoc(doc(db, "events", editItem.id), {
      title: fd.title, date: fd.date, time: fd.time, place: fd.place, description: fd.description, limit: limit
    });
    setEvents(prev => prev.map(x => x.id === editItem.id ? {...x, title: fd.title, date: fd.date, time: fd.time, place: fd.place, description: fd.description, limit: limit} : x));
    setModal(null); 
    flash("Zapisano zmiany!");
  }
  
  async function delEvent(id){askConfirm("Usunąć?",async()=>{await deleteDoc(doc(db,"events",id));setEvents(prev=>prev.filter(e=>e.id!==id));flash("Usunięto");});}
  
  // NOWY SYSTEM RSVP (Blokada 36h)
  async function toggleRSVP(eventId) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const isGoing = ev.attendees?.includes(user.id);
    const isPending = ev.pendingCancellations?.includes(user.id);
    const isReserve = ev.reserve?.includes(user.id);
    const limit = ev.limit || 0;
    const isFull = limit > 0 && (ev.attendees?.length || 0) >= limit;

    try {
      if (isReserve) {
        // Jeśli jest na rezerwie i klika, to po prostu z niej rezygnuje
        await updateDoc(doc(db, "events", eventId), { reserve: arrayRemove(user.id) });
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reserve: e.reserve.filter(id => id !== user.id) } : e));
        flash("Usunięto z listy rezerwowej.");
        return;
      }

      if (isGoing) {
        if (isPending) {
          flash("Czekasz na decyzję zarządu o wypisaniu.");
          return;
        }
        
        // ZASADA 36 GODZIN
        const matchDate = new Date(`${ev.date}T${ev.time || "00:00"}`);
        const now = new Date();
        const diffHours = (matchDate - now) / (1000 * 60 * 60);

        if (diffHours < 36) {
          await updateDoc(doc(db, "events", eventId), { pendingCancellations: arrayUnion(user.id) });
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, pendingCancellations: [...(e.pendingCancellations || []), user.id] } : e));
          flash("Do meczu mniej niż 36h! Wysłano prośbę do zarządu.");
        } else {
          // Wypisuje się od razu (bo wcześnie). Musimy też wpuścić kogoś z rezerwy!
          let newAttendees = ev.attendees.filter(id => id !== user.id);
          let newReserve = [...(ev.reserve || [])];
          let promotedMsg = "Wypisano z wydarzenia.";

          // AUTOMATYCZNY AWANS Z REZERWY
          if (limit > 0 && newAttendees.length < limit && newReserve.length > 0) {
            const promotedUserId = newReserve.shift(); // Pobiera pierwszego z rezerwy
            newAttendees.push(promotedUserId);
            promotedMsg = "Wypisano z wydarzenia. Pierwsza osoba z rezerwy wchodzi do gry!";
          }

          await updateDoc(doc(db, "events", eventId), { attendees: newAttendees, reserve: newReserve });
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: newAttendees, reserve: newReserve } : e));
          flash(promotedMsg);
        }
      } else {
        // ZAPISYWANIE SIĘ
        if (isFull) {
          await updateDoc(doc(db, "events", eventId), { reserve: arrayUnion(user.id) });
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reserve: [...(e.reserve || []), user.id] } : e));
          flash("Brak miejsc! Trafiasz na listę rezerwową.");
        } else {
          await updateDoc(doc(db, "events", eventId), { attendees: arrayUnion(user.id) });
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: [...(e.attendees || []), user.id] } : e));
          flash("Jesteś na liście podstawowej!");
        }
      }
    } catch(e) { flash("Błąd: " + e.message); }
  }

  // ── 🎒 LOGISTYKA SPRZĘTU ──
  async function toggleEquipment(eventId, type) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    
    const currentEq = ev.equipment || {};
    const currentProvider = currentEq[type];

    let newProvider = null;
    if (!currentProvider) {
      newProvider = user.id; // Nikt nie ma, biorę ja
    } else if (currentProvider === user.id) {
      newProvider = null; // Rezygnuję z przyniesienia (zwalniam sprzęt)
    } else if (canManage(user.role)) {
      newProvider = null; // Trener może awaryjnie zwolnić czyjś sprzęt kliknięciem
    } else {
      return; // Zwykły gracz nie może odklikać kogoś innego
    }

    const newEq = { ...currentEq, [type]: newProvider };
    try {
      await updateDoc(doc(db, "events", eventId), { equipment: newEq });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, equipment: newEq } : e));
    } catch(e) { flash("Błąd sprzętu: " + e.message); }
  }

  // ── 💰 STATUS OPŁACENIA MECZU (KOSZYCZEK) ──
  async function toggleEventPayment(eventId, targetUid) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    
    const currentPaid = ev.paid || [];
    const isPaid = currentPaid.includes(targetUid);
    
    let newPaid;
    if (isPaid) {
      newPaid = currentPaid.filter(id => id !== targetUid); // Cofa wpłatę
    } else {
      newPaid = [...currentPaid, targetUid]; // Zaznacza jako opłacone
    }

    try {
      await updateDoc(doc(db, "events", eventId), { paid: newPaid });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, paid: newPaid } : e));
    } catch(e) { flash("Błąd płatności: " + e.message); }
  }

  // ROZPATRYWANIE WNIOSKU PRZEZ ADMINA
  async function resolveCancellation(eventId, targetUid, approved) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    
    try {
      if (approved) {
        let newAttendees = ev.attendees.filter(id => id !== targetUid);
        let newReserve = [...(ev.reserve || [])];
        let newPending = ev.pendingCancellations.filter(id => id !== targetUid);
        const limit = ev.limit || 0;

        // Jeśli zwolniło się miejsce, wciągnij pierwszego rezerwowego
        if (limit > 0 && newAttendees.length < limit && newReserve.length > 0) {
          const promotedUserId = newReserve.shift();
          newAttendees.push(promotedUserId);
        }

        await updateDoc(doc(db, "events", eventId), { 
          attendees: newAttendees, 
          pendingCancellations: newPending,
          reserve: newReserve
        });
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: newAttendees, pendingCancellations: newPending, reserve: newReserve } : e));
        flash("Zgoda udzielona. Zawodnik wypisany" + (newReserve.length < (ev.reserve?.length || 0) ? " i wszedł rezerwowy!" : "."));
      } else {
        await updateDoc(doc(db, "events", eventId), { pendingCancellations: arrayRemove(targetUid) });
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, pendingCancellations: e.pendingCancellations.filter(id => id !== targetUid) } : e));
        flash("Prośba o wypisanie odrzucona.");
      }
    } catch(e) { flash("Błąd: " + e.message); }
  }

  // ── 🤖 AGENT AI: SKANER LISTY Z MESSENGERA (Z OBSŁUGĄ GOŚCI) ──
  async function handleImportMessenger(fd) {
    const eventId = modal.eventId;
    const text = fd.text;
    const mode = fd.mode; 
    
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const lines = text.split(/\r?\n/);
    let foundIds = [];
    let guestIds = [];

    lines.forEach(line => {
      let trimmed = line.trim();
      
      // 1. SKANER: Pomijamy linie, które NIE zaczynają się od liczby i kropki (np. "1. ", "12.")
      if (!/^\d+\./.test(trimmed)) return; 

      // 2. CZYSZCZENIE: Wycinamy numer z przodu
      let cleanName = trimmed.replace(/^\d+\.\s*/, '').trim();
      
      // Wycinamy "GK" niezależnie, gdzie stoi, oraz znaki specjalne
      cleanName = cleanName.replace(/\bGK\b/ig, '').replace(/[()]/g, '').trim();
      
      // Usuwamy ewentualne dopiski po " +"
      cleanName = cleanName.split('+')[0].trim();

      // 3. FILTR ŚMIECI: Ignorujemy puste pola i same podkreślniki np "___"
      if (cleanName.length < 2 || /^_+$/.test(cleanName)) return;

      // 4. IDENTYFIKACJA W BAZIE
      const cleanLower = cleanName.toLowerCase();
      
      const match = users.find(u => {
        const dbLower = u.name.toLowerCase();
        
        // Zgoda pełna
        if (cleanLower.includes(dbLower) || dbLower.includes(cleanLower)) return true;
        
        // Częściowa zgoda (np. "Wojtek J" vs "Wojciech Jastrzębski")
        const messengerWords = cleanLower.split(' ').filter(w => w.length > 2);
        const dbWords = dbLower.split(' ').filter(w => w.length > 2);
        
        return messengerWords.some(mw => dbWords.includes(mw));
      });

      if (match) {
        foundIds.push(match.id);
      } else {
        // Jeśli nie znaleziono, dodajemy jako GOŚCIA
        const guestId = "guest_" + cleanName;
        if (!guestIds.includes(guestId)) {
          guestIds.push(guestId);
        }
      }
    });

    // 5. DECYZJA I UNIKALNOŚĆ
    let finalAttendees = [];
    const uniqueFoundIds = [...new Set(foundIds)]; 
    const uniqueGuestIds = [...new Set(guestIds)];
    const allScanned = [...uniqueFoundIds, ...uniqueGuestIds];

    if (mode === "overwrite") {
      finalAttendees = allScanned;
    } else {
      finalAttendees = [...new Set([...(ev.attendees || []), ...allScanned])];
    }

    // 6. ZAPIS DO BAZY
    try {
      await updateDoc(doc(db, "events", eventId), { attendees: finalAttendees });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: finalAttendees } : e));
      
      setModal(null);
      
      if (uniqueGuestIds.length > 0) {
        flash(`🤖 Zapisano ${allScanned.length} graczy (w tym ${uniqueGuestIds.length} gości spoza apki).`);
      } else {
        flash(`🤖 Sukces! Zapisano ${allScanned.length} graczy z aplikacji.`);
      }
    } catch(e) { flash("Błąd Agenta: " + e.message); }
  }

  // ── ⚽ INTELIGENTNE LOSOWANIE SKŁADÓW ──
  async function handleBalanceWithRatings(ratings) {
    const eventId = modal.eventId;
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    // ratings to obiekt typu { [uid]: "4", ... }
    const result = balanceTeams(ev.attendees, users, ratings);
    
    try {
      await saveMatchTeams(eventId, result);
      setModal(null);
      flash("Składy wylosowane na podstawie rang!");
    } catch (e) {
      flash("Błąd losowania: " + e.message);
    }
  }

  // ── DUES (Pojedyncza opłata) ──
  async function addDue(fd){
    const isMonthly = fd.feeType !== "specific";
    const finalTitle = fd.title || "Składka miesięczna";
    
    // Zabezpieczenie przed pustymi polami
    const mDate = fd.month || new Date().toISOString().substring(0, 7);
    const eDate = fd.date || new Date().toISOString().substring(0, 10);
    
    const monthKey = isMonthly ? mDate : eDate.substring(0, 7);
    const exactDate = isMonthly ? null : eDate;
    
    if (finalTitle === "Składka miesięczna") {
      const dupQ = query(collection(db,"dues"), where("userId","==",fd.userId), where("month","==",monthKey));
      const dupSnap = await getDocs(dupQ);
      const isDup = dupSnap.docs.some(d => !d.data().title || d.data().title === "Składka miesięczna");
      if(isDup) { flash("Ta składka już istnieje w tym miesiącu!"); return; }
    }

    const i = {
      userId: fd.userId,
      month: monthKey,
      date: exactDate,
      amount: parseFloat(fd.amount) || settings.dueAmount,
      title: finalTitle,
      paid: false,
      paidDate: null,
      createdAt: new Date().toISOString()
    };
    const r = await addDoc(collection(db,"dues"), i);
    setDues(prev => [...prev, {id: r.id, ...i}]); 
    setModal(null); 
    flash("Opłata dodana!");
  }

  // ── DUES (Skarbnik Akcje) ──
  async function togDue(id){
    const d=dues.find(x=>x.id===id);if(!d)return;
    const isPaid=!d.paid; 
    const pDate=isPaid?new Date().toISOString().split("T")[0]:null;
    
    try {
      await updateDoc(doc(db,"dues",id),{paid:isPaid,paidDate:pDate});
      setDues(prev=>prev.map(x=>x.id===id?{...x,paid:isPaid,paidDate:pDate}:x));
      
      if(isPaid) {
        if(d.userId!==user.id) addNotif(d.userId,"due",`Twoja opłata za: ${d.title || mName(d.month)} opłacona.`);
        const targetUser = users.find(u => u.id === d.userId);
        if(targetUser && targetUser.email) {
          const bodyTpl = settings.duePaidBody || DEFAULT_SETTINGS.duePaidBody;
          const subjTpl = settings.duePaidSubject || DEFAULT_SETTINGS.duePaidSubject;
          const mailDoc = {
            to: [targetUser.email],
            message: {
              subject: tplt(subjTpl, { month: mName(d.month), orgName: settings.orgName }),
              html: mailWrapper(tplt(bodyTpl, { name: targetUser.name, month: mName(d.month), amount: d.amount, currency: settings.dueCurrency, date: pDate, orgName: settings.orgName }))
            },
            authorId: "system", createdAt: new Date().toISOString(), status: "queued"
          };
          await addDoc(collection(db, "mail_queue"), mailDoc);
        }
      }
      if(isPaid) flash("Składka opłacona - e-mail wysłany!");
    } catch(e) { flash("Błąd aktualizacji: " + e.message); }
  }
  async function delDue(id){askConfirm("Usunąć?",async()=>{await deleteDoc(doc(db,"dues",id));setDues(prev=>prev.filter(d=>d.id!==id));flash("Usunięto");});}

  // ── DUES (Grupowe naliczanie np. mecze / wpisowe) ──
  async function addBulkDues(fd){
    const { title, type, fixedAmount, totalAmount, target, feeType } = fd;
    const isMonthly = feeType !== "specific";
    const finalTitle = title || "Składka miesięczna";
    
    const mDate = fd.month || new Date().toISOString().substring(0, 7);
    const eDate = fd.date || new Date().toISOString().substring(0, 10);
    const monthKey = isMonthly ? mDate : eDate.substring(0, 7);
    const exactDate = isMonthly ? null : eDate;
    
    let targetUsers = [];
    if (target === "unpaid") {
      const unpaidIds = [...new Set(dues.filter(d => !d.paid).map(d => d.userId))];
      targetUsers = users.filter(u => unpaidIds.includes(u.id));
    } else {
      if (finalTitle === "Składka miesięczna") {
        const existingSnap = await getDocs(query(collection(db, "dues"), where("month", "==", monthKey)));
        const existingUserIds = new Set(existingSnap.docs.map(d => d.data()).filter(d => !d.title || d.title === "Składka miesięczna").map(d => d.userId));
        targetUsers = users.filter(u => !existingUserIds.has(u.id));
      } else { targetUsers = users; }
    }

    if(targetUsers.length === 0){ flash("Brak osób do obciążenia (lub mają już opłacone)"); return; }

    const amountPerPerson = type === "shared" 
      ? parseFloat((parseFloat(totalAmount) / targetUsers.length).toFixed(2)) 
      : (parseFloat(fixedAmount) || settings.dueAmount);

    const batch = writeBatch(db);
    const newItems = [];
    const now = new Date().toISOString();

    for(const u of targetUsers){
      const newRef = doc(collection(db, "dues"));
      const i = { userId: u.id, month: monthKey, date: exactDate, amount: amountPerPerson, title: finalTitle, paid: false, paidDate: null, createdAt: now };
      batch.set(newRef, i);
      newItems.push({ id: newRef.id, ...i });
    }

    try {
      await batch.commit(); 
      const bodyTpl = settings.dueCreatedBody || DEFAULT_SETTINGS.dueCreatedBody;
      const subjTpl = settings.dueCreatedSubject || DEFAULT_SETTINGS.dueCreatedSubject;

      for(const u of targetUsers){
        if(u.email) {
          const mailDoc = {
            to: [u.email],
            message: {
              subject: tplt(subjTpl, { month: mName(monthKey), orgName: settings.orgName }),
              html: mailWrapper(tplt(bodyTpl, { name: u.name, month: finalTitle === "Składka miesięczna" ? mName(monthKey) : `${finalTitle} (${exactDate || mName(monthKey)})`, amount: amountPerPerson, currency: settings.dueCurrency, orgName: settings.orgName }))
            },
            authorId: "system", createdAt: now, status: "queued"
          };
          await addDoc(collection(db, "mail_queue"), mailDoc);
        }
        addNotif(u.id, "due", `Naliczono opłatę: ${finalTitle} (${amountPerPerson} ${settings.dueCurrency})`);
      }

      setDues(prev => [...prev, ...newItems]); 
      setModal(null); 
      flash(`Naliczono ${finalTitle} dla ${newItems.length} osób.`);
    } catch(e) { flash("Błąd podczas naliczania opłat: " + e.message); }
  }

  // ── DUES (Rozliczanie z Kalendarza) ──
  async function addEventDue(fd) {
    const { eventId, type, totalAmount, fixedAmount, target } = fd;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // 1. USTALAMY GRUPĘ DOCELOWĄ (Naprawa błędu "wszyscy")
    let targetUsers = [];
    if (target === "attendees") {
      targetUsers = users.filter(u => event.attendees?.includes(u.id));
    } else {
      targetUsers = users;
    }

    if (targetUsers.length === 0) return flash("Brak osób do obciążenia!");

    const amountPerPerson = type === "shared" 
      ? (parseFloat(totalAmount) / targetUsers.length).toFixed(2) 
      : parseFloat(fixedAmount);

    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // 2. DODAJEMY WYDATEK DO BUDŻETU (Powiązanie z finansami)
    // Jeśli w formularzu podano totalAmount (shared) lub event ma zapisany koszt
    const financeCost = type === "shared" ? parseFloat(totalAmount) : (event.cost || 0);
    if (financeCost > 0) {
      const finRef = doc(collection(db, "finances"));
      const finData = {
        type: "expense",
        title: `Koszt: ${event.title}`,
        amount: financeCost,
        category: "wynajem",
        date: event.date,
        authorId: user.id,
        eventId: eventId // Powiązanie techniczne
      };
      batch.set(finRef, finData);
      setFinances(prev => [{id: finRef.id, ...finData}, ...prev]);
    }

    // 3. NALICZAMY SKŁADKI INDYWIDUALNE
    const newDues = [];
    targetUsers.forEach(u => {
      const newRef = doc(collection(db, "dues"));
      const i = { 
        userId: u.id, 
        month: event.date.substring(0, 7), 
        date: event.date, 
        amount: parseFloat(amountPerPerson), 
        paid: false, 
        paidDate: null, 
        eventId: eventId, 
        title: event.title, 
        createdAt: now 
      };
      batch.set(newRef, i);
      newDues.push({ id: newRef.id, ...i });
    });

    try {
      await batch.commit();
      setDues(prev => [...prev, ...newDues]);
      setModal(null);
      flash(`Rozliczono! Dodano wydatek i naliczono opłaty dla ${targetUsers.length} osób.`);
      targetUsers.forEach(u => addNotif(u.id, "due", `Nowa opłata za ${event.title}: ${amountPerPerson} ${settings.dueCurrency}`));
    } catch (e) { flash("Błąd: " + e.message); }
  }
 // ── GALLERY (Firebase Storage) ──
  async function addGallery(fd){
    if(!fd.files || !fd.files.length) return;
    
    // Ustalamy uniwersalne nazewnictwo (plik / pliki / plików)
    const count = fd.files.length;
    const label = count === 1 ? 'plik' : count < 5 ? 'pliki' : 'plików';
    flash(`Przesyłanie: ${count} ${label}...`);
    
    try {
      const newItems = [];
      
      // Przechodzimy przez każdy plik w pętli
      for(let i = 0; i < fd.files.length; i++) {
        const file = fd.files[i];
        const filePath = `gallery/${Date.now()}_${i}_${file.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        // Inteligentne nazywanie: Jeśli podano tytuł i jest wiele plików -> numerujemy.
        // Jeśli nie podano tytułu -> używamy oryginalnej nazwy pliku.
        let finalTitle = file.name;
        if(fd.title) {
          finalTitle = fd.files.length > 1 ? `${fd.title} ${i + 1}` : fd.title;
        }

        const item = {
          title: finalTitle,
          imageData: downloadUrl,
          storagePath: filePath,
          authorId: user.id,
          date: new Date().toISOString().split("T")[0],
          albumId: fd.albumId || null 
        };
        
        const docRef = await addDoc(collection(db, "gallery"), item);
        newItems.push({id: docRef.id, ...item});
      }
      
      // Dodajemy wszystkie nowe materiały do stanu za jednym razem
      setGallery(prev => [...newItems, ...prev]); 
      setModal(null); 
      
      // Powiadomienie o sukcesie (materiał / materiały / materiałów)
      const addedCount = newItems.length;
      const addedLabel = addedCount === 1 ? 'materiał' : addedCount < 5 ? 'materiały' : 'materiałów';
      flash(`Pomyślnie dodano: ${addedCount} ${addedLabel}!`);
      
    } catch(e) {
      flash("Błąd przesyłania: " + e.message);
    }
  }

  // ── ALBUMY I USUWANIE Z GALERII ──
  async function addAlbum(fd){
    const a={name:fd.name,description:fd.description||"",authorId:user.id,date:new Date().toISOString().split("T")[0]};
    const r=await addDoc(collection(db,"albums"),a);
    setAlbums(prev=>[...prev,{id:r.id,...a}]);
    setModal(null);
    flash("Dodano album!");
  }

  async function delAlbum(id) {
    askConfirm("Usunąć ten album? Materiały z niego trafią do nieprzypisanych.", async () => {
      await deleteDoc(doc(db, "albums", id));
      setAlbums(prev => prev.filter(a => a.id !== id));
      setGalleryAlbum("all");
      flash("Usunięto album");
    });
  }

  async function delGallery(id) {
    const g = gallery.find(x => x.id === id); 
    if (!g) return;
    askConfirm("Usunąć ten materiał?", async () => {
      try { if (g.storagePath) await deleteObject(ref(storage, g.storagePath)); } catch {}
      await deleteDoc(doc(db, "gallery", id));
      setGallery(prev => prev.filter(x => x.id !== id));
      flash("Usunięto materiał");
    });
  }
  // ── COMMENTS (Firestore) ──
  async function addComment(type,contentId,text){
    const c={type,contentId,authorId:user.id,text,date:new Date().toISOString()};
    const r=await addDoc(collection(db,"comments"),c);
    setComments(prev=>[{id:r.id,...c},...prev]);
    // notify content author
    let authorId=null;
    if(type==="news"){const n=news.find(x=>x.id===contentId);authorId=n?.authorId;}
    if(type==="recipe"){const n=recipes.find(x=>x.id===contentId);authorId=n?.authorId;}
    if(type==="idea"){const n=ideas.find(x=>x.id===contentId);authorId=n?.authorId;}
    if(authorId&&authorId!==user.id&&authorId!=="seed") addNotif(authorId,"comment",`${user.name} skomentował/a Twój wpis.`);
  }
  async function delComment(id){
    await deleteDoc(doc(db,"comments",id));
    setComments(prev=>prev.filter(c=>c.id!==id));
  }

  // ── FINANCES ──
  async function addFinance(fd){
    const i={type:fd.type,title:fd.title,amount:parseFloat(fd.amount)||0,category:fd.category,date:fd.date||new Date().toISOString().split("T")[0],authorId:user.id};
    const r=await addDoc(collection(db,"finances"),i);
    setFinances(prev=>[{id:r.id,...i},...prev]); setModal(null); flash("Dodano!");
  }
  async function delFinance(id){askConfirm("Usunąć?",async()=>{await deleteDoc(doc(db,"finances",id));setFinances(prev=>prev.filter(f=>f.id!==id));flash("Usunięto");});}

  // ── ROLE MANAGEMENT ──
  async function changeRole(uid,newRole){
    if(uid===user.id){flash("Nie możesz zmienić własnej roli!");return;}
    await updateDoc(doc(db,"users",uid),{role:newRole});
    setUsers(prev=>prev.map(u=>u.id===uid?{...u,role:newRole}:u));
    flash("Rola zaktualizowana");
  }

  // ── REMOVE USER (kaskadowe czyszczenie danych) ──
  async function removeUser(uid){
    if(uid===user.id){flash("Nie możesz usunąć własnego konta!");return;}
    const targetUser=users.find(u=>u.id===uid);
    askConfirm(`Usunąć użytkownika ${targetUser?.name}? Zostaną usunięte też jego składki i powiadomienia.`, async()=>{
      try {
        const batch=writeBatch(db);
        // 1. Usuń dokument użytkownika
        batch.delete(doc(db,"users",uid));
        // 2. Usuń składki użytkownika
        const duesSnap=await getDocs(query(collection(db,"dues"),where("userId","==",uid)));
        duesSnap.forEach(d=>batch.delete(d.ref));
        // 3. Usuń powiadomienia użytkownika
        const notifsSnap=await getDocs(query(collection(db,"notifications"),where("userId","==",uid)));
        notifsSnap.forEach(n=>batch.delete(n.ref));
        await batch.commit();
        // Aktualizuj lokalny stan
        setUsers(prev=>prev.filter(u=>u.id!==uid));
        setDues(prev=>prev.filter(d=>d.userId!==uid));
        setNotifs(prev=>prev.filter(n=>n.userId!==uid));
        flash(`Użytkownik ${targetUser?.name} został usunięty`);
      } catch(e){ flash("Błąd usuwania: "+e.message); }
    });
  }

  // ── SAVE SETTINGS ──
  async function saveSettings(s){
    await setDoc(doc(db,"settings","main"),s,{merge:true});
    flash("Ustawienia zapisane!");
  }

  // ── SETUP WIZARD (Kreator pierwszej instalacji) ──
  async function handleSetupComplete(wizardSettings) {
    // Łączymy dotychczasowe (domyślne) ustawienia z nowymi i oznaczamy jako ukończone
    const finalData = { ...settings, ...wizardSettings, setupCompleted: true };
    await setDoc(doc(db, "settings", "main"), finalData, { merge: true });
    setSettings(finalData);
    flash("Konfiguracja zakończona! Witaj w swojej nowej aplikacji.");
  }

  // ── UPLOAD LOGO ──
  async function uploadLogo(file){
    if(file.size>2*1024*1024){flash("Max 2 MB!");return;}
    flash("Przesyłanie logo...");
    try{
      const sRef=ref(storage,"org/logo.png");
      await uploadBytes(sRef,file);
      const url=await getDownloadURL(sRef);
      const newS={...settings,orgLogoUrl:url};
      await setDoc(doc(db,"settings","main"),newS,{merge:true});
      setSettings(newS);
      flash("Logo zaktualizowane!");
    }catch(e){flash("Błąd: "+e.message);}
  }

  // ── POLLS ──
  async function addPoll(fd){
    const opts=(fd.options||"").split("\n").map(s=>s.trim()).filter(Boolean).map((text,i)=>({id:String(i),text,voters:[]}));
    if(opts.length<2){flash("Podaj co najmniej 2 opcje!");return;}
    const p={title:fd.title,description:fd.description||"",options:opts,multiSelect:fd.multiSelect==="tak",deadline:fd.deadline||null,authorId:user.id,date:new Date().toISOString().split("T")[0],closed:false,totalVoters:[]};
    const r=await addDoc(collection(db,"polls"),p);
    setPolls(prev=>[{id:r.id,...p},...prev]);setModal(null);flash("Ankieta dodana!");
  }
  async function votePoll(pollId,optionId){
    const poll=polls.find(p=>p.id===pollId);if(!poll||poll.closed)return;
    const pollRef=doc(db,"polls",pollId);
    try{
      await runTransaction(db,async(tx)=>{
        const snap=await tx.get(pollRef);if(!snap.exists())return;
        const d=snap.data();
        let opts=[...d.options.map(o=>({...o,voters:[...o.voters]}))];
        let totalVoters=[...(d.totalVoters||[])];
        const alreadyVotedThis=opts.find(o=>o.id===optionId)?.voters.includes(user.id);
        if(!d.multiSelect){
          // Single choice — remove from all, toggle on selected
          opts=opts.map(o=>({...o,voters:o.voters.filter(v=>v!==user.id)}));
          totalVoters=totalVoters.filter(v=>v!==user.id);
        }
        const opt=opts.find(o=>o.id===optionId);
        if(alreadyVotedThis){
          opt.voters=opt.voters.filter(v=>v!==user.id);
          if(!opts.some(o=>o.voters.includes(user.id)))totalVoters=totalVoters.filter(v=>v!==user.id);
        } else {
          opt.voters.push(user.id);
          if(!totalVoters.includes(user.id))totalVoters.push(user.id);
        }
        tx.update(pollRef,{options:opts,totalVoters});
      });
      const updated=await getDoc(doc(db,"polls",pollId));
      setPolls(prev=>prev.map(p=>p.id===pollId?{id:pollId,...updated.data()}:p));
    }catch(e){flash("Błąd głosowania");}
  }
  async function closePoll(id){
    await updateDoc(doc(db,"polls",id),{closed:true});
    setPolls(prev=>prev.map(p=>p.id===id?{...p,closed:true}:p));flash("Ankieta zamknięta");
  }
  async function delPoll(id){
    askConfirm("Usunąć ankietę?",async()=>{
      await deleteDoc(doc(db,"polls",id));
      setPolls(prev=>prev.filter(p=>p.id!==id));flash("Usunięto");
    });
  }

  // ── MESSAGES ──
  async function sendMessage(toUserId, text){
    if(!text.trim()) return;
    const m = { from: user.id, to: toUserId, text: text.trim(), date: new Date().toISOString(), read: false };
    const r = await addDoc(collection(db, "messages"), m);
    setMessages(prev => [...prev, { id: r.id, ...m }]);

    // INTELIGENTNE POWIADOMIENIE E-MAIL
    const target = users.find(u => u.id === toUserId);
    if(target && target.email && toUserId !== "group_general") {
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      const lastSent = target.lastMailSent ? new Date(target.lastMailSent).getTime() : 0;

      // Wyślij maila tylko jeśli minęły min. 4 godziny od poprzedniego
      if (now - lastSent > fourHours) {
        await addDoc(collection(db, "mail_queue"), {
          to: [target.email],
          message: {
            subject: `Nowa wiadomość w aplikacji od: ${user.name}`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <p>Cześć ${target.name}, masz nowe wiadomości na czacie w aplikacji ${settings.orgName}.</p>
                <p><strong>${user.name} napisał/a:</strong> "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"</p>
                <p>Zaloguj się, aby odpowiedzieć.</p>
              </div>
            `
          },
          authorId: "system",
          createdAt: new Date().toISOString(),
          status: "queued"
        });
        
        // Aktualizacja czasu ostatniej wysyłki u odbiorcy w bazie i lokalnie
        await updateDoc(doc(db, "users", toUserId), { lastMailSent: new Date().toISOString() });
        setUsers(prev => prev.map(u => u.id === toUserId ? { ...u, lastMailSent: new Date().toISOString() } : u));
      }
    }
  }

  async function markMessagesRead(partnerId) {
    // 1. Znajdź nieprzeczytane wiadomości od tego konkretnego nadawcy do nas
    const unread = messages.filter(m => m.from === partnerId && m.to === user?.id && !m.read);
    if (unread.length === 0) return;

    // 2. Zaktualizuj status "read: true" w bazie danych Firebase
    for (const m of unread) {
      await updateDoc(doc(db, "messages", m.id), { read: true });
    }

    // 3. Zaktualizuj stan lokalny (aby natychmiast zniknęła czerwona kropka powiadomienia)
    setMessages(prev => prev.map(m => 
      (m.from === partnerId && m.to === user?.id) ? { ...m, read: true } : m
    ));
  }

  /// ── MAILING (Kolejka do Firebase Trigger Email) ──
  async function queueMassMail(fd){
    try {
      let targetUsers = [];
      if(fd.audience === "all") {
        targetUsers = users;
      } else if(fd.audience === "unpaid") {
        const unpaidUserIds = [...new Set(dues.filter(d => !d.paid).map(d => d.userId))];
        targetUsers = users.filter(u => unpaidUserIds.includes(u.id));
      } else if(fd.audience === "zarzad") {
        targetUsers = users.filter(u => canManage(u.role));
      } else if(fd.audience === "custom") {
        // Nowa opcja: Wybrani ręcznie
        targetUsers = users.filter(u => fd.customUsers.includes(u.id));
      }
      
      // Filtrujemy tylko tych, którzy mają wpisany e-mail i omijamy duplikaty
      const uniqueUsers = [];
      const seenEmails = new Set();
      for (const u of targetUsers) {
        if (u.email && !seenEmails.has(u.email)) {
          seenEmails.add(u.email);
          uniqueUsers.push(u);
        }
      }

      if(uniqueUsers.length === 0) { flash("Błąd: Wybrana grupa nie ma adresów e-mail."); return; }

      // Tworzymy paczkę zapisów do bazy
      const batch = writeBatch(db);
      
      // Generujemy ODDZIELNEGO maila dla każdego, żeby tag {{name}} zadziałał per osoba!
      for (const u of uniqueUsers) {
         const mailRef = doc(collection(db, "mail_queue"));
         
         const personalizedSubject = tplt(fd.subject, { name: u.name, orgName: settings.orgName });
         const personalizedHtml = mailWrapper(tplt(fd.htmlBody, { name: u.name, orgName: settings.orgName }));

         const mailDoc = {
           to: [u.email],
           message: {
             subject: personalizedSubject,
             html: personalizedHtml
           },
           authorId: user.id,
           createdAt: new Date().toISOString(),
           audience: fd.audience,
           status: "queued"
         };
         
         if(fd.attachments && fd.attachments.length > 0) {
           mailDoc.message.attachments = fd.attachments;
         }
         
         batch.set(mailRef, mailDoc);
      }
      
      await batch.commit();

      setTab("dashboard");
      flash(`Wysłano! Wygenerowano ${uniqueUsers.length} spersonalizowanych wiadomości.`);
    } catch(e) {
      flash("Błąd mailingu: " + e.message);
    }
  }

  // ── DOCUMENTS ──
  async function addDocument(fd){
    if(!fd.file){flash("Wybierz plik!");return;}
    try{
      const ext=fd.file.name.split(".").pop().toLowerCase();
      const path=`documents/${user.id}_${Date.now()}.${ext}`;
      const sRef=ref(storage,path);
      await uploadBytes(sRef,fd.file);
      const url=await getDownloadURL(sRef);
      // Zapisujemy jako folder, ale dla wstecznej kompatybilności nadpisujemy też category
      const d={title:fd.title||fd.file.name,description:fd.description||"",url,fileName:fd.file.name,fileSize:fd.file.size,category:fd.folder||"Inne",folder:fd.folder||"Inne",storagePath:path,authorId:user.id,date:new Date().toISOString().split("T")[0]};
      const r=await addDoc(collection(db,"documents"),d);
      setDocuments(prev=>[{id:r.id,...d},...prev]);setModal(null);flash("Dokument dodany!");
    }catch(e){flash("Błąd przesyłania: "+e.message);}
  }
  async function delDocument(id){
    const d=documents.find(x=>x.id===id);if(!d)return;
    askConfirm("Usunąć dokument?",async()=>{
      try{if(d.storagePath)await deleteObject(ref(storage,d.storagePath));}catch{}
      await deleteDoc(doc(db,"documents",id));
      setDocuments(prev=>prev.filter(x=>x.id!==id));flash("Usunięto");
    });
  }

  // ── MEMBER CSV EXPORT ──
  function exportMembersCSV(){
    const rows=users.map(u=>[u.name,u.email,ROLES.find(r=>r.value===u.role)?.label||u.role,u.phone||"",fDate(u.joined)]);
    downloadCSV(`członkowie_${new Date().toISOString().split('T')[0]}.csv`,rows,['Imię i nazwisko','Email','Rola','Telefon','Data dołączenia']);
    flash("Eksport CSV gotowy!");
  }

  // ── QUICK THEME CHANGE (sidebar) ──
  async function quickTheme(key){
    if(!user)return;
    await updateDoc(doc(db,"users",user.id),{theme:key});
    const updated={...user,theme:key};
    setUser(updated);
    setUsers(prev=>prev.map(u=>u.id===user.id?updated:u));
    const label = key==="auto" ? "Automatyczny" : `${SEASONS[key].name} ${SEASONS[key].emoji}`;
    flash(`Motyw: ${label}`);
  }

  // ── EXPORT CSV ──
  function downloadCSV(filename, rows, headers){
    const escape = v => `"${String(v??'').replace(/"/g,'""')}"`;
    const lines = [headers.map(escape).join(','), ...rows.map(r=>r.map(escape).join(','))];
    const blob = new Blob(['\uFEFF'+lines.join('\n')], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  }

  function exportFinancesCSV() {
  const sorted = [...finances].sort((a, b) => b.date.localeCompare(a.date));
  
  // Nowe sumowanie uwzględniające wydarzenia
  const inc = finances.filter(f => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const exp = finances.filter(f => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  
  const paidDues = dues.filter(d => d.paid);
  const regularDuesTotal = paidDues.filter(d => !d.eventId).reduce((s, d) => s + d.amount, 0);
  const eventDuesTotal = paidDues.filter(d => d.eventId).reduce((s, d) => s + d.amount, 0);
  const allDuesTotal = regularDuesTotal + eventDuesTotal;

  const rows = sorted.map(f => [
    f.date, f.type === "income" ? "Przychód" : "Wydatek", f.title, f.category,
    f.type === "income" ? f.amount : 0, f.type === "expense" ? f.amount : 0
  ]);
  
  rows.push([]);
  rows.push(['', '', '', 'SUMA: Składki stałe', regularDuesTotal, '']);
  rows.push(['', '', '', 'SUMA: Opłaty wydarzeniowe', eventDuesTotal, '']);
  rows.push(['', '', '', 'SUMA: Inne przychody', inc, '']);
  rows.push(['', '', '', 'SUMA: Wszystkie wydatki', '', exp]);
  rows.push(['', '', '', 'BILANS KOŃCOWY', inc + allDuesTotal - exp, '']);

  downloadCSV(`finanse_organizacji_${new Date().toISOString().split('T')[0]}.csv`, rows,
    ['Data', 'Typ', 'Tytuł', 'Kategoria', `Przychód (${settings.dueCurrency})`, `Wydatek (${settings.dueCurrency})`]);
  flash('Raport finansowy wyeksportowany!');
}

  function exportDuesCSV(){
    const rows=dues.map(d=>{
      const u=users.find(x=>x.id===d.userId);
      return [u?.name??'Nieznany', u?.email??'', d.month, d.amount, d.paid?'Tak':'Nie', d.paidDate??''];
    });
    downloadCSV(`składki_${new Date().toISOString().split('T')[0]}.csv`,rows,
      ['Imię i nazwisko','Email','Miesiąc',`Kwota (${settings.dueCurrency})`,'Zapłacono','Data zapłaty']);
    flash('Eksport CSV gotowy!');
  }

  // ── SEARCH
  // ══════════════════════════════════════════════════════════════
  function getSearchResults(q){
    if(!q||q.length<2)return[];
    const ql=q.toLowerCase();const res=[];
    news.forEach(n=>{if(n.title.toLowerCase().includes(ql)||n.content?.toLowerCase().includes(ql)) res.push({type:"Aktualność",label:n.title,tab:"news"});});
    recipes.forEach(r=>{if(r.title.toLowerCase().includes(ql)) res.push({type:"Przepis",label:r.title,tab:"recipes"});});
    ideas.forEach(i=>{if(i.title.toLowerCase().includes(ql)) res.push({type:"Pomysł",label:i.title,tab:"ideas"});});
    events.forEach(e=>{if(e.title.toLowerCase().includes(ql)) res.push({type:"Wydarzenie",label:e.title,tab:"events"});});
    users.forEach(u=>{if(u.name.toLowerCase().includes(ql)) res.push({type:"Członek",label:u.name,tab:"members"});});
    polls.forEach(p=>{if(p.title.toLowerCase().includes(ql)) res.push({type:"Ankieta",label:p.title,tab:"polls"});});
    documents.forEach(d=>{if(d.title.toLowerCase().includes(ql)||d.fileName?.toLowerCase().includes(ql)) res.push({type:"Dokument",label:d.title,tab:"documents"});});
    return res.slice(0,8);
  }

  // ══════════════════════════════════════════════════════════════
  // LOADING / AUTH
  // ══════════════════════════════════════════════════════════════
  if(!booted)return(<div style={{display:"flex",height:"100vh",background:T.bg}}>
    <style>{getThemeCSS(T)}</style>
    {/* Skeleton sidebar */}
    <div style={{width:270,background:`linear-gradient(180deg,${T.side1},${T.side2})`,padding:"22px 18px",flexShrink:0}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20,gap:8}}>
        <div className="sk sk-circle" style={{width:54,height:54}}/>
        <div className="sk sk-line med" style={{background:"rgba(255,255,255,.12)"}}/>
        <div className="sk sk-line short" style={{background:"rgba(255,255,255,.08)"}}/>
      </div>
      {[1,2,3,4,5,6,7].map(i=><div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 14px",marginBottom:2}}>
        <div className="sk sk-circle" style={{width:20,height:20,background:"rgba(255,255,255,.1)"}}/>
        <div className="sk sk-line" style={{height:12,width:`${55+i*5}%`,background:"rgba(255,255,255,.1)"}}/>
      </div>)}
    </div>
    {/* Skeleton main content */}
    <div style={{flex:1,padding:"26px 34px"}}>
      {/* Banner skeleton */}
      <div className="sk" style={{height:130,borderRadius:12,marginBottom:20}}/>
      {/* Stats row */}
      <div className="sg" style={{marginBottom:20}}>
        {[1,2,3,4].map(i=><div key={i} className="sk-card"><div className="sk sk-line short" style={{marginBottom:8}}/><div className="sk sk-stat"/></div>)}
      </div>
      {/* Two column cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[1,2].map(col=><div key={col}>
          <div className="sk sk-line med" style={{marginBottom:10}}/>
          {[1,2,3].map(i=><div key={i} className="sk-card" style={{padding:14}}>
            <div className="sk sk-line short" style={{marginBottom:8,height:11}}/>
            <div className="sk sk-title"/>
            <div className="sk sk-line med" style={{height:11}}/>
          </div>)}
        </div>)}
      </div>
    </div>
  </div>);
  if(!user)return<><style>{getThemeCSS(T)}</style>{showLanding?<LandingPage settings={settings} news={news} events={events} gallery={gallery} onEnter={()=>setShowLanding(false)}/>:<AuthScreen onLogin={doLogin} onRegister={doRegister} onBack={()=>setShowLanding(true)} settings={settings}/>}</>;
  if (user && isAdmin(user.role) && !settings.setupCompleted) {
    return (
      <>
        <style>{getThemeCSS(T)}</style>
        <SetupWizard onComplete={handleSetupComplete} />
      </>
    );
  }

  // Zabezpieczenie: jeśli zwykły członek wejdzie w trakcie gdy założyciel konfiguruje apkę
  if (user && !isAdmin(user.role) && !settings.setupCompleted) {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#f4f8fb' }}>
        <div className="card" style={{ textAlign:'center', padding:'40px 30px', maxWidth: 400 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", marginBottom:15 }}>Aplikacja w konfiguracji 🛠️</h2>
          <p style={{ color:'var(--tm)', lineHeight:1.5 }}>Administrator właśnie dostosowuje system dla Waszej organizacji. Wróć za kilka minut!</p>
          <button className="btn btn-p" onClick={doLogout} style={{ marginTop:25, width:'100%' }}>Wyloguj mnie</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // NAV
  // ══════════════════════════════════════════════════════════════
  const myUnpaid=dues.filter(d=>d.userId===user.id&&!d.paid).length;
  const allUnpaid=dues.filter(d=>!d.paid).length;
  const dueBadge=canSeeDues(user.role)?allUnpaid:myUnpaid;
  const msgBadge=messages.filter(m=>m.to===user.id && m.from !== user.id && !m.read && users.some(u=>u.id===m.from)).length;

  const nav=[
    {id:"dashboard", label: settings.labelDashboard || "Strona główna", icon:I.home},
    {id:"news", label: settings.labelNews || "Aktualności", icon:I.cal},
    {id:"members", label: settings.labelMembers || "Członkowie", icon:I.users},
  ];
  if(settings.modDues !== false && canSeeDues(user.role)) 
    nav.push({id:"dues", label: settings.labelDues || "Skarbnik", icon:I.wallet, badge:dueBadge||null});
  
  if(settings.modIdeas !== false) 
    nav.push({id:"ideas", label: settings.labelIdeas || "Pomysły", icon:I.bulb});
  
  if(settings.modPolls !== false) 
    nav.push({id:"polls", label: settings.labelPolls || "Ankiety", icon:I.poll});
  
  if(settings.modRecipes !== false) 
    nav.push({id:"recipes", label: settings.labelRecipes || "Przepisy", icon:I.book});
  
  if(settings.modEvents !== false) 
    nav.push({id:"events", label: settings.labelEvents || "Kalendarz", icon:I.cal});
  
  if(settings.modGallery !== false) 
    nav.push({id:"gallery", label: settings.labelGallery || "Galeria", icon:I.img});
  
  if(settings.modDocuments !== false) 
    nav.push({id:"documents", label: settings.labelDocs || "Dokumenty", icon:I.file});
  
  nav.push({id:"messages", label: settings.labelMessages || "Wiadomości", icon:I.chat, badge:msgBadge||null});
  
  if(settings.modFinances !== false && canSeeDues(user.role)) 
    nav.push({id:"finances", label: settings.labelFinances || "Finanse", icon:I.finance});
  
  if(canManage(user.role)) 
    nav.push({id:"mailing", label: settings.labelMailing || "Mailing", icon:"✉️"});
  
  if(canManage(user.role)) 
    nav.push({id:"admin", label: settings.labelAdmin || "Zarządzanie", icon:I.gear});
  
  if(isAdmin(user.role)) 
    nav.push({id:"settings", label: settings.labelSettings || "Ustawienia", icon:I.sliders});
  
  // Dynamiczny profil (usuwamy duplikat poniżej)
  nav.push({id:"profile", label: settings.labelProfile || "Mój Profil", icon:I.user});
  
  // Dynamiczna pomoc
  nav.push({id:"guide", label: settings.labelGuide || "Pomoc", icon:I.info});

  // helper to open edit
  function openEdit(type,item){
    setEditItem({...item,_type:type});
  }


  // ══════════════════════════════════════════════════════════════
  // MODALS
  // ══════════════════════════════════════════════════════════════
  function renderModal(){
    if(editItem){
      const t=editItem._type;
      if(t==="news")return<FModal title="Edytuj aktualność" fields={[{n:"title",l:"Tytuł",t:"text",req:1,def:editItem.title},{n:"content",l:"Treść",t:"textarea",req:1,def:editItem.content},{n:"category",l:"Kategoria",t:"select",o:[{v:"aktualność",l:"Aktualność"},{v:"ogłoszenie",l:"Ogłoszenie"},{v:"wydarzenie",l:"Wydarzenie"}],def:editItem.category}]} onSubmit={editNews} onClose={()=>setEditItem(null)}/>;
      if(t==="idea")return<FModal title="Edytuj pomysł" fields={[{n:"title",l:"Tytuł",t:"text",req:1,def:editItem.title},{n:"description",l:"Opis",t:"textarea",req:1,def:editItem.description}]} onSubmit={editIdea} onClose={()=>setEditItem(null)}/>;
      if(t==="recipe")return<FModal title="Edytuj przepis" fields={[{n:"title",l:"Nazwa",t:"text",req:1,def:editItem.title},{n:"category",l:"Kategoria",t:"select",o:[{v:"ciasta",l:"Ciasta"},{v:"zupy",l:"Zupy"},{v:"dania główne",l:"Dania główne"},{v:"sałatki",l:"Sałatki"},{v:"przetwory",l:"Przetwory"},{v:"inne",l:"Inne"}],def:editItem.category},{n:"ingredients",l:"Składniki",t:"textarea",req:1,def:editItem.ingredients},{n:"instructions",l:"Przygotowanie",t:"textarea",req:1,def:editItem.instructions}]} onSubmit={editRecipe} onClose={()=>setEditItem(null)}/>;
      
      // --- TUTAJ DODAŁEM POLE LIMITU DO EDYCJI WYDARZENIA ---
      if(t==="event")return<FModal title="Edytuj wydarzenie" fields={[{n:"title",l:"Nazwa",t:"text",req:1,def:editItem.title},{n:"date",l:"Data",t:"date",req:1,def:editItem.date},{n:"time",l:"Godzina",t:"time",req:1,def:editItem.time},{n:"place",l:"Miejsce",t:"text",req:1,def:editItem.place},{n:"description",l:"Opis",t:"textarea",def:editItem.description}, {n:"limit",l:"Limit miejsc (0 = brak limitu)",t:"number",def:editItem.limit}]} onSubmit={editEvent} onClose={()=>setEditItem(null)}/>;
    }
    
    if(!modal) return null;

    // --- Obsługa różnych typów zmiennej modal ---
    const mType = typeof modal === 'string' ? modal : modal.type;

    if (mType === "addEventDue") {
      const ev = events.find(e => e.id === modal.eventId);
      return (
        <FModal 
          title={`Rozlicz: ${ev.title}`} 
          fields={[
            { n: "eventId", t: "hidden", def: modal.eventId },
            { n: "target", l: "Kogo obciążyć?", t: "select", o: [
              { v: "attendees", l: "Tylko uczestników (zapisanych w RSVP)" }, // Teraz domyślne
              { v: "all", l: "Wszystkich członków organizacji" }
            ]},
            { n: "type", l: "Sposób naliczania", t: "select", o: [
              { v: "fixed", l: "Stała kwota (np. składka meczowa)" },
              { v: "shared", l: "Podział kosztu całkowitego na osoby" }
            ]},
            { n: "fixedAmount", l: "Kwota na osobę", t: "number", def: "15", hideIf: (fd) => fd.type === "shared" },
            { n: "totalAmount", l: "Suma do podziału (stworzy też wydatek w budżecie)", t: "number", def: ev.cost || "0", hideIf: (fd) => fd.type === "fixed" },
          ]} 
          onSubmit={addEventDue} 
          onClose={() => setModal(null)} 
        />
      );
    }

    if (mType === "importMessenger") {
      return (
        <FModal 
          title="🤖 Skaner Listy z Messengera" 
          fields={[
            { n: "text", l: "Wklej CAŁĄ listę (skopiuj prosto z Messengera, ja usunę śmieci i powtórzenia)", t: "textarea", req: 1 },
            { n: "mode", l: "Co zrobić ze składem?", t: "select", o: [
              { v: "overwrite", l: "Zastąp (Nadpisz całkowicie listę w aplikacji listą z czatu)" },
              { v: "add", l: "Tylko dopisz (Nie usuwaj wcześniej zapisanych w aplikacji)" }
            ]}
          ]} 
          onSubmit={handleImportMessenger} 
          onClose={() => setModal(null)} 
        />
      );
    }

    if (mType === "balanceSettings") {
      const fields = modal.attendees.map(uid => {
        // Pobieramy domyślny rating z bazy dla stałych graczy, dla gości dajemy 3
        const userObj = users.find(u => u.id === uid);
        const defaultVal = userObj?.rating || 3;

        return {
          n: uid,
          l: uName(users, uid),
          t: "select",
          o: [
            { v: 1, l: "1 - Bardzo słaby" },
            { v: 2, l: "2 - Słaby" },
            { v: 3, l: "3 - Średni" },
            { v: 4, l: "4 - Dobry" },
            { v: 5, l: "5 - Kocur" }
          ],
          def: defaultVal
        };
      });

      return (
        <FModal 
          title="Ustaw poziom zawodników" 
          fields={fields} 
          onSubmit={handleBalanceWithRatings} 
          onClose={() => setModal(null)} 
        />
      );
    }

    const ms={
      addNews:{t:"Nowa aktualność",fn:addNews,f:[{n:"title",l:"Tytuł",t:"text",req:1},{n:"content",l:"Treść",t:"textarea",req:1},{n:"category",l:"Kategoria",t:"select",o:[{v:"aktualność",l:"Aktualność"},{v:"ogłoszenie",l:"Ogłoszenie"},{v:"wydarzenie",l:"Wydarzenie"}]}]},
      addIdea:{t:"Nowy pomysł",fn:addIdea,f:[{n:"title",l:"Tytuł",t:"text",req:1},{n:"description",l:"Opis",t:"textarea",req:1}]},
      // NOWA, DYNAMICZNA WERSJA
      addRecipe: {
        t: `Nowy wpis: ${settings.labelRecipes || "Zasoby"}`, fn: addRecipe, f: [
          { n: "title", l: "Nazwa", t: "text", req: 1 },
          { n: "category", l: "Kategoria", t: "select", o: (settings.recipeFields?.cats || ["Taktyka", "Trening", "Analiza", "Stałe fragmenty", "Inne"]).map(c => ({ v: c.toLowerCase(), l: c })) },
          { n: "ingredients", l: settings.recipeFields?.ingrLabel || "Sprzęt / Elementy", t: "textarea", req: 1 },
          { n: "instructions", l: settings.recipeFields?.instrLabel || "Przebieg / Opis", t: "textarea", req: 1 }
        ]
      },
      addEvent: { 
  t: "Nowe wydarzenie", 
        fn: addEvent, 
        f: [
          {n:"title",l:"Tytuł",t:"text",req:1},
          {n:"date",l:"Data",t:"date",req:1},
          {n:"time",l:"Godzina",t:"time",req:1},
          {n:"place",l:"Miejsce",t:"text",req:1},
          {n:"cost",l:"Koszt wynajmu/organizacji (opcjonalnie)",t:"number"}, // Nowe pole kosztu
          {n:"description",l:"Opis",t:"textarea"},
          {n:"limit",l:"Limit miejsc (0 = brak limitu)",t:"number"}
        ]
      },
      addDue: { 
        t: "Dodaj opłatę indywidualną", fn: addDue, f: [
          { n: "userId", l: "Członek", t: "select", o: users.map(u => ({ v: u.id, l: u.name })) },
          { n: "feeType", l: "Typ terminu", t: "select", o: [
              { v: "monthly", l: "Miesięczna (wybierasz miesiąc)" },
              { v: "specific", l: "Z konkretnego dnia (np. mecz)" }
          ]},
          { n: "title", l: "Tytuł (np. Mecz, Składka)", t: "text", def: "Składka miesięczna" },
          { n: "month", l: "Wybierz miesiąc", t: "month", hideIf: (fd) => fd.feeType === "specific" },
          { n: "date", l: "Wybierz dokładną datę", t: "date", hideIf: (fd) => fd.feeType !== "specific" },
          { n: "amount", l: "Kwota", t: "number", req: 1, def: String(settings.dueAmount) }
        ]
      },
      bulkDue: { 
        t: "Grupowe naliczanie opłat", fn: addBulkDues, f: [
          { n: "feeType", l: "Typ terminu", t: "select", o: [
              { v: "monthly", l: "Miesięczna (wybierasz miesiąc)" },
              { v: "specific", l: "Z konkretnego dnia (np. mecz)" }
          ]},
          { n: "title", l: "Tytuł opłaty (np. Wyjazd na mecz)", t: "text", req: 1, def: "Składka miesięczna" },
          { n: "month", l: "Wybierz miesiąc", t: "month", hideIf: (fd) => fd.feeType === "specific" },
          { n: "date", l: "Wybierz datę wydarzenia", t: "date", hideIf: (fd) => fd.feeType !== "specific" },
          { n: "type", l: "Sposób naliczania", t: "select", o: [
              { v: "fixed", l: "Stała kwota na osobę" },
              { v: "shared", l: "Kwota do podziału na wszystkich" }
          ]},
          { n: "fixedAmount", l: "Kwota na osobę", t: "number", def: String(settings.dueAmount), hideIf: (fd) => fd.type === "shared" },
          { n: "totalAmount", l: "Całkowita suma do podziału", t: "number", def: "500", hideIf: (fd) => fd.type === "fixed" },
          { n: "target", l: "Kogo obciążyć?", t: "select", o: [
              { v: "all", l: "Wszystkich członków" },
              { v: "unpaid", l: "Tylko z zaległościami" }
          ]}
        ]
      },
      addIncome:{t:"Nowy przychód",fn:(fd)=>addFinance({...fd,type:"income"}),f:[{n:"title",l:"Tytuł",t:"text",req:1},{n:"amount",l:"Kwota",t:"number",req:1},{n:"category",l:"Kategoria",t:"select",o:[{v:"dotacja",l:"Dotacja"},{v:"darowizna",l:"Darowizna"},{v:"kiermasz",l:"Kiermasz"},{v:"inne",l:"Inne"}]},{n:"date",l:"Data",t:"date",req:1}]},
      addExpense:{t:"Nowy wydatek",fn:(fd)=>addFinance({...fd,type:"expense"}),f:[{n:"title",l:"Tytuł",t:"text",req:1},{n:"amount",l:"Kwota",t:"number",req:1},{n:"category",l:"Kategoria",t:"select",o:[{v:"materiały",l:"Materiały"},{v:"wynajem",l:"Wynajem"},{v:"catering",l:"Catering"},{v:"transport",l:"Transport"},{v:"inne",l:"Inne"}]},{n:"date",l:"Data",t:"date",req:1}]},
      addPollModal:{t:"Nowa ankieta",fn:addPoll,f:[{n:"title",l:"Pytanie / Tytuł *",t:"text",req:1},{n:"description",l:"Opis (opcjonalny)",t:"textarea"},{n:"options",l:"Opcje odpowiedzi *\n(każda w nowej linii)",t:"textarea",req:1},{n:"multiSelect",l:"Wielokrotny wybór",t:"select",o:[{v:"nie",l:"Nie — jedna odpowiedź"},{v:"tak",l:"Tak — wiele odpowiedzi"}]},{n:"deadline",l:"Termin głosowania (opcjonalny)",t:"date"}]},
    };

    if(mType==="addGallery") return (
      <GalleryModal 
        onClose={() => setModal(null)} 
        onSubmit={addGallery} 
        albums={albums} 
        defaultAlbum={galleryAlbum !== "all" && galleryAlbum !== "unassigned" ? galleryAlbum : null} 
      />
    );
    if(mType==="addAlbum")return<AddAlbumModal onClose={()=>setModal(null)} onSubmit={addAlbum}/>;
    if(mType==="addDocument")return<DocumentModal onClose={()=>setModal(null)} onSubmit={addDocument} folders={settings.docFolders || ["Uchwały", "Protokoły z zebrań", "Regulaminy", "Sprawozdania finansowe", "Wnioski", "Inne"]} defaultFolder={docFolder}/>;
    
    const c = ms[mType];
    if(!c) return null;
    return<FModal title={c.t} fields={c.f} onSubmit={c.fn} onClose={()=>setModal(null)}/>;
  }

  // ══════════════════════════════════════════════════════════════
  // NEW PAGES
  // ══════════════════════════════════════════════════════════════
  


  async function handleProfileSave(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const newName = form.get("name");
  const newPhone = form.get("phone");
  const newTheme = form.get("theme");
  await updateDoc(doc(db, "users", user.id), { name: newName, phone: newPhone, theme: newTheme });
  const updated = { ...user, name: newName, phone: newPhone, theme: newTheme };
  setUser(updated);
  setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
  flash("Profil zaktualizowany!");
}

async function handlePwSave(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const opw = form.get("oldPw");
  const npw = form.get("newPw");
  if (npw.length < 6) { flash("Nowe hasło: minimum 6 znaków!"); return; }
  try {
    const cred = EmailAuthProvider.credential(user.email, opw);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, npw);
    flash("Hasło zmienione!");
    e.target.reset();
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") { flash("Nieprawidłowe obecne hasło"); }
    else { flash("Błąd: " + err.message); }
  }
}

  const pages = {
    dashboard: () => <Dashboard 
      user={user} 
      users={users} 
      settings={settings} 
      dues={dues} 
      news={news} 
      events={events} 
      ideas={ideas} 
      recipes={recipes} 
      T={T} 
      setTab={setTab} 
      duesAlert={duesAlert} 
      setDuesAlert={setDuesAlert} 
      addBulkDues={addBulkDues} 
      canSeeDues={canSeeDues} 
    />,
    news: () => <News 
      user={user} users={users} news={news} settings={settings} 
      comments={comments} newsFilter={newsFilter} setNewsFilter={setNewsFilter}
      setModal={setModal} openEdit={openEdit} togPin={togPin} 
      delNews={delNews} addComment={addComment} delComment={delComment} 
    />,
    members: () => (
  <Members 
    user={user} 
    users={users} 
    exportMembersCSV={exportMembersCSV} 
    setChatWith={setChatWith} 
    setTab={setTab} 
    updatePlayerRating={updatePlayerRating} // <-- Przekazujemy funkcję
  />
),
    dues: () => <Dues 
      user={user} 
      users={users} 
      dues={dues} 
      settings={settings} 
      T={T} 
      duesAlert={duesAlert} 
      setDuesAlert={setDuesAlert}
      exportDuesCSV={exportDuesCSV} 
      setModal={setModal} 
      addBulkDues={addBulkDues} 
      togDue={togDue} 
      delDue={delDue} 
    />,
    ideas: () => <Ideas 
      user={user} 
      users={users} 
      ideas={ideas} 
      comments={comments} 
      settings={settings} 
      ideaFilter={ideaFilter} 
      setIdeaFilter={setIdeaFilter} 
      setModal={setModal} 
      openEdit={openEdit} 
      setIdeaStatus={setIdeaStatus} 
      voteIdea={voteIdea} 
      delIdea={delIdea} 
      addComment={addComment} 
      delComment={delComment} 
    />,
    polls: () => <Polls 
      user={user} 
      users={users} 
      polls={polls} 
      settings={settings} 
      T={T} 
      setModal={setModal} 
      closePoll={closePoll} 
      delPoll={delPoll} 
      votePoll={votePoll} 
    />,
    recipes: () => <Recipes 
      user={user} 
      users={users} 
      recipes={recipes} 
      comments={comments} 
      settings={settings} 
      recipeFilter={recipeFilter} 
      setRecipeFilter={setRecipeFilter} 
      setModal={setModal} 
      openEdit={openEdit} 
      delRecipe={delRecipe} 
      likeRecipe={likeRecipe} 
      addComment={addComment} 
      delComment={delComment} 
    />,
    events: () => <Events 
          user={user} 
          users={users} 
          events={events} 
          settings={settings} 
          calView={calView} 
          setCalView={setCalView} 
          calMonth={calMonth} 
          setCalMonth={setCalMonth} 
          setModal={setModal} 
          openEdit={openEdit} 
          delEvent={delEvent} 
          toggleRSVP={toggleRSVP} 
          saveMatchTeams={saveMatchTeams}
          updateEventTactics={updateEventTactics}
          setTacticsEvent={setTacticsEvent}
          resolveCancellation={resolveCancellation} 
          toggleEquipment={toggleEquipment}
          toggleEventPayment={toggleEventPayment}
        />,
    gallery: () => <Gallery 
      user={user} 
      users={users} 
      gallery={gallery} 
      albums={albums} 
      settings={settings} 
      galleryAlbum={galleryAlbum} 
      setGalleryAlbum={setGalleryAlbum} 
      setModal={setModal} 
      setLightbox={setLightbox} 
      delGallery={delGallery} 
      delAlbum={delAlbum} 
    />,
    finances: () => <Finances 
      finances={finances} 
      dues={dues} 
      settings={settings} 
      exportFinancesCSV={exportFinancesCSV} 
      setModal={setModal} 
      delFinance={delFinance} 
    />,
    documents: () => <Documents 
      user={user} 
      users={users} 
      documents={documents} 
      settings={settings} 
      docFolder={docFolder} 
      setDocFolder={setDocFolder} 
      setModal={setModal} 
      delDocument={delDocument} 
    />,
    messages: () => <Messages 
    user={user} 
    users={users} 
    messages={messages} 
    settings={settings} 
    chatWith={chatWith} 
    setChatWith={setChatWith} 
    msgText={msgText} 
    setMsgText={setMsgText} 
    msgBodyRef={msgBodyRef} 
    sendMessage={sendMessage} 
  />,
    profile: () => <Profile 
      user={user} 
      users={users} 
      recipes={recipes} 
      ideas={ideas} 
      gallery={gallery} 
      settings={settings}
      allThemes={ALL_THEMES}
      handleProfileSave={handleProfileSave}
      handlePwSave={handlePwSave}
    />,
    admin: () => <Admin 
    user={user} 
    users={users} 
    news={news} 
    ideas={ideas} 
    recipes={recipes} 
    events={events} 
    gallery={gallery} 
    comments={comments} 
    settings={settings}
    changeRole={changeRole}
    removeUser={removeUser}
  />,
    settings: () => <Settings 
  settings={settings} 
  setSettings={setSettings} 
  activeSetTab={activeSetTab} 
  setActiveSetTab={setActiveSetTab} 
  saveSettings={saveSettings} 
  uploadLogo={uploadLogo} 
  flash={flash} 
/>,
    guide: () => <Guide user={user} settings={settings} />,
    mailing: () => <Mailing 
  users={users} 
  settings={settings} 
  storage={storage} 
  mailSubject={mailSubject} 
  setMailSubject={setMailSubject} 
  mailAudience={mailAudience} 
  setMailAudience={setMailAudience}
  mailCustomUsers={mailCustomUsers} 
  setMailCustomUsers={setMailCustomUsers} 
  mailAttachments={mailAttachments} 
  setMailAttachments={setMailAttachments}
  mailEditorRef={mailEditorRef} 
  flash={flash} 
  askConfirm={askConfirm} 
  queueMassMail={queueMassMail} 
  fbRef={ref}
  uploadBytes={uploadBytes} 
  getDownloadURL={getDownloadURL} 
  delObject={deleteObject} // <--- Dodaj to dla kompletności
/>
  };
  const searchResults=getSearchResults(searchQ);

  return(
    <>
      <style>{getThemeCSS(T)}</style>
      <div className="app">
    {/* Mobile header */}
    <div className="mh">
      <button className="hb" onClick={()=>setSideOpen(true)}>{I.menu}</button>
      <span className="mt">{settings.orgName || ""}</span>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div className="notif-wrap">
          <button className="notif-btn" onClick={()=>{setNotifOpen(!notifOpen);if(!notifOpen)markNotifsRead();}}>{I.bell}{myUnreadNotifs>0&&<span className="notif-badge">{myUnreadNotifs}</span>}</button>
        </div>
        <span>{T.emoji}</span>
      </div>
    </div>
    <div className={`so${sideOpen?" open":""}`} onClick={()=>setSideOpen(false)}/>

    {/* Sidebar */}
    <aside className={`side${sideOpen?" open":""}`}>
      <div className="side-hd">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div className="side-logo"><img src={settings.orgLogoUrl||"/logo.png"} alt="Logo" onError={(e)=>{e.target.style.display='none';e.target.parentElement.textContent='KG';}}/></div>
            <div className="side-t">{settings.orgName}</div>
            <div className="side-st">{settings.orgLocation} · {settings.orgGmina}</div>
            <div className="side-season">{T.emoji} {T.name}</div>
          </div>
          {sideOpen&&<button className="hb" onClick={()=>setSideOpen(false)} style={{marginTop:-2}}>{I.close}</button>}
        </div>
      </div>

      {/* Search bar */}
      <div className="side-search" style={{position:"relative"}}>
        <div className="side-search-wrap">
          <span style={{opacity:.4,display:"flex"}}>{I.search}</span>
          <input ref={searchRef} value={searchQ} onChange={e=>{setSearchQ(e.target.value);setSearchOpen(true);}} onFocus={()=>setSearchOpen(true)} onBlur={()=>setTimeout(()=>setSearchOpen(false),200)} placeholder="Szukaj..."/>
        </div>
        {searchOpen&&searchResults.length>0&&<div className="search-results">
          {searchResults.map((r,i)=><div key={i} className="search-item" onMouseDown={()=>{setTab(r.tab);setSearchQ("");setSearchOpen(false);setSideOpen(false);}}>
            <span className="search-item-type">{r.type}</span>
            <span>{r.label}</span>
          </div>)}
        </div>}
      </div>

      {/* Notification bell (desktop) */}
      <div style={{padding:"6px 14px",display:"flex",justifyContent:"flex-end"}}>
        <div className="notif-wrap">
          <button className="notif-btn" style={{color:"rgba(255,255,255,.55)"}} onClick={()=>{setNotifOpen(!notifOpen);if(!notifOpen)markNotifsRead();}}>{I.bell}{myUnreadNotifs>0&&<span className="notif-badge">{myUnreadNotifs}</span>}</button>
          {notifOpen&&<div className="notif-dd">
            <div className="notif-hd"><span>Powiadomienia</span><span style={{fontSize:11,color:"var(--tm)",fontWeight:400}}>{myUnreadNotifs} nowych</span></div>
            {notifs.filter(n=>n.userId===user.id).slice(0,15).map(n=><div key={n.id} className={`notif-item${!n.read?" unread":""}`}>
              {!n.read&&<div className="notif-dot"/>}
              <div><div style={{fontSize:12.5}}>{n.msg}</div><div style={{fontSize:10.5,opacity:.6,marginTop:2}}>{timeAgo(n.date)}</div></div>
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
        <button className="side-lo" onClick={doLogout} title="Wyloguj">{I.logout}</button>
      </div>
      <div className="side-ft">© {new Date().getFullYear()} {settings.orgName || " "}</div>
    </aside>

    <main className="main">
  <div className="main-inner">
    {pages[tab]?.()}
  </div>
</main>
    {renderModal()}
    {/* TUTAJ WSTAW TEN KOD: */}
      {tacticsEvent && (
        <TacticsBoard 
          event={tacticsEvent} 
          users={users} 
          user={user} 
          onSave={updateEventTactics} 
          onClose={() => setTacticsEvent(null)} 
        />
      )}
    {lightbox&&<div className="lb" onClick={()=>setLightbox(null)}><img src={lightbox.imageData} alt={lightbox.title}/></div>}
    {toast&&<div className="toast">{toast}</div>}
    {confirm && <div className="confirm-overlay" onClick={() => setConfirm(null)}>
  <div className="confirm-box" onClick={e => e.stopPropagation()}>
    <div className="confirm-msg">{confirm.msg}</div>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn btn-s" onClick={() => setConfirm(null)}>Anuluj</button>

      {/* ZMIANA TUTAJ: Zamiast "Usuń", używamy etykiety z obiektu confirm */}
      <button className="btn btn-p" onClick={() => { confirm.onOk(); setConfirm(null); }}>
        {confirm.btnLabel || "Tak"}
      </button>

    </div>
  </div>
</div>}

    {/* ONBOARDING WIZARD */}
    {showOnboard&&<div className="onb-overlay">
      <div className="onb-box">
        {onbStep===0&&<><div className="onb-emoji">👋</div><div className="onb-title">Witaj w aplikacji Koła!</div><div className="onb-desc">To Twoje centrum zarządzania — aktualności, pomysły, przepisy, składki i wiele więcej. Pokażemy Ci najważniejsze funkcje.</div></>}
        {onbStep===1&&<><div className="onb-emoji">📰</div><div className="onb-title">Aktualności i Komentarze</div><div className="onb-desc">Przeglądaj wiadomości, komentuj wpisy i bądź na bieżąco z życiem Koła. Używaj filtrów, żeby szybko znaleźć to, czego szukasz.</div></>}
        {onbStep===2&&<><div className="onb-emoji">💡</div><div className="onb-title">Pomysły i Głosowanie</div><div className="onb-desc">Każdy członek może zaproponować pomysł. Głosuj na najlepsze — Zarząd zmieni ich status na &bdquo;zaakceptowany&rdquo;.</div></>}
        {onbStep===3&&<><div className="onb-emoji">🔔</div><div className="onb-title">Powiadomienia i Wyszukiwanie</div><div className="onb-desc">Dzwonek w menu pokaże Ci nowe komentarze i głosy. Pole wyszukiwania pomoże znaleźć dowolną treść w sekundę.</div></>}
        {onbStep===4&&<><div className="onb-emoji">🎉</div><div className="onb-title">Gotowe!</div><div className="onb-desc">Teraz możesz korzystać z pełni możliwości aplikacji. Dodaj swój pierwszy przepis, zagłosuj na pomysł lub sprawdź kalendarz wydarzeń!</div></>}
        <div className="onb-steps">{[0,1,2,3,4].map(s=><div key={s} className={`onb-step${s===onbStep?" active":""}`}/>)}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          {onbStep>0&&<button className="btn btn-s" onClick={()=>setOnbStep(onbStep-1)}>Wstecz</button>}
          {onbStep<4?<button className="btn btn-p" onClick={()=>setOnbStep(onbStep+1)}>Dalej</button>
          :<button className="btn btn-g" onClick={finishOnboard}>Zaczynajmy!</button>}
        </div>
        {onbStep<4&&<button style={{background:"none",border:"none",color:"var(--tm)",cursor:"pointer",fontSize:12,marginTop:12,fontFamily:"inherit"}} onClick={finishOnboard}>Pomiń</button>}
      </div>
    </div>}
  </div></>);
}
