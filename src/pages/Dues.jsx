import React from 'react';
import { canSeeDues, mName, fDate } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';

export default function Dues({
  user, users, dues, settings, T, duesAlert, setDuesAlert,
  exportDuesCSV, setModal, addBulkDues, togDue, delDue
}) {
  const priv = canSeeDues(user.role);
  
  // Filtrowanie danych: admin widzi wszystko, użytkownik tylko swoje
  const vd = [...(priv ? dues : dues.filter(d => d.userId === user.id))]
    .sort((a, b) => b.month.localeCompare(a.month) || (b.createdAt || "").localeCompare(a.createdAt || ""));

  const tp = vd.filter(d => d.paid).reduce((s, d) => s + d.amount, 0);
  const tu = vd.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelDues || "Skarbnik"}</div>
          <div className="ps">{priv ? `Zarządzanie finansami ${settings.orgName}` : "Twoje rozliczenia i składki"}</div>
        </div>
        {priv && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-s" onClick={exportDuesCSV}>{I.download} Eksport CSV</button>
            <button className="btn btn-p" onClick={() => setModal("addDue")}>{I.plus} Dodaj opłatę</button>
            <button className="btn btn-s" onClick={() => setModal("bulkDue")}>Nalicz miesięczną</button>
          </div>
        )}
      </div>

      {/* Alert o braku składek miesięcznych */}
      {priv && duesAlert && (
        <div className="dues-banner">
          <span className="dues-banner-icon">📅</span>
          <div className="dues-banner-txt">
            <div className="dues-banner-title">Brak składek za {mName(duesAlert.month)}</div>
            <div className="dues-banner-sub">Nalicz automatycznie składkę miesięczną ({settings.dueAmount} {settings.dueCurrency}) dla wszystkich członków.</div>
          </div>
          <div className="dues-banner-actions">
            <button className="btn btn-p" onClick={async () => {
              await addBulkDues({ month: duesAlert.month, amount: settings.dueAmount });
              setDuesAlert(null);
            }}>Nalicz teraz</button>
            <button className="btn btn-s" onClick={() => setDuesAlert(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="sg">
        <div className="sc"><div className="sl">Opłacone</div><div className="sv sv-g">{tp.toFixed(2)} {settings.dueCurrency}</div></div>
        <div className="sc"><div className="sl">Do zapłaty</div><div className="sv sv-r">{tu.toFixed(2)} {settings.dueCurrency}</div></div>
        <div className="sc">
          <div className="sl">Składka stała</div>
          <div className="sv sv-p">{settings.dueAmount} {settings.dueCurrency}<small style={{fontSize:10, marginLeft:4}}>/ msc</small></div>
        </div>
      </div>

      {vd.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr>
                {priv && <th>Członek</th>}
                <th>Tytuł opłaty / Okres</th>
                <th style={{ textAlign: "right" }}>Kwota</th>
                <th style={{ textAlign: "center" }}>Status</th>
                {priv && <th style={{ textAlign: "right" }}>Akcje</th>}
              </tr>
            </thead>
            <tbody>
              {vd.map(d => {
                const member = users.find(u => u.id === d.userId);
                return (
                  <tr key={d.id}>
                    {priv && (
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--p)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                            {member?.name?.substring(0, 1)}
                          </div>
                          {member?.name || "Nieznany"}
                        </div>
                      </td>
                    )}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {d.title ? d.title : `Składka członkowska`}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--tm)" }}>
  {d.eventId || d.date ? "⚽ Wydarzenie/Celowa" : "📅 Miesięczna"} • {d.date ? fDate(d.date) : mName(d.month)}
</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {d.amount.toFixed(2)} {settings.dueCurrency}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {priv ? (
                        <button 
                          onClick={() => togDue(d.id)} 
                          className={`st-pill ${d.paid ? "paid" : "unpaid"}`}
                          title={d.paid ? `Zapłacono: ${fDate(d.paidDate)}` : "Kliknij, aby rozliczyć"}
                        >
                          {d.paid ? <>{I.check} Opłacone</> : <>{I.x} Do zapłaty</>}
                        </button>
                      ) : (
                        <span className={`st-pill ${d.paid ? "paid" : "unpaid"}`}>
                          {d.paid ? <>{I.check} Opłacone</> : "Oczekuje"}
                        </span>
                      )}
                    </td>
                    {priv && (
                      <td style={{ textAlign: "right" }}>
                        <button className="btn-gh" onClick={() => delDue(d.id)} style={{ color: "#C44" }}>{I.trash}</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty 
          emoji="💰" 
          title="Brak zapisanych składek" 
          desc={priv ? "Nalicz pierwsze składki miesięczne lub opłaty za wydarzenia." : "Nie masz jeszcze przypisanych żadnych opłat."} 
          action={priv ? "Dodaj opłatę" : null} 
          onAction={() => setModal("addDue")} 
        />
      )}
    </div>
  );
}