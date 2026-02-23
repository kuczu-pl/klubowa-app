import React, { useState, useEffect } from 'react';

const WEATHER_ICONS = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 
  45: "🌫️", 48: "🌫️",
  51: "🌧️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌦️", 82: "🌦️",
  95: "⛈️"
};

export default function WeatherBadge({ place, date, time }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sprawdzamy czy mecz jest w zasięgu prognozy (do 7 dni w przód)
    const matchDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((matchDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 7) return;

    async function fetchWeather() {
      setLoading(true);
      try {
        // 1. Geokodowanie (Nazwa -> Lat/Lon)
        const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(place)}&limit=1`);
        const geoData = await geoRes.json();
        if (!geoData.features.length) return;
        const [lon, lat] = geoData.features[0].geometry.coordinates;

        // 2. Pobieranie pogody godzinowej
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weather_code&start_date=${date}&end_date=${date}`);
        const wData = await wRes.json();

        // 3. Dopasowanie godziny
        const hour = parseInt(time.split(':')[0]);
        setWeather({
          temp: Math.round(wData.hourly.temperature_2m[hour]),
          prob: wData.hourly.precipitation_probability[hour],
          code: wData.hourly.weather_code[hour]
        });
      } catch (e) {
        console.error("Weather error", e);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [place, date, time]);

  if (!weather || loading) return null;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: 8, 
      background: 'rgba(255,255,255,0.8)', padding: '4px 10px', 
      borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      border: '1px solid var(--bo)', marginLeft: 'auto'
    }}>
      <span style={{ fontSize: '16px' }}>{WEATHER_ICONS[weather.code] || "🌡️"}</span>
      <span>{weather.temp}°C</span>
      {weather.prob > 10 && <span style={{ color: '#3498db' }}>💧{weather.prob}%</span>}
    </div>
  );
}