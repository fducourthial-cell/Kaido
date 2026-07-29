let map;
let activeMarkers = []; 
let routePolyline = null; 
let placesService = null;

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
        { elementType: "geometry", stylers: [{ color: "#F2EBD9" }] }, // Ton blanc cassé / parchemin des cartes
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

    let initialPos = { lat: 48.8566, lng: 2.3522 }; // Fallback Paris

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        initialPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // 1. CORRECTION : Sécurité au chargement (vérifie le localStorage si le body n'est pas encore prêt)
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

    // Fallback géocodage unique
    if (!lat || !lng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: destinationName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                map.setCenter(results[0].geometry.location);
            }
        });
    }

    // 2. CORRECTION : Réintégration de l'écouteur du bouton Thème
    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            setTimeout(() => {
                // On récupère le nouveau thème après le clic
                const newTheme = document.body.getAttribute('data-theme') || localStorage.getItem('kaido_theme') || 'dark';
                if (map && mapStyles[newTheme]) {
                    map.setOptions({ styles: mapStyles[newTheme] });
                }
            }, 50); // Léger délai pour laisser le script global changer l'attribut du body
        });
    }
}

// Nettoyer les marqueurs et lignes de la carte
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

// Affichage du tracé routier Rouge Torii et des marqueurs numérotés Or personnalisés
async function displayDayOnMap(steps, mainDestination) {
    clearMapOverlays();
    if (!steps || steps.length === 0 || !map) return;

    const geocoder = new google.maps.Geocoder();
    const resolvedWaypoints = [];

    // 1. Résolution de toutes les coordonnées des étapes
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

    // Si une seule étape, simple marqueur numéroté "1" en Or
    if (resolvedWaypoints.length === 1) {
        const singleLoc = resolvedWaypoints[0].location;
        const marker = new google.maps.Marker({
            position: singleLoc,
            map: map,
            title: `1. ${resolvedWaypoints[0].stepInfo.activity || resolvedWaypoints[0].stepInfo.title}`,
            label: {
                text: "1",
                color: "#0D0B09",
                fontWeight: "bold",
                fontSize: "12px"
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#D4AF37",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
            }
        });
        activeMarkers.push(marker);
        map.setCenter(singleLoc);
        map.setZoom(14);
        return;
    }

    // 2. Tracé de la route (Rouge Torii) sans les marqueurs par défaut
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
            strokeColor: "#A63A2B", // Rouge Torii
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

            // 3. Ajout manuel de nos beaux marqueurs numérotés en Or
            resolvedWaypoints.forEach((wp) => {
                const marker = new google.maps.Marker({
                    position: wp.location,
                    map: map,
                    title: `${wp.index + 1}. ${wp.stepInfo.activity || wp.stepInfo.title}`,
                    label: {
                        text: `${wp.index + 1}`,
                        color: "#0D0B09", 
                        fontWeight: "bold",
                        fontSize: "12px"
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: "#D4AF37",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF"
                    }
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
                    label: { text: `${wp.index + 1}`, color: "#0D0B09", fontWeight: "bold", fontSize: "12px" },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 14,
                        fillColor: "#D4AF37",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF"
                    }
                });
                activeMarkers.push(marker);
            });
        }
    });

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    }
}

// Sélectionner une seule activité au clic individuel
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
            icon: {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                fillColor: "#D4AF37",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF",
                scale: 1.8,
                anchor: new google.maps.Point(12, 22)
            }
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
                        previewImg.style.display = 'block';
                    }
                }
            }
        );
    }
}
