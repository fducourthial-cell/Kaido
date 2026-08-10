// --- INJECTION DU CSS HYBRIDE (RESPONSIVE) ---
const hybridStyles = document.createElement('style');
hybridStyles.innerHTML = `
    /* 📱 MOBILE (Écrans < 768px) */
    @media (max-width: 768px) {
        .itinerary-split-layout { display: block; height: calc(100vh - 160px); }
        .itinerary-list-col { display: none !important; } /* On cache la liste texte */
        .itinerary-map-col { height: 100%; width: 100%; padding: 0 !important; }
        
        .sticky-map-box { height: 100%; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
        .sticky-map-box h3 { padding: 10px 15px 5px; margin: 0; background: var(--bg-card); font-size: 1.05rem; z-index: 5;}
        .sticky-map-box p { display: none; } /* Cache le sous-titre inutile sur mobile */
        
        /* Sélecteur de Jours Mobile */
        #mobile-day-switcher {
            background: var(--bg-card); padding: 10px 15px;
            display: flex; gap: 10px; overflow-x: auto;
            -ms-overflow-style: none; scrollbar-width: none;
            border-bottom: 1px solid var(--border-color);
            z-index: 5;
        }
        #mobile-day-switcher::-webkit-scrollbar { display: none; }
        
        .mobile-day-btn {
            flex: 0 0 auto; background: rgba(255,255,255,0.05); color: var(--text-main); 
            border: 1px solid var(--border-color); padding: 6px 14px; 
            border-radius: 20px; font-size: 0.85rem; font-weight: bold; 
            cursor: pointer; transition: all 0.2s;
        }
        .mobile-day-btn.active {
            background: var(--color-gold); color: var(--bg-dark); border-color: var(--color-gold);
        }

        #map { flex: 1; width: 100%; position: relative; }
        #activity-preview { display: none !important; } /* Cache l'aperçu PC */
        
        /* Le Carrousel Mobile */
        .kaido-carousel {
            position: absolute; bottom: 15px; left: 0; width: 100%;
            display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
            gap: 15px; padding: 0 15px; box-sizing: border-box;
            -ms-overflow-style: none; scrollbar-width: none; z-index: 10;
        }
        .kaido-carousel::-webkit-scrollbar { display: none; }
        
        .kaido-swipe-card {
            scroll-snap-align: center; flex: 0 0 85%;
            background: var(--bg-card, #0D0B09); border: 1px solid var(--color-gold);
            border-radius: 12px; padding: 10px;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.8); cursor: pointer;
        }
        .kaido-swipe-card-info { flex: 1; overflow: hidden; padding-right: 12px; }
        .kaido-swipe-card-img {
            width: 65px; height: 65px; border-radius: 8px; object-fit: cover;
            border: 1px solid rgba(212, 175, 55, 0.3); background: rgba(255,255,255,0.05);
        }
    }

    /* 💻 DESKTOP (Écrans >= 768px) */
    @media (min-width: 768px) {
        .kaido-carousel, #mobile-day-switcher { display: none !important; }
    }
`;
document.head.appendChild(hybridStyles);

let map;
let activeMarkers = []; 
let routePolyline = null; 
let placesService = null;

