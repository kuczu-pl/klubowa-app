import React from 'react';
import { canManage, fDate, uName } from '../utils/helpers';
import I from '../utils/icons';
import CommentSection from '../components/CommentSection';
import Empty from '../components/Empty';

export default function Recipes({
  user, users, recipes, comments, settings, recipeFilter, setRecipeFilter,
  setModal, openEdit, delRecipe, likeRecipe, addComment, delComment
}) {
  const cm = canManage(user.role);
  let list = [...recipes];
  
  if (recipeFilter !== "all") {
    list = list.filter(r => r.category === recipeFilter);
  }
  
  // DYNAMICZNE KATEGORIE
  const defaultCats = ["Taktyka", "Trening", "Analiza", "Materiały", "Inne"];
  const dynamicCats = settings.recipeFields?.cats || defaultCats;
  const cats = ["all", ...dynamicCats.map(c => c.toLowerCase())];

  // DYNAMICZNE ETYKIETY
  const lblIngr = settings.recipeFields?.ingrLabel || "Sprzęt / Elementy";
  const lblInstr = settings.recipeFields?.instrLabel || "Przebieg / Opis";
  
  // how many ghost placeholder cards to show so the grid looks intentional
  const GHOST_MIN = 3;
  const ghosts = Math.max(0, GHOST_MIN - list.length);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelRecipes || "Zasoby / Przepisy"}</div>
          <div className="ps">
            Baza wiedzy i przydatnych informacji
            {recipes.length > 0 && (
              <span style={{ marginLeft: 8, background: "var(--cr)", border: "1px solid var(--bo)", borderRadius: 20, padding: "1px 10px", fontSize: 12, color: "var(--tm)", fontWeight: 500 }}>
                {recipes.length} {recipes.length === 1 ? "wpis" : recipes.length < 5 ? "wpisy" : "wpisów"}
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-p" onClick={() => setModal("addRecipe")}>
          {I.plus} Dodaj
        </button>
      </div>

      <div className="filter-bar">
        {cats.map(f => (
          <button 
            key={f} 
            className={`filter-btn${recipeFilter === f ? " on" : ""}`} 
            onClick={() => setRecipeFilter(f)}
          >
            {f === "all" ? "Wszystkie" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {list.length === 0 && recipeFilter === "all" ? (
        <Empty 
          emoji="📚" 
          title="Brak wpisów" 
          desc="Podziel się cenną wiedzą lub materiałami z innymi członkami!" 
          action="Dodaj pierwszy wpis" 
          onAction={() => setModal("addRecipe")} 
        />
      ) : list.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 20px", color: "var(--tm)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Brak wyników</div>
          <div style={{ fontSize: 13 }}>
            Nie ma wpisów w kategorii &bdquo;{recipeFilter}&rdquo;. 
            <button className="btn-gh" style={{ fontSize: 13, padding: "2px 4px" }} onClick={() => setRecipeFilter("all")}>
              Pokaż wszystkie
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {list.map((r, i) => (
            <div key={r.id} className="card" style={{ animationDelay: `${i * .04}s`, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--w)", fontWeight: 600, marginBottom: 3 }}>
                    {r.category}
                  </div>
                  <div className="ct" style={{ fontSize: 15 }}>{r.title}</div>
                  <div className="cm">{uName(users, r.authorId, settings.orgName)} · {fDate(r.date)}</div>
                </div>
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  {(cm || r.authorId === user.id) && (
                    <button className="btn-gh" onClick={() => openEdit("recipe", r)} style={{ padding: 3 }} title="Edytuj">{I.edit}</button>
                  )}
                  {(cm || r.authorId === user.id) && (
                    <button className="btn-gh" onClick={() => delRecipe(r.id)} style={{ padding: 3, color: "#C44" }} title="Usuń">{I.trash}</button>
                  )}
                </div>
              </div>
              
              <div style={{ marginTop: 10, flex: 1 }}>
                {/* TUTAJ WIDOCZNE SĄ DYNAMICZNE ZMIENNE */}
                <div style={{ fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".3px", marginBottom: 4, color: "var(--tm)" }}>{lblIngr}</div>
                <div style={{ fontSize: 13, color: "var(--tm)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.ingredients}</div>
                
                <div style={{ fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".3px", marginTop: 12, marginBottom: 4, color: "var(--tm)" }}>{lblInstr}</div>
                <div style={{ fontSize: 13, color: "var(--tm)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.instructions}</div>
              </div>

              <div className="cf" style={{ marginTop: "auto" }}>
                <button className={`btn-l${(r.likers || []).includes(user.id) ? " on" : ""}`} onClick={() => likeRecipe(r.id)}>
                  {(r.likers || []).includes(user.id) ? I.heartF : I.heart} {r.likes}
                </button>
              </div>
              <CommentSection 
                type="recipe" 
                contentId={r.id} 
                comments={comments} 
                onAdd={addComment} 
                onDel={delComment} 
                users={users} 
                userId={user.id} 
                canMng={cm} 
              />
            </div>
          ))}
          
          {/* Ghost placeholder cards — uniwersalne emoji */}
          {Array.from({ length: ghosts }).map((_, i) => (
            <button key={`ghost-${i}`} className="ghost-card" onClick={() => setModal("addRecipe")}>
              <span className="ghost-card-emoji">{settings.recipeFields ? "📝" : (["🥘", "🥗", "🎂"][i] || "🍴")}</span>
              <span className="ghost-card-label">Dodaj wpis<br /><span style={{ fontSize: 11, opacity: .7 }}>Podziel się wiedzą</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}