// ==========================================
// 1. BANQUE DE MOTS STATIQUE (6 Langues)
// ==========================================
const staticTranslations = {
    
    en: {
        "KAIDO": "KAIDO",
        "Projet Kiroku": "Kiroku Project",
        "Changer de thème": "Change theme",
        "Langue": "Language",
        "Mon Profil": "My Profile",
        "Mes futurs voyages": "My future trips",
        "Aucun voyage enregistré pour le moment.": "No trips saved yet.",
        "Tracer une nouvelle route": "Plot a new route",
        "Découvrir": "Discover",
        "Supprimer": "Delete",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "Kaido's intelligence designs your custom travel log.",
        "La Destination": "The Destination",
        "Ville de départ": "Departure city",
        "Destination de vos rêves": "Dream destination",
        "Le Calendrier": "The Calendar",
        "Date Aller": "Departure Date",
        "Date Retour": "Return Date",
        "Budget Max estimé (Optionnel)": "Estimated Max Budget (Optional)",
        "Vos Envies": "Your Preferences",
        "Notes, mode de transport & activités souhaitées": "Notes, transport & desired activities",
        "Concevoir mon itinéraire sur-mesure": "Design my custom itinerary",
        "Tracer votre route...": "Plotting your route...",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure. Veuillez patienter.": "Kaido is designing your custom travel log. Please wait.",
        "Partager": "Share",
        "Exporter PDF": "Export PDF",
        "Modifier": "Edit",
        "Clôturer": "Close",
        "Itinéraire": "Itinerary",
        "Budget": "Budget",
        "Infos": "Info",
        "Carte": "Map",
        "Liens": "Links",
        "Documents": "Documents",
        "Galerie": "Gallery",
        "Galerie Collaborative": "Collaborative Gallery",
        "Partagez vos meilleurs souvenirs de voyage.": "Share your best travel memories.",
        "Cliquez pour ajouter des photos": "Click to add photos",
        "Vous pouvez sélectionner plusieurs photos à la fois": "You can select multiple photos at once",
        "Envoi en cours...": "Uploading...",
        "Carte interactive": "Interactive map",
        "Cliquez sur une étape pour la localiser": "Click a step to locate it",
        "Recherche de la photo...": "Searching for photo...",
        "Budget & Estimation": "Budget & Estimation",
        "Estimation globale du séjour": "Overall stay estimate",
        "Budget Total Estimé": "Estimated Total Budget",
        "Transports & Vols": "Transports & Flights",
        "Hébergement": "Accommodation",
        "Repas & Activités": "Meals & Activities",
        "Budget & Dépenses Réelles": "Budget & Real Expenses",
        "Comparatif et suivi du coût du voyage": "Comparison and cost tracking",
        "Réel": "Actual",
        "Estimé": "Estimated",
        "Dans les clous": "On track",
        "Aucune dépense enregistrée.": "No expenses recorded.",
        "Dépenses partagées": "Shared Expenses",
        "Gérez les comptes du groupe et l'équilibre des remboursements": "Manage group accounts and reimbursements",
        "Participants du voyage :": "Trip participants:",
        "+ Ajouter": "+ Add",
        "Partagé entre :": "Shared between:",
        "Ajoutez des participants d'abord.": "Add participants first.",
        "Ajouter la dépense": "Add expense",
        "Aucune dépense partagée pour le moment.": "No shared expenses yet.",
        "Équilibre des comptes": "Account balance",
        "Ajoutez des participants et des dépenses pour calculer les remboursements.": "Add participants and expenses to calculate reimbursements.",
        "Check-list de voyage": "Travel Checklist",
        "À ne pas oublier": "Not to forget",
        "Météo prévue": "Weather forecast",
        "Prévisions sur place": "Forecast on site",
        "Chargement de la météo...": "Loading weather...",
        "Liens de réservation & Partenaires": "Booking Links & Partners",
        "Préparez votre voyage en un clic. Les dates et la destination de votre séjour sont automatiquement prises en compte.": "Plan your trip in one click. Dates and destination are automatically included.",
        "Trouver les meilleurs vols": "Find the best flights",
        "Hôtels & Hébergements": "Hotels & Accommodations",
        "Apparts & Logements insolites": "Unusual apartments & stays",
        "Location de voiture": "Car rental",
        "Comparer les loueurs (Kayak)": "Compare rental companies",
        "Mes notes de réservation personnelles": "My personal booking notes",
        "Ajoutez ici vos numéros de vol, codes de réservation d'hôtel ou liens directs vers vos billets.": "Add flight numbers, hotel codes, or ticket links here.",
        "Portefeuille Documentaire": "Document Portfolio",
        "Centralise tes billets, réservations et passeports. Ils seront accessibles ici même hors connexion (si déjà ouverts une fois).": "Centralize your tickets, bookings and passports. Accessible offline.",
        "Uploader le document": "Upload document",
        "Modifier le voyage": "Edit trip",
        "Annuler": "Cancel",
        "Sauvegarder": "Save",
        "Carnet de route collaboratif": "Collaborative travel log",
        "Chargement de l'aventure...": "Loading adventure...",
        "L'Itinéraire": "The Itinerary",
        "Carte & Aperçu": "Map & Preview",
        "Ajoutez vos souvenirs, tout le monde en profite.": "Add your memories, everyone enjoys them.",
        "Qui doit combien ?": "Who owes how much?",
        "Voyage planifié avec Kaido": "Trip planned with Kaido",
        "Créez, organisez et suivez vos propres carnets de route, budgets et itinéraires de voyage sur une application unique.": "Create, organize and track your own travel logs, budgets and itineraries.",
        "Découvrir Kaido →": "Discover Kaido →"
    },
    es: {
        "KAIDO": "KAIDO",
        "Projet Kiroku": "Proyecto Kiroku",
        "Changer de thème": "Cambiar tema",
        "Langue": "Idioma",
        "Mon Profil": "Mi Perfil",
        "Mes futurs voyages": "Mis futuros viajes",
        "Aucun voyage enregistré pour le moment.": "Ningún viaje guardado por ahora.",
        "Tracer une nouvelle route": "Trazar una nueva ruta",
        "Découvrir": "Descubrir",
        "Supprimer": "Eliminar",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "La inteligencia de Kaido diseña tu cuaderno de viaje a medida.",
        "La Destination": "El Destino",
        "Ville de départ": "Ciudad de salida",
        "Destination de vos rêves": "Destino de tus sueños",
        "Le Calendrier": "El Calendario",
        "Date Aller": "Fecha de ida",
        "Date Retour": "Fecha de vuelta",
        "Budget Max estimé (Optionnel)": "Presupuesto máximo estimado (Opcional)",
        "Vos Envies": "Tus Preferencias",
        "Notes, mode de transport & activités souhaitées": "Notas, transporte y actividades deseadas",
        "Concevoir mon itinéraire sur-mesure": "Diseñar mi itinerario a medida",
        "Tracer votre route...": "Trazando tu ruta...",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure. Veuillez patienter.": "Kaido está diseñando tu cuaderno de viaje. Por favor espera.",
        "Partager": "Compartir",
        "Exporter PDF": "Exportar PDF",
        "Modifier": "Editar",
        "Clôturer": "Cerrar",
        "Itinéraire": "Itinerario",
        "Budget": "Presupuesto",
        "Infos": "Info",
        "Carte": "Mapa",
        "Liens": "Enlaces",
        "Documents": "Documentos",
        "Galerie": "Galería",
        "Galerie Collaborative": "Galería Colaborativa",
        "Partagez vos meilleurs souvenirs de voyage.": "Comparte tus mejores recuerdos de viaje.",
        "Cliquez pour ajouter des photos": "Haz clic para añadir fotos",
        "Vous pouvez sélectionner plusieurs photos à la fois": "Puedes seleccionar varias fotos a la vez",
        "Envoi en cours...": "Enviando...",
        "Carte interactive": "Mapa interactivo",
        "Cliquez sur une étape pour la localiser": "Haz clic en una etapa para localizarla",
        "Recherche de la photo...": "Buscando foto...",
        "Budget & Estimation": "Presupuesto y Estimación",
        "Estimation globale du séjour": "Estimación global de la estancia",
        "Budget Total Estimé": "Presupuesto Total Estimado",
        "Transports & Vols": "Transportes y Vuelos",
        "Hébergement": "Alojamiento",
        "Repas & Activités": "Comidas y Actividades",
        "Budget & Dépenses Réelles": "Presupuesto y Gastos Reales",
        "Comparatif et suivi du coût du voyage": "Comparación y seguimiento de costos",
        "Réel": "Real",
        "Estimé": "Estimado",
        "Dans les clous": "En el presupuesto",
        "Aucune dépense enregistrée.": "Ningún gasto registrado.",
        "Dépenses partagées": "Gastos compartidos",
        "Gérez les comptes du groupe et l'équilibre des remboursements": "Gestiona las cuentas del grupo y reembolsos",
        "Participants du voyage :": "Participantes del viaje:",
        "+ Ajouter": "+ Añadir",
        "Partagé entre :": "Compartido entre:",
        "Ajoutez des participants d'abord.": "Añade participantes primero.",
        "Ajouter la dépense": "Añadir gasto",
        "Aucune dépense partagée pour le moment.": "Sin gastos compartidos por ahora.",
        "Équilibre des comptes": "Balance de cuentas",
        "Ajoutez des participants et des dépenses pour calculer les remboursements.": "Añade participantes y gastos para calcular reembolsos.",
        "Check-list de voyage": "Lista de equipaje",
        "À ne pas oublier": "Qué llevar",
        "Météo prévue": "Previsión meteorológica",
        "Prévisions sur place": "Pronóstico local",
        "Chargement de la météo...": "Cargando clima...",
        "Liens de réservation & Partenaires": "Enlaces de reserva y Socios",
        "Préparez votre voyage en un clic. Les dates et la destination de votre séjour sont automatiquement prises en compte.": "Prepara tu viaje en un clic. Fechas y destino incluidos automáticamente.",
        "Trouver les meilleurs vols": "Encontrar los mejores vuelos",
        "Hôtels & Hébergements": "Hoteles y alojamientos",
        "Apparts & Logements insolites": "Apartamentos y alojamientos singulares",
        "Location de voiture": "Alquiler de coches",
        "Comparer les loueurs (Kayak)": "Comparar alquileres",
        "Mes notes de réservation personnelles": "Mis notas personales de reserva",
        "Ajoutez ici vos numéros de vol, codes de réservation d'hôtel ou liens directs vers vos billets.": "Añade aquí tus vuelos, códigos de hotel o enlaces.",
        "Portefeuille Documentaire": "Cartera Documental",
        "Centralise tes billets, réservations et passeports. Ils seront accessibles ici même hors connexion (si déjà ouverts une fois).": "Centraliza tus billetes, reservas y pasaportes offline.",
        "Uploader le document": "Subir documento",
        "Modifier le voyage": "Editar viaje",
        "Annuler": "Cancelar",
        "Sauvegarder": "Guardar",
        "Carnet de route collaboratif": "Cuaderno de ruta colaborativo",
        "Chargement de l'aventure...": "Cargando aventura...",
        "L'Itinéraire": "El Itinerario",
        "Carte & Aperçu": "Mapa y Vista previa",
        "Ajoutez vos souvenirs, tout le monde en profite.": "Añade tus recuerdos, todos los disfrutan.",
        "Qui doit combien ?": "¿Quién debe cuánto?",
        "Voyage planifié avec Kaido": "Viaje planificado con Kaido",
        "Créez, organisez et suivez vos propres carnets de route, budgets et itinéraires de voyage sur une application unique.": "Crea, organiza y sigue tus propios cuadernos de ruta y presupuestos.",
        "Découvrir Kaido →": "Descubrir Kaido →"
    },
    it: {
        "KAIDO": "KAIDO",
        "Projet Kiroku": "Progetto Kiroku",
        "Changer de thème": "Cambia tema",
        "Langue": "Lingua",
        "Mon Profil": "Il mio Profilo",
        "Mes futurs voyages": "I miei futuri viaggi",
        "Aucun voyage enregistré pour le moment.": "Nessun viaggio salvato.",
        "Tracer une nouvelle route": "Traccia un nuovo percorso",
        "Découvrir": "Scopri",
        "Supprimer": "Elimina",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "L'intelligenza di Kaido progetta il tuo diario di viaggio su misura.",
        "La Destination": "La Destinazione",
        "Ville de départ": "Città di partenza",
        "Destination de vos rêves": "Destinazione dei sogni",
        "Le Calendrier": "Il Calendario",
        "Date Aller": "Data di partenza",
        "Date Retour": "Data di ritorno",
        "Budget Max estimé (Optionnel)": "Budget massimo stimato (Opzionale)",
        "Vos Envies": "I tuoi desideri",
        "Notes, mode de transport & activités souhaitées": "Note, trasporti e attività desiderate",
        "Concevoir mon itinéraire sur-mesure": "Progetta il mio itinerario su misura",
        "Tracer votre route...": "Tracciamento della rotta...",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure. Veuillez patienter.": "Kaido sta progettando il tuo diario di viaggio. Attendere prego.",
        "Partager": "Condividi",
        "Exporter PDF": "Esporta PDF",
        "Modifier": "Modifica",
        "Clôturer": "Chiudi",
        "Itinéraire": "Itinerario",
        "Budget": "Budget",
        "Infos": "Info",
        "Carte": "Mappa",
        "Liens": "Link",
        "Documents": "Documenti",
        "Galerie": "Galleria",
        "Galerie Collaborative": "Galleria Collaborativa",
        "Partagez vos meilleurs souvenirs de voyage.": "Condividi i tuoi migliori ricordi di viaggio.",
        "Cliquez pour ajouter des photos": "Clicca per aggiungere foto",
        "Vous pouvez sélectionner plusieurs photos à la fois": "Puoi selezionare più foto contemporaneamente",
        "Envoi en cours...": "Invio in corso...",
        "Carte interactive": "Mappa interattiva",
        "Cliquez sur une étape pour la localiser": "Clicca su una tappa per localizzarla",
        "Recherche de la photo...": "Ricerca foto in corso...",
        "Budget & Estimation": "Budget e Stima",
        "Estimation globale du séjour": "Stima globale del soggiorno",
        "Budget Total Estimé": "Budget Totale Stimato",
        "Transports & Vols": "Trasporti e Voli",
        "Hébergement": "Alloggio",
        "Repas & Activités": "Pasti e Attività",
        "Budget & Dépenses Réelles": "Budget e Spese Reali",
        "Comparatif et suivi du coût du voyage": "Confronto e monitoraggio costi",
        "Réel": "Reale",
        "Estimé": "Stimato",
        "Dans les clous": "In linea",
        "Aucune dépense enregistrée.": "Nessuna spesa registrata.",
        "Dépenses partagées": "Spese condivise",
        "Gérez les comptes du groupe et l'équilibre des remboursements": "Gestisci i conti di gruppo e rimborsi",
        "Participants du voyage :": "Partecipanti del viaggio:",
        "+ Ajouter": "+ Aggiungi",
        "Partagé entre :": "Condiviso tra:",
        "Ajoutez des participants d'abord.": "Aggiungi prima i partecipanti.",
        "Ajouter la dépense": "Aggiungi spesa",
        "Aucune dépense partagée pour le moment.": "Nessuna spesa condivisa per ora.",
        "Équilibre des comptes": "Bilancio dei conti",
        "Ajoutez des participants et des dépenses pour calculer les remboursements.": "Aggiungi partecipanti e spese per calcolare i rimborsi.",
        "Check-list de voyage": "Lista valigia",
        "À ne pas oublier": "Da non dimenticare",
        "Météo prévue": "Previsioni meteo",
        "Prévisions sur place": "Previsioni sul posto",
        "Chargement de la météo...": "Caricamento meteo...",
        "Liens de réservation & Partenaires": "Link di prenotazione e Partner",
        "Préparez votre voyage en un clic. Les dates et la destination de votre séjour sont automatiquement prises en compte.": "Organizza il tuo viaggio in un clic. Date e destinazione incluse.",
        "Trouver les meilleurs vols": "Trova i voli migliori",
        "Hôtels & Hébergements": "Hotel e Alloggi",
        "Apparts & Logements insolites": "Appartamenti e alloggi insoliti",
        "Location de voiture": "Noleggio auto",
        "Comparer les loueurs (Kayak)": "Confronta autonoleggi",
        "Mes notes de réservation personnelles": "Le mie note di prenotazione personali",
        "Ajoutez ici vos numéros de vol, codes de réservation d'hôtel ou liens directs vers vos billets.": "Aggiungi qui numeri di volo o codici hotel.",
        "Portefeuille Documentaire": "Portafoglio Documenti",
        "Centralise tes billets, réservations et passeports. Ils seront accessibles ici même hors connexion (si déjà ouverts une fois).": "Centralizza biglietti e passaporti offline.",
        "Uploader le document": "Carica documento",
        "Modifier le voyage": "Modifica viaggio",
        "Annuler": "Annulla",
        "Sauvegarder": "Salva",
        "Carnet de route collaboratif": "Diario di viaggio collaborativo",
        "Chargement de l'aventure...": "Caricamento avventura...",
        "L'Itinéraire": "L'Itinerario",
        "Carte & Aperçu": "Mappa e Anteprima",
        "Ajoutez vos souvenirs, tout le monde en profite.": "Aggiungi i tuoi ricordi, tutti ne traggono vantaggio.",
        "Qui doit combien ?": "Chi deve quanto?",
        "Voyage planifié avec Kaido": "Viaggio pianificato con Kaido",
        "Créez, organisez et suivez vos propres carnets de route, budgets et itinéraires de voyage sur une application unique.": "Crea, organizza e monitora i tuoi diari di viaggio.",
        "Découvrir Kaido →": "Scopri Kaido →"
    },
    de: {
        "KAIDO": "KAIDO",
        "Projet Kiroku": "Kiroku-Projekt",
        "Changer de thème": "Thema wechseln",
        "Langue": "Sprache",
        "Mon Profil": "Mein Profil",
        "Mes futurs voyages": "Meine zukünftigen Reisen",
        "Aucun voyage enregistré pour le moment.": "Noch keine Reisen gespeichert.",
        "Tracer une nouvelle route": "Neue Route planen",
        "Découvrir": "Entdecken",
        "Supprimer": "Löschen",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "Kaidos Intelligenz entwirft Ihr maßgeschneidertes Reisetagebuch.",
        "La Destination": "Das Reiseziel",
        "Ville de départ": "Abfahrtsstadt",
        "Destination de vos rêves": "Traumreiseziel",
        "Le Calendrier": "Der Kalender",
        "Date Aller": "Hinreisedatum",
        "Date Retour": "Rückreisedatum",
        "Budget Max estimé (Optionnel)": "Geschätztes Max. Budget (Optional)",
        "Vos Envies": "Ihre Wünsche",
        "Notes, mode de transport & activités souhaitées": "Notizen, Verkehrsmittel & gewünschte Aktivitäten",
        "Concevoir mon itinéraire sur-mesure": "Maßgeschneiderte Reiseroute erstellen",
        "Tracer votre route...": "Route wird berechnet...",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure. Veuillez patienter.": "Kaido erstellt Ihr Reisetagebuch. Bitte warten.",
        "Partager": "Teilen",
        "Exporter PDF": "PDF exportieren",
        "Modifier": "Bearbeiten",
        "Clôturer": "Abschließen",
        "Itinéraire": "Reiseroute",
        "Budget": "Budget",
        "Infos": "Infos",
        "Carte": "Karte",
        "Liens": "Links",
        "Documents": "Dokumente",
        "Galerie": "Galerie",
        "Galerie Collaborative": "Gemeinsame Galerie",
        "Partagez vos meilleurs souvenirs de voyage.": "Teilen Sie Ihre besten Reiseerinnerungen.",
        "Cliquez pour ajouter des photos": "Klicken Sie hier, um Fotos hinzuzufügen",
        "Vous pouvez sélectionner plusieurs photos à la fois": "Sie können mehrere Fotos gleichzeitig auswählen",
        "Envoi en cours...": "Wird gesendet...",
        "Carte interactive": "Interaktive Karte",
        "Cliquez sur une étape pour la localiser": "Klicken Sie auf eine Etappe, um sie zu lokalisieren",
        "Recherche de la photo...": "Suche nach Foto...",
        "Budget & Estimation": "Budget & Schätzung",
        "Estimation globale du séjour": "Gesamtschätzung des Aufenthalts",
        "Budget Total Estimé": "Geschätztes Gesamtbudget",
        "Transports & Vols": "Transport & Flüge",
        "Hébergement": "Unterkunft",
        "Repas & Activités": "Essen & Aktivitäten",
        "Budget & Dépenses Réelles": "Budget & Tatsächliche Ausgaben",
        "Comparatif et suivi du coût du voyage": "Kostenvergleich und -verfolgung",
        "Réel": "Tatsächlich",
        "Estimé": "Geschätzt",
        "Dans les clous": "Im Rahmen",
        "Aucune dépense enregistrée.": "Keine Ausgaben erfasst.",
        "Dépenses partagées": "Geteilte Ausgaben",
        "Gérez les comptes du groupe et l'équilibre des remboursements": "Verwalten Sie Gruppenkonten und Erstattungen",
        "Participants du voyage :": "Teilnehmer:",
        "+ Ajouter": "+ Hinzufügen",
        "Partagé entre :": "Geteilt zwischen:",
        "Ajoutez des participants d'abord.": "Fügen Sie zuerst Teilnehmer hinzu.",
        "Ajouter la dépense": "Ausgabe hinzufügen",
        "Aucune dépense partagée pour le moment.": "Noch keine geteilten Ausgaben.",
        "Équilibre des comptes": "Kontostand",
        "Ajoutez des participants et des dépenses pour calculer les remboursements.": "Fügen Sie Teilnehmer und Ausgaben hinzu, um Erstattungen zu berechnen.",
        "Check-list de voyage": "Packliste",
        "À ne pas oublier": "Nicht vergessen",
        "Météo prévue": "Wettervorhersage",
        "Prévisions sur place": "Vorhersage vor Ort",
        "Chargement de la météo...": "Wetter wird geladen...",
        "Liens de réservation & Partenaires": "Buchungslinks & Partner",
        "Préparez votre voyage en un clic. Les dates et la destination de votre séjour sont automatiquement prises en compte.": "Planen Sie Ihre Reise mit einem Klick.",
        "Trouver les meilleurs vols": "Beste Flüge finden",
        "Hôtels & Hébergements": "Hotels & Unterkünfte",
        "Apparts & Logements insolites": "Außergewöhnliche Unterkünfte",
        "Location de voiture": "Mietwagen",
        "Comparer les loueurs (Kayak)": "Mietwagen vergleichen",
        "Mes notes de réservation personnelles": "Meine persönlichen Buchungsnotizen",
        "Ajoutez ici vos numéros de vol, codes de réservation d'hôtel ou liens directs vers vos billets.": "Fügen Sie hier Flugnummern oder Buchungscodes hinzu.",
        "Portefeuille Documentaire": "Dokumentenmappe",
        "Centralise tes billets, réservations et passeports. Ils seront accessibles ici même hors connexion (si déjà ouverts une fois).": "Zentralisieren Sie Ihre Tickets und Pässe offline.",
        "Uploader le document": "Dokument hochladen",
        "Modifier le voyage": "Reise bearbeiten",
        "Annuler": "Abbrechen",
        "Sauvegarder": "Speichern",
        "Carnet de route collaboratif": "Kollaboratives Reisetagebuch",
        "Chargement de l'aventure...": "Abenteuer wird geladen...",
        "L'Itinéraire": "Die Reiseroute",
        "Carte & Aperçu": "Karte & Vorschau",
        "Ajoutez vos souvenirs, tout le monde en profite.": "Fügen Sie Ihre Erinnerungen hinzu.",
        "Qui doit combien ?": "Wer schuldet wem was?",
        "Voyage planifié avec Kaido": "Mit Kaido geplante Reise",
        "Créez, organisez et suivez vos propres carnets de route, budgets et itinéraires de voyage sur une application unique.": "Erstellen und verwalten Sie Ihre Reisetagebücher.",
        "Découvrir Kaido →": "Kaido entdecken →"
    },
    ja: {
        "KAIDO": "KAIDO",
        "Projet Kiroku": "Kirokuプロジェクト",
        "Changer de thème": "テーマを変更",
        "Langue": "言語",
        "Mon Profil": "マイプロフィール",
        "Mes futurs voyages": "今後の旅行",
        "Aucun voyage enregistré pour le moment.": "保存された旅行はありません。",
        "Tracer une nouvelle route": "新しいルートを計画する",
        "Découvrir": "発見する",
        "Supprimer": "削除する",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure.": "KaidoのAIがあなただけの旅行記を作成します。",
        "La Destination": "目的地",
        "Ville de départ": "出発地",
        "Destination de vos rêves": "憧れの目的地",
        "Le Calendrier": "カレンダー",
        "Date Aller": "出発日",
        "Date Retour": "帰国日",
        "Budget Max estimé (Optionnel)": "推定最大予算（任意）",
        "Vos Envies": "ご希望",
        "Notes, mode de transport & activités souhaitées": "メモ、移動手段、希望するアクティビティ",
        "Concevoir mon itinéraire sur-mesure": "カスタム旅程を作成する",
        "Tracer votre route...": "ルートを作成中...",
        "L'intelligence de Kaido conçoit votre carnet de voyage sur-mesure. Veuillez patienter.": "Kaidoがカスタム旅行記を作成しています。しばらくお待ちください。",
        "Partager": "共有",
        "Exporter PDF": "PDFエクスポート",
        "Modifier": "編集",
        "Clôturer": "終了",
        "Itinéraire": "旅程",
        "Budget": "予算",
        "Infos": "情報",
        "Carte": "地図",
        "Liens": "リンク",
        "Documents": "書類",
        "Galerie": "ギャラリー",
        "Galerie Collaborative": "共同ギャラリー",
        "Partagez vos meilleurs souvenirs de voyage.": "最高の旅行の思い出をシェアしよう。",
        "Cliquez pour ajouter des photos": "クリックして写真を追加",
        "Vous pouvez sélectionner plusieurs photos à la fois": "複数の写真を一度に選択できます",
        "Envoi en cours...": "アップロード中...",
        "Carte interactive": "インタラクティブマップ",
        "Cliquez sur une étape pour la localiser": "ステップをクリックして位置を表示",
        "Recherche de la photo...": "写真を検索中...",
        "Budget & Estimation": "予算と見積もり",
        "Estimation globale du séjour": "滞在全体の概算",
        "Budget Total Estimé": "推定総予算",
        "Transports & Vols": "交通機関・フライト",
        "Hébergement": "宿泊施設",
        "Repas & Activités": "食事・アクティビティ",
        "Budget & Dépenses Réelles": "予算と実際の支出",
        "Comparatif et suivi du coût du voyage": "旅行費用の比較と追跡",
        "Réel": "実費",
        "Estimé": "見積もり",
        "Dans les clous": "予算内",
        "Aucune dépense enregistrée.": "記録された支出はありません。",
        "Dépenses partagées": "割り勘・共有費",
        "Gérez les comptes du groupe et l'équilibre des remboursements": "グループの勘定と精算を管理",
        "Participants du voyage :": "旅行の参加者：",
        "+ Ajouter": "+ 追加",
        "Partagé entre :": "対象者：",
        "Ajoutez des participants d'abord.": "まず参加者を追加してください。",
        "Ajouter la dépense": "支出を追加",
        "Aucune dépense partagée pour le moment.": "共有費はまだありません。",
        "Équilibre des comptes": "精算バランス",
        "Ajoutez des participants et des dépenses pour calculer les remboursements.": "参加者と支出を追加して精算を計算します。",
        "Check-list de voyage": "持ち物チェックリスト",
        "À ne pas oublier": "忘れ物防止",
        "Météo prévue": "天気予報",
        "Prévisions sur place": "現地の予報",
        "Chargement de la météo...": "天気を読み込み中...",
        "Liens de réservation & Partenaires": "予約リンク・パートナー",
        "Préparez votre voyage en un clic. Les dates et la destination de votre séjour sont automatiquement prises en compte.": "ワンクリックで旅行準備。日付と目的地が自動反映されます。",
        "Trouver les meilleurs vols": "最安値フライトを探す",
        "Hôtels & Hébergements": "ホテル・宿泊施設",
        "Apparts & Logements insolites": "ユニークなアパートメント",
        "Location de voiture": "レンタカー",
        "Comparer les loueurs (Kayak)": "レンタカー会社を比較",
        "Mes notes de réservation personnelles": "個人予約メモ",
        "Ajoutez ici vos numéros de vol, codes de réservation d'hôtel ou liens directs vers vos billets.": "フライト番号やホテル予約コードをここに追加します。",
        "Portefeuille Documentaire": "書類ウォレット",
        "Centralise tes billets, réservations et passeports. Ils seront accessibles ici même hors connexion (si déjà ouverts une fois).": "チケットやパスポートをオフラインで一元管理。",
        "Uploader le document": "書類をアップロード",
        "Modifier le voyage": "旅行を編集",
        "Annuler": "キャンセル",
        "Sauvegarder": "保存",
        "Carnet de route collaboratif": "共同トラベルログ",
        "Chargement de l'aventure...": "冒険をロード中...",
        "L'Itinéraire": "旅程",
        "Carte & Aperçu": "地図とプレビュー",
        "Ajoutez vos souvenirs, tout le monde en profite.": "思い出を共有しよう。",
        "Qui doit combien ?": "誰がいくら払う？",
        "Voyage planifié avec Kaido": "Kaidoで計画された旅行",
        "Créez, organisez et suivez vos propres carnets de route, budgets et itinéraires de voyage sur une application unique.": "独自の旅行ログや予算を1つのアプリで管理。",
        "Découvrir Kaido →": "Kaidoを発見 →"
    }
};