// --- ICÔNES ET STYLES ---
function getNumberedGoldPin(numberText) {
    const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256">
            <g transform="translate(1.40659 1.40659) scale(2.81)">
                <linearGradient id="SVGID_4" x1="45" y1="80.71" x2="45" y2="2.88" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#b07908"/><stop offset="22%" stop-color="#ddbd53"/>
                    <stop offset="40%" stop-color="#f4e07a"/><stop offset="68%" stop-color="#d5b354"/>
                    <stop offset="100%" stop-color="#c0943a"/>
                </linearGradient>
                <path d="M 45 1.5 c -15.92 0 -28.83 12.9 -28.83 28.83 C 16.16 46.25 30.58 70.86 45 88.5 c 14.41 -17.63 28.83 -42.24 28.83 -58.16 C 73.83 14.4 60.92 1.5 45 1.5 z" fill="url(#SVGID_4)"/>
                <circle cx="45" cy="30.33" r="18" fill="#FFFFFF" stroke="#c0943a" stroke-width="2"/>
                <text x="45" y="35.5" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#0D0B09" text-anchor="middle">${numberText}</text>
            </g>
        </svg>
    `;
    return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString), scaledSize: new google.maps.Size(40, 40), anchor: new google.maps.Point(20, 40) };
}

const goldPinIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256">
            <g transform="translate(1.40659 1.40659) scale(2.81)">
                <linearGradient id="SVGID_4" x1="45" y1="80.71" x2="45" y2="2.88" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#b07908"/><stop offset="100%" stop-color="#c0943a"/></linearGradient>
                <path d="M 45 1.5 c -15.92 0 -28.83 12.9 -28.83 28.83 C 16.16 46.25 30.58 70.86 45 88.5 c 14.41 -17.63 28.83 -42.24 28.83 -58.16 C 73.83 14.4 60.92 1.5 45 1.5 z M 45 47.6 c -9.78 0 -17.71 -7.93 -17.71 -17.71 S 35.21 12.18 45 12.18 s 17.71 7.93 17.71 17.71 S 54.78 47.6 45 47.6 z" fill="url(#SVGID_4)"/>
            </g>
        </svg>
    `), scaledSize: new google.maps.Size(36, 36), anchor: new google.maps.Point(18, 36)
};

const mapStyles = {
    dark: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }],
    papyrus: [{ elementType: "geometry", stylers: [{ color: "#F2EBD9" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#FCF8F2" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#6B5E52" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#8C6D23" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#E4D8C3" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1C2A5" }] }]
};

// --- GÉNÉRATION DU SÉLECTEUR DE JOURS (UNIQUEMENT MOBILE) ---
function buildMobileDaySwitcher() {
    if (window.innerWidth > 768 || !window.activeTrip || !window.activeTrip.itinerary) return;
    
    let switcher = document.getElementById('mobile-day-switcher');
    if (!switcher) {
        switcher = document.createElement('div');
        switcher.id = 'mobile-day-switcher';
        // On l'insère juste avant la carte
        const mapNode = document.getElementById('map');
        mapNode.parentNode.insertBefore(switcher, mapNode);
    }
    switcher.innerHTML = '';
    
    window.activeTrip.itinerary.forEach((day, index) => {
        const btn = document.createElement('button');
        btn.className = 'mobile-day-btn';
        btn.textContent = day.day; 
        
        btn.addEventListener('click', () => {
            Array.from(switcher.children).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Trace la route du jour cliqué !
            displayDayOnMap(day.steps, window.activeTrip.destination);
        });
        switcher.appendChild(btn);
    });
    
    // Auto-clic sur le premier jour au chargement de l'appli mobile !
    if (switcher.firstChild) {
        switcher.firstChild.click();
    }
}

// --- INITIALISATION DE LA CARTE ---
function initGoogleMap(destinationName, lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof google === 'undefined' || !google.maps) return;

    let initialPos = { lat: 48.8566, lng: 2.3522 };
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) initialPos = { lat: parseFloat(lat), lng: parseFloat(lng) };

    const currentTheme = document.body.getAttribute('data-theme') || localStorage.getItem('kaido_theme') || 'dark';
    
    map = new google.maps.Map(mapContainer, {
        zoom: 12, center: initialPos, disableDefaultUI: true, zoomControl: false, styles: mapStyles[currentTheme] || mapStyles.dark
    });

    placesService = new google.maps.places.PlacesService(map);

    if (!lat || !lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) map.setCenter(results[0].geometry.location);
        });
    }

    // Déclenche le sélecteur de jour sur Mobile
    setTimeout(() => { if (window.innerWidth <= 768) buildMobileDaySwitcher(); }, 100);

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && !document.getElementById('mobile-day-switcher')) buildMobileDaySwitcher();
    });

    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(() => {
                const newTheme = document.body.getAttribute('data-theme') || localStorage.getItem('kaido_theme') || 'dark';
                if (map && mapStyles[newTheme]) map.setOptions({ styles: mapStyles[newTheme] });
            }, 50);
        });
    }
}

function clearMapOverlays() {
    activeMarkers.forEach(m => { m.setAnimation(null); m.setMap(null); });
    activeMarkers = [];
    if (routePolyline) {
        if (typeof routePolyline.setMap === 'function') routePolyline.setMap(null);
        else if (typeof routePolyline.setDirections === 'function') routePolyline.setMap(null);
        routePolyline = null;
    }
    const distanceSpan = document.getElementById('map-daily-distance');
    if (distanceSpan) distanceSpan.textContent = '';
    const carousel = document.getElementById('kaido-map-carousel');
    if (carousel) carousel.style.display = 'none';
}

// --- GÉNÉRATION DU CARROUSEL MOBILE ---
function buildSwipeCarousel(waypoints, mainDestination) {
    let container = document.getElementById('kaido-map-carousel');
    if (!container) {
        container = document.createElement('div');
        container.id = 'kaido-map-carousel';
        container.className = 'kaido-carousel';
        document.getElementById('map').parentElement.appendChild(container);
    }
    
    container.innerHTML = '';
    container.style.display = ''; // Rétablit l'affichage par défaut de la classe CSS
    
    const observer = new IntersectionObserver((entries) => {
        if (window.innerWidth > 768) return; 

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-index'));
                const wp = waypoints[index];
                if (wp && map) {
                    map.panTo(wp.location);
                    map.setZoom(14);
                    activeMarkers.forEach((m, i) => {
                        if (i === index) m.setAnimation(google.maps.Animation.BOUNCE);
                        else m.setAnimation(null);
                    });
                }
            }
        });
    }, { root: container, threshold: 0.6 });

    waypoints.forEach((wp, index) => {
        const card = document.createElement('div');
        card.className = 'kaido-swipe-card';
        card.setAttribute('data-index', index);
        
        const actName = wp.stepInfo.activity || wp.stepInfo.title || 'Étape';
        const locationName = wp.stepInfo.location || mainDestination;
        const time = wp.stepInfo.time || `Étape ${index + 1}`;

        const fallbackImg = `https://ui-avatars.com/api/?name=${index+1}&background=D4AF37&color=0D0B09&font-size=0.6`;

        card.innerHTML = `
            <div class="kaido-swipe-card-info">
                <div style="color: var(--color-gold); font-size: 0.75rem; font-weight: bold; margin-bottom: 3px;">🕒 ${time}</div>
                <div style="color: var(--text-main); font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${actName}</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px;">📍 ${locationName}</div>
            </div>
            <img src="${fallbackImg}" class="kaido-swipe-card-img" id="carousel-img-${index}" alt="Photo">
        `;

        card.addEventListener('click', () => { card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); });
        container.appendChild(card);
        observer.observe(card);

        if (placesService) {
            placesService.findPlaceFromQuery({ query: `${actName}, ${locationName}`, fields: ['photos'] }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    if (place.photos && place.photos.length > 0) {
                        const imgEl = document.getElementById(`carousel-img-${index}`);
                        if (imgEl) imgEl.src = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
                    }
                }
            });
        }
    });
}

// --- AFFICHAGE DE LA JOURNÉE (ITINÉRAIRE) ---
async function displayDayOnMap(steps, mainDestination) {
    clearMapOverlays();
    if (!steps || steps.length === 0 || !map) return;

    const geocoder = new google.maps.Geocoder();
    const resolvedWaypoints = [];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let loc = null;
        if (step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng)) {
            loc = new google.maps.LatLng(parseFloat(step.lat), parseFloat(step.lng));
        } else {
            const rawLocation = step.location || step.activity || step.title;
            const query = rawLocation.toLowerCase().includes(mainDestination.toLowerCase()) ? rawLocation : `${rawLocation}, ${mainDestination}`;
            await new Promise((resolve) => {
                geocoder.geocode({ address: query }, (results, status) => {
                    if (status === 'OK' && results[0]) loc = results[0].geometry.location;
                    resolve();
                });
            });
        }
        if (loc) resolvedWaypoints.push({ location: loc, stepInfo: step, index: i });
    }

    if (resolvedWaypoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    resolvedWaypoints.forEach(wp => bounds.extend(wp.location));

    buildSwipeCarousel(resolvedWaypoints, mainDestination);

    if (resolvedWaypoints.length === 1) {
        const singleLoc = resolvedWaypoints[0].location;
        const marker = new google.maps.Marker({
            position: singleLoc, map: map,
            title: `1. ${resolvedWaypoints[0].stepInfo.activity || resolvedWaypoints[0].stepInfo.title}`,
            icon: getNumberedGoldPin("1")
        });
        activeMarkers.push(marker);
        map.setCenter(singleLoc);
        map.setZoom(14);
        return;
    }

    const origin = resolvedWaypoints[0].location;
    const destination = resolvedWaypoints[resolvedWaypoints.length - 1].location;
    const waypoints = resolvedWaypoints.slice(1, resolvedWaypoints.length - 1).map(wp => ({ location: wp.location, stopover: true }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map, suppressMarkers: true, preserveViewport: false,
        polylineOptions: { strokeColor: "#A63A2B", strokeWeight: 5, strokeOpacity: 0.9 }
    });

    routePolyline = directionsRenderer;

    directionsService.route({
        origin: origin, destination: destination, waypoints: waypoints,
        optimizeWaypoints: false, travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            let totalDistanceMeters = 0; let totalDurationSeconds = 0;
            const route = response.routes[0];
            
            for (let i = 0; i < route.legs.length; i++) {
                totalDistanceMeters += route.legs[i].distance.value; 
                totalDurationSeconds += route.legs[i].duration.value;
            }
            
            const totalKm = (totalDistanceMeters / 1000).toFixed(1);
            const hours = Math.floor(totalDurationSeconds / 3600);
            const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
            let timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

            const distanceSpan = document.getElementById('map-daily-distance');
            if (distanceSpan) distanceSpan.textContent = ` — 🚗 ${totalKm} km • ⏱️ ${timeStr}`; 

            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location, map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    icon: getNumberedGoldPin(wp.index + 1)
                });
                activeMarkers.push(marker);
            });
        } else {
            const distanceSpan = document.getElementById('map-daily-distance');
            if (distanceSpan) distanceSpan.textContent = '';
            
            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location, map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    icon: getNumberedGoldPin(wp.index + 1)
                });
                activeMarkers.push(marker);
            });
        }
    });

    if (!bounds.isEmpty()) map.fitBounds(bounds);
}

// --- AFFICHAGE D'UNE SEULE ÉTAPE (DESKTOP) ---
function selectActivityOnMap(step, addressQuery, mainDestination) {
    if (!map) return;
    const actName = step ? (step.activity || step.title || 'Activité') : 'Activité';
    const locationName = step ? (step.location || addressQuery || mainDestination) : (addressQuery || mainDestination);
    
    const carousel = document.getElementById('kaido-map-carousel');
    if (carousel) carousel.style.display = 'none';

    if (window.innerWidth >= 768) {
        const previewBox = document.getElementById('activity-preview');
        const previewImg = document.getElementById('activity-img');
        const previewLoading = document.getElementById('activity-loading');
        const previewTitle = document.getElementById('activity-title');

        if (previewBox) previewBox.style.display = 'block';
        if (previewImg) previewImg.style.display = 'none';
        if (previewLoading) previewLoading.style.display = 'flex';
        if (previewTitle) previewTitle.textContent = `📍 ${actName}`;
        
        if (placesService) {
            placesService.findPlaceFromQuery({ query: `${actName}, ${locationName}`, fields: ['photos'] }, (results, status) => {
                if (previewLoading) previewLoading.style.display = 'none';
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    if (previewImg && place.photos && place.photos.length > 0) {
                        previewImg.src = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                        previewImg.style.display = 'block'; 
                    }
                }
            });
        }
    }

    const placeMarkerAt = (location) => {
        clearMapOverlays();
        const marker = new google.maps.Marker({
            position: location, map: map, title: actName,
            animation: google.maps.Animation.DROP, icon: goldPinIcon
        });
        activeMarkers.push(marker);
        map.panTo(location);
        map.setZoom(15);
    };

    if (step && step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng)) {
        placeMarkerAt({ lat: parseFloat(step.lat), lng: parseFloat(step.lng) });
    } else {
        const geocoder = new google.maps.Geocoder();
        let cleanQuery = locationName.toLowerCase().includes(mainDestination.toLowerCase()) ? locationName : `${locationName}, ${mainDestination}`;
        geocoder.geocode({ address: cleanQuery }, (results, status) => {
            if (status === 'OK' && results[0]) placeMarkerAt(results[0].geometry.location);
        });
    }
}
