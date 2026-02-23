import React from 'react';
import { canManage } from '../utils/helpers';
import I from '../utils/icons';

export default function Guide({ user, settings }) {
  const cm = canManage(user.role);

  const sections = [
    {
      id: "start",
      title: "🚀 Pierwsze kroki",
      content: `Witaj w oficjalnej aplikacji ${settings.orgName}! Znajdziesz tutaj wszystkie niezbędne narzędzia do komunikacji i zarządzania naszą grupą. Aplikacja dostosowuje się do pory roku, zmieniając kolory i nastrój.`
    },
    {
      id: "dashboard",
      title: `🏠 ${settings.labelDashboard || "Pulpit"}`,
      content: "Twoje centrum dowodzenia. Tutaj widzisz najnowsze ogłoszenia, nadchodzące wydarzenia z kalendarza oraz szybkie statystyki naszej organizacji."
    },
    {
      id: "news",
      title: `📰 ${settings.labelNews || "Aktualności"}`,
      content: `W tej sekcji znajdziesz najważniejsze informacje. Ważne wpisy są "przypięte" na górze listy. Możesz komentować każdy wpis, aby dopytać o szczegóły.`
    },
    {
      id: "dues",
      title: `💰 ${settings.labelDues || "Skarbnik"}`,
      content: "Monitoruj swoje składki członkowskie. Status 'Opłacone' oznacza, że Skarbnik zaksięgował Twoją wpłatę. O nowych składkach zostaniesz powiadomiony mailowo."
    },
    {
      id: "events",
      title: `📅 ${settings.labelEvents || "Kalendarz"}`,
      content: "Lista i siatka nadchodzących spotkań, meczów lub imprez. Kliknij 'Wezmę udział', aby organizatorzy wiedzieli, na kogo mogą liczyć."
    },
    {
      id: "gallery",
      title: `📸 ${settings.labelGallery || "Galeria"}`,
      content: "Miejsce na relacje foto i wideo. Zdjęcia są pogrupowane w albumy. Możesz przeglądać je w wygodnym trybie pełnoekranowym (Lightbox)."
    },
    {
      id: "messages",
      title: `💬 ${settings.labelMessages || "Wiadomości"}`,
      content: `Bezpośredni kontakt z innymi członkami. Mamy też 'Czat Ogólny' ${settings.orgName}, gdzie rozmawiamy o sprawach dotyczących wszystkich.`
    },
    {
      id: "ideas",
      title: `💡 ${settings.labelIdeas || "Pomysły"}`,
      content: "Masz propozycję zmiany? Dodaj ją tutaj! Inni mogą głosować na Twój pomysł. Najlepsze inicjatywy są zatwierdzane przez Zarząd."
    },
    {
      id: "docs",
      title: `📄 ${settings.labelDocs || "Dokumenty"}`,
      content: "Baza wiedzy i plików. Pobieraj regulaminy, wnioski i protokoły bezpośrednio na swój telefon lub komputer."
    },
    {
      id: "recipes",
      title: `📚 ${settings.labelRecipes || "Zasoby"}`,
      content: `Specjalistyczna baza wiedzy ${settings.orgName}. Przechowujemy tu instrukcje, przepisy lub poradniki ważne dla naszej społeczności.`
    }
  ];

  return (
    <div className="guide-page">
      <div className="ph">
        <div>
          <div className="pt">{settings.labelGuide || "Centrum Pomocy"}</div>
          <div className="ps">Jak korzystać z aplikacji {settings.orgName}</div>
        </div>
      </div>

      <div className="guide-grid" style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
        {sections.map(s => (
          <div key={s.id} className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px', fontSize: '18px', color: 'var(--p)' }}>
              {s.title}
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '14.5px', color: 'var(--tx)' }}>
              {s.content}
            </p>
          </div>
        ))}

        {cm && (
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--p)', background: 'var(--cr)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px', fontSize: '18px' }}>
              🛠️ Panel Administracyjny
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '14.5px' }}>
              Jako członek Zarządu masz dostęp do <strong>Zarządzania</strong> (role użytkowników), 
              <strong>Ustawień</strong> (pełny White-Labeling aplikacji) oraz <strong>Mailingu</strong> (masowa wysyłka powiadomień).
            </p>
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--tm)' }}>
              Pamiętaj, aby każdą zmianę w Ustawieniach potwierdzić przyciskiem "Zapisz".
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', opacity: 0.7 }}>
        <div style={{ fontSize: '13px' }}>Aplikacja {settings.orgName} &copy; 2026</div>
        <div style={{ fontSize: '11px', marginTop: '5px' }}>Wersja systemu: 2.5.0 White-label Edition</div>
      </div>
    </div>
  );
}