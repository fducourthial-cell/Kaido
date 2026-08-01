let map;
let activeMarkers = []; 
let routePolyline = null; 
let placesService = null;

// --- FONCTION POUR GÉNÉRER UN PIN DORÉ AVEC LE NUMÉRO INTÉGRÉ ---
function getNumberedGoldPin(numberText) {
    const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256">
            <g transform="translate(1.40659 1.40659) scale(2.81)">
                <!-- Gradient Doré -->
                <linearGradient id="SVGID_4" x1="45" y1="80.71" x2="45" y2="2.88" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#b07908"/>
                    <stop offset="22%" stop-color="#ddbd53"/>
                    <stop offset="40%" stop-color="#f4e07a"/>
                    <stop offset="68%" stop-color="#d5b354"/>
                    <stop offset="100%" stop-color="#c0943a"/>
                </linearGradient>
                <!-- Corps du Pin -->
                <path d="M 45 1.5 c -15.92 0 -28.83 12.9 -28.83 28.83 C 16.16 46.25 30.58 70.86 45 88.5 c 14.41 -17.63 28.83 -42.24 28.83 -58.16 C 73.83 14.4 60.92 1.5 45 1.5 z" fill="url(#SVGID_4)"/>
                <!-- Cercle blanc à l'intérieur -->
                <circle cx="45" cy="30.33" r="14" fill="#FFFFFF" stroke="#c0943a" stroke-width="2"/>
                <!-- Texte du numéro centré -->
                <text x="45" y="35.5" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#0D0B09" text-anchor="middle">${numberText}</text>
            </g>
        </svg>
    `;
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40) // Ancrage parfait sur la pointe du pin
    };
}

// Pin simple sans numéro (pour l'étape unique ou sélectionnée)
const goldPinIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 256 256">
            <g transform="translate(1.40659 1.40659) scale(2.81)">
                <linearGradient id="SVGID_4" x1="45" y1="80.71" x2="45" y2="2.88" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#b07908"/>
                    <stop offset="22%" stop-color="#ddbd53"/>
                    <stop offset="40%" stop-color="#f4e07a"/>
                    <stop offset="68%" stop-color="#d5b354"/>
                    <stop offset="100%" stop-color="#c0943a"/>
                </linearGradient>
                <path d="M 45 1.5 c -15.92 0 -28.83 12.9 -28.83 28.83 C 16.16 46.25 30.58 70.86 45 88.5 c 14.41 -17.63 28.83 -42.24 28.83 -58.16 C 73.83 14.4 60.92 1.5 45 1.5 z M 45 47.6 c -9.78 0 -17.71 -7.93 -17.71 -17.71 S 35.21 12.18 45 12.18 s 17.71 7.93 17.71 17.71 S 54.78 47.6 45 47.6 z" fill="url(#SVGID_4)"/>
            </g>
        </svg>
    `),
    scaledSize: new google.maps.Size(36, 36),
    anchor: new google.maps.Point(18, 36)
};

// Styles personnalisés pour la carte Google Maps selon le thème actif
const mapStyles = {
    dark: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
    ],
    papyrus: [
        { elementType: "geometry", stylers: [{ color: "#F2EBD9" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#FCF8F2" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#6B5E52" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#8C6D23" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#E4D8C3" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1C2A5" }] }
    ]
};

function initGoogleMap(destinationName, lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof google === 'undefined' || !google.maps) return;

    let initialPos = { lat: 48.8566, lng: 2.3522 };

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        initialPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    const currentTheme = document.body.getAttribute('data-theme') || localStorage.getItem('kaido_theme') || 'dark';
    const activeStyle = mapStyles[currentTheme] || mapStyles.dark;

    map = new google.maps.Map(mapContainer, {
        zoom: 12,
        center: initialPos,
        disableDefaultUI: true,
        zoomControl: true,
        styles: activeStyle
    });

    placesService = new google.maps.places.PlacesService(map);

    if (!lat || !lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                map.setCenter(results[0].geometry.location);
            }
        });
    }

    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(() => {
                const newTheme = document.body.getAttribute('data-theme') || localStorage.getItem('kaido_theme') || 'dark';
                if (map && mapStyles[newTheme]) {
                    map.setOptions({ styles: mapStyles[newTheme] });
                }
            }, 50);
        });
    }
}

function clearMapOverlays() {
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers = [];
    if (routePolyline) {
        if (typeof routePolyline.setMap === 'function') {
            routePolyline.setMap(null);
        } else if (typeof routePolyline.setDirections === 'function') {
            routePolyline.setMap(null);
        }
        routePolyline = null;
    }
}

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
            const query = rawLocation.toLowerCase().includes(mainDestination.toLowerCase()) 
                ? rawLocation 
                : `${rawLocation}, ${mainDestination}`;

            await new Promise((resolve) => {
                geocoder.geocode({ address: query }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        loc = results[0].geometry.location;
                    }
                    resolve();
                });
            });
        }

        if (loc) {
            resolvedWaypoints.push({ location: loc, stepInfo: step, index: i });
        }
    }

    if (resolvedWaypoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    resolvedWaypoints.forEach(wp => bounds.extend(wp.location));

    // Si une seule étape, marqueur "1" avec le Pin Doré numéroté
    if (resolvedWaypoints.length === 1) {
        const singleLoc = resolvedWaypoints[0].location;
        const marker = new google.maps.Marker({
            position: singleLoc,
            map: map,
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
    
    const waypoints = resolvedWaypoints.slice(1, resolvedWaypoints.length - 1).map(wp => ({
        location: wp.location,
        stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, 
        preserveViewport: false,
        polylineOptions: {
            strokeColor: "#A63A2B",
            strokeWeight: 5,
            strokeOpacity: 0.9
        }
    });

    routePolyline = directionsRenderer;

    directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: false, 
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);

            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location,
                    map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    icon: getNumberedGoldPin(wp.index + 1)
                });
                activeMarkers.push(marker);
            });

        } else {
            console.warn("Impossible de tracer l'itinéraire routier :", status);
            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location,
                    map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    icon: getNumberedGoldPin(wp.index + 1)
                });
                activeMarkers.push(marker);
            });
        }
    });

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    }
}

function selectActivityOnMap(step, addressQuery, mainDestination) {
    const actName = step ? (step.activity || step.title || 'Activité') : 'Activité';
    const locationName = step ? (step.location || addressQuery || mainDestination) : (addressQuery || mainDestination);
    
    const previewBox = document.getElementById('activity-preview');
    const previewImg = document.getElementById('activity-img');
    const previewLoading = document.getElementById('activity-loading');
    const previewTitle = document.getElementById('activity-title');

    if (previewBox) previewBox.style.display = 'block';
    if (previewImg) previewImg.style.display = 'none';
    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewTitle) previewTitle.textContent = `📍 ${actName}`;

    const placeMarkerAt = (location) => {
        clearMapOverlays();
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: actName,
            animation: google.maps.Animation.DROP,
            icon: goldPinIcon
        });
        activeMarkers.push(marker);
        map.panTo(location);
        map.setZoom(13);
    };

    if (step && step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng) && map) {
        placeMarkerAt({ lat: parseFloat(step.lat), lng: parseFloat(step.lng) });
    } else if (map) {
        const geocoder = new google.maps.Geocoder();
        let cleanQuery = locationName;
        if (!cleanQuery.toLowerCase().includes(mainDestination.toLowerCase())) {
            cleanQuery = `${locationName}, ${mainDestination}`;
        }

        geocoder.geocode({ address: cleanQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                placeMarkerAt(results[0].geometry.location);
            } else {
                const fallbackQuery = `${actName}, ${mainDestination}`;
                geocoder.geocode({ address: fallbackQuery }, (resFallback, statusFallback) => {
                    if (statusFallback === 'OK' && resFallback[0]) {
                        placeMarkerAt(resFallback[0].geometry.location);
                    }
                });
            }
        });
    }

    if (placesService) {
        const query = `${actName}, ${locationName}`;
        placesService.findPlaceFromQuery(
            { query: query, fields: ['photos'] },
            (results, status) => {
                if (previewLoading) previewLoading.style.display = 'none';

                if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                    const place = results[0];
                    if (previewImg && place.photos && place.photos.length > 0) {
                        previewImg.src = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
                        previewImg.style.display = 'none'; // garde tes réglages
                    }
                }
            }
        );
    }
}
