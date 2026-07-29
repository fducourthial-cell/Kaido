async function fetchAndRenderWeather(lat, lng, destinationName, startDate, endDate) {
    const container = document.getElementById('weather-container');
    const subtitle = document.getElementById('weather-subtitle');
    if (!container) return;

    if ((!lat || !lng) && typeof google !== 'undefined' && google.maps) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const autoLat = results[0].geometry.location.lat();
                const autoLng = results[0].geometry.location.lng();
                fetchAndRenderWeather(autoLat, autoLng, destinationName, startDate, endDate);
            } else {
                container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Météo indisponible pour cette destination.</span>`;
            }
        });
        return;
    }

    const weatherCodes = {
        0: '☀️ Ensoleillé', 1: '🌤️ Peu nuageux', 2: '⛅ Partiellement nuageux', 3: '☁️ Couvert',
        45: '🌫️ Brouillard', 51: '🌧️ Bruine légère', 61: '🌧️ Pluie', 71: '❄️ Neige', 80: '🌦️ Averses', 95: '🌩️ Orage'
    };

    try {
        let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const today = new Date();
            const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 14) url += `&start_date=${startDate}&end_date=${endDate}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.daily) {
            container.innerHTML = '';
            const daysLimit = Math.min(data.daily.time.length, 5);
            for (let i = 0; i < daysLimit; i++) {
                const dateRaw = data.daily.time[i];
                const dateFormatted = new Date(dateRaw).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                const code = data.daily.weathercode[i];
                const weatherText = weatherCodes[code] || '⛅ Variable';
                const tempMax = Math.round(data.daily.temperature_2m_max[i]);
                const tempMin = Math.round(data.daily.temperature_2m_min[i]);

                const item = document.createElement('div');
                item.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid rgba(212, 175, 55, 0.1); font-size: 0.85rem;`;
                item.innerHTML = `
                    <span style="color: var(--text-main); font-weight: 500; text-transform: capitalize;">${dateFormatted}</span>
                    <span>${weatherText}</span>
                    <span style="color: var(--color-gold); font-weight: 600;">${tempMin}° / ${tempMax}°C</span>
                `;
                container.appendChild(item);
            }
            if (subtitle) subtitle.textContent = "Prévisions en direct (Open-Meteo)";
        }
    } catch (err) {
        console.warn("Impossible de charger la météo :", err);
        container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Météo indisponible.</span>`;
    }
}