// ==========================================
// 2. LOGIQUE UNIFIÉE (Statique + IA Dynamique)
// ==========================================
window.kaidoDynamicDict = JSON.parse(localStorage.getItem('kaido_dynamic_dict') || '{}');
const TRANSLATE_ENDPOINT = '/.netlify/functions/translate-texts';

async function applyGlobalLanguage(lang) {
    localStorage.setItem('kaido_global_lang', lang);

    const selector = document.getElementById('global-lang-selector');
    if (selector) selector.value = lang;

    // Étape A : Application de la banque de mots statique instantanée
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.dataset.originalText) {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            el.dataset.originalText = isInput ? (el.placeholder || '') : el.textContent.trim();
        }

        const originalText = el.dataset.originalText;

        if (lang === 'fr') {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            if (isInput) el.placeholder = originalText;
            else el.textContent = originalText;
        } else if (staticTranslations[lang] && staticTranslations[lang][originalText]) {
            // Trouvé dans la banque statique !
            const translation = staticTranslations[lang][originalText];
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            if (isInput) el.placeholder = translation;
            else el.textContent = translation;
        }
    });

    if (lang === 'fr') return;

    if (!window.kaidoDynamicDict[lang]) {
        window.kaidoDynamicDict[lang] = {};
    }

    // Étape B : Pour les textes non présents dans la banque (générés par l'IA), on interroge l'API Netlify
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    const textsToTranslate = [];

    elementsToTranslate.forEach(el => {
        const originalText = el.dataset.originalText;
        // Si le texte n'est ni dans la banque statique ni dans le cache dynamique de l'IA
        if (originalText && (!staticTranslations[lang] || !staticTranslations[lang][originalText])) {
            if (!window.kaidoDynamicDict[lang][originalText]) {
                if (!textsToTranslate.includes(originalText)) {
                    textsToTranslate.push(originalText);
                }
            }
        }
    });

    // S'il y a des textes inédits, appel à l'IA par petits lots pour éviter le timeout 504
    if (textsToTranslate.length > 0) {
        try {
            const response = await fetch(TRANSLATE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetLang: lang,
                    texts: textsToTranslate
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.translations) {
                    Object.keys(data.translations).forEach(frText => {
                        window.kaidoDynamicDict[lang][frText] = data.translations[frText];
                    });
                    localStorage.setItem('kaido_dynamic_dict', JSON.stringify(window.kaidoDynamicDict));
                }
            }
        } catch (err) {
            console.warn("Mode hors-ligne ou erreur de traduction IA : utilisation du cache local.", err);
        }
    }

    // Étape C : Application des traductions dynamiques IA restantes
    elementsToTranslate.forEach(el => {
        const originalText = el.dataset.originalText;
        if (staticTranslations[lang] && staticTranslations[lang][originalText]) return; // Déjà fait par le statique

        const translatedText = window.kaidoDynamicDict[lang] && window.kaidoDynamicDict[lang][originalText];
        if (translatedText) {
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
            if (isInput) el.placeholder = translatedText;
            else el.textContent = translatedText;
        }
    });
}

window.changeLanguage = function(lang) {
    applyGlobalLanguage(lang);
};

// Gestion des thèmes (Sombre / Papyrus)
function applyGlobalTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('kaido_theme', theme);

    const themeBtn = document.getElementById('global-theme-toggle');
    if (themeBtn) {
        if (theme === 'papyrus') {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">🌙</span>';
            themeBtn.title = "Passer au thème sombre";
        } else {
            themeBtn.innerHTML = '<span style="font-size: 1.1rem;">☀️</span>';
            themeBtn.title = "Passer au thème papyrus";
        }
    }
}

// Initialisation globale au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('kaido_global_lang') || 'fr';
    if (savedLang !== 'fr') {
        applyGlobalLanguage(savedLang);
    }

    const savedTheme = localStorage.getItem('kaido_theme') || 'dark';
    applyGlobalTheme(savedTheme);

    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'papyrus' : 'dark';
            applyGlobalTheme(newTheme);
        });
    }
});
