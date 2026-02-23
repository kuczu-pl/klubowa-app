import React from 'react';
import { fDate } from '../utils/helpers';
import I from '../utils/icons';
import Empty from '../components/Empty';

export default function Finances({
  finances, dues, settings,
  exportFinancesCSV, setModal, delFinance
}) {
  // Przychody zewnętrzne (darowizny, dotacje itp.)
  const inc = finances.filter(f => f.type === "income").reduce((s, f) => s + f.amount, 0);
  
  // Wydatki
  const exp = finances.filter(f => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  
  // Składki (tylko opłacone)
  const paidDues = dues.filter(d => d.paid);
  
  // Podział składek na stałe i wydarzeniowe
  const regularDues = paidDues.filter(d => !d.eventId).reduce((s, d) => s + d.amount, 0);
  const eventDues = paidDues.filter(d => d.eventId).reduce((s, d) => s + d.amount, 0);
  
  const duesTotal = regularDues + eventDues;
  const balance = inc + duesTotal - exp;
  
  const sorted = [...finances].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="ph">
        <div>
          <div className="pt">{settings.labelFinances || "Finanse"}</div>
          <div className="ps">Podsumowanie budżetu {settings.orgName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-s" onClick={exportFinancesCSV} title="Eksportuj raport do CSV">{I.download} Eksport CSV</button>
          <button className="btn btn-g" onClick={() => setModal("addIncome")}>{I.plus} Przychód</button>
          <button className="btn btn-d" onClick={() => setModal("addExpense")}>{I.minus} Wydatek</button>
        </div>
      </div>
      
      {/* GŁÓWNE STATYSTYKI */}
      <div className="sg">
        <div className="sc">
          <div className="sl">Suma wpłat</div>
          <div className="sv sv-g">{(inc + duesTotal).toFixed(2)} {settings.dueCurrency}</div>
        </div>
        <div className="sc">
          <div className="sl">Wydatki</div>
          <div className="sv sv-r">{exp.toFixed(2)} {settings.dueCurrency}</div>
        </div>
        <div className="sc">
          <div className="sl">Stan kasy</div>
          <div className={`sv ${balance >= 0 ? "sv-p" : "sv-r"}`}>{balance.toFixed(2)} {settings.dueCurrency}</div>
        </div>
      </div>

      {/* SZCZEGÓŁOWY PODZIAŁ WPŁYWÓW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.7 }}>💰 Struktura składek (opłacone)</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{fontSize: '13px'}}>Składki stałe:</span>
            <span style={{fontWeight: 600}}>{regularDues.toFixed(2)} {settings.dueCurrency}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{fontSize: '13px'}}>Opłaty wydarzeniowe:</span>
            <span style={{fontWeight: 600}}>{eventDues.toFixed(2)} {settings.dueCurrency}</span>
          </div>
          <div style={{ borderTop: '1px dashed var(--bo)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Razem ze składek:</strong>
            <strong style={{ color: 'var(--p)' }}>{duesTotal.toFixed(2)} {settings.dueCurrency}</strong>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.7 }}>📈 Pozostałe przychody</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{fontSize: '13px'}}>Darowizny i dotacje:</span>
            <span style={{fontWeight: 600}}>{inc.toFixed(2)} {settings.dueCurrency}</span>
          </div>
          <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--tm)' }}>
            * Statystyki uwzględniają wyłącznie faktycznie zaksięgowane wpłaty.
          </div>
        </div>
      </div>
      
      {/* HISTORIA OPERACJI */}
      <h3 style={{ margin: '24px 0 12px 4px', fontSize: '16px' }}>📃 Historia transakcji</h3>
      {sorted.length > 0 ? (
        <div className="card" style={{ padding: "0" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tytuł i kategoria</th>
                <th style={{ textAlign: "right" }}>Kwota</th>
                <th style={{ textAlign: "right" }}>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(f => (
                <tr key={f.id}>
                  <td style={{ fontSize: '12.5px', color: 'var(--tm)' }}>{fDate(f.date)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`fin-type ${f.type}`} style={{ width: 8, height: 8, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13.5px' }}>{f.title}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--tm)' }}>{f.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: f.type === "income" ? "#4A7C59" : "#C44" }}>
                    {f.type === "income" ? "+" : "-"}{f.amount.toFixed(2)} {settings.dueCurrency}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-gh" onClick={() => delFinance(f.id)} style={{ padding: 6, color: "#C44" }}>
                      {I.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty 
          emoji="💵" 
          title="Brak zapisów w historii" 
          desc="Użyj przycisków Przychód/Wydatek, aby dodać pierwsze wpisy poza składkami." 
        />
      )}
    </div>
  );
}