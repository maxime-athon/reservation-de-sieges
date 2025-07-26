document.addEventListener('DOMContentLoaded', () => {

    // --- Éléments du DOM ---
    const steps = document.querySelectorAll('.step');
    const step1 = document.getElementById('step1-selection-film');
    const step2 = document.getElementById('step2-selection-sieges');
    const step3 = document.getElementById('step3-paiement');
    const step4 = document.getElementById('step4-confirmation');

    const filmSelect = document.getElementById('film');
    const dateInput = document.getElementById('date');
    const planSieges = document.getElementById('plan-sieges');
    const nombreSiegesSpan = document.getElementById('nombre-sieges');
    const prixTotalSpan = document.getElementById('prix-total');
    const listeSiegesSpan = document.getElementById('liste-sieges-selectionnes');
    const titreFilmSieges = document.getElementById('titre-film-sieges');

    // Boutons de navigation
    const btnVersSieges = document.getElementById('btn-vers-sieges');
    const btnRetourFilm = document.getElementById('btn-retour-film');
    const btnVersPaiement = document.getElementById('btn-vers-paiement');
    const formPaiement = document.getElementById('form-paiement');
    const btnNouvelleReservation = document.getElementById('btn-nouvelle-reservation');

    // Données de l'état de l'application
    let prixDuFilm = +filmSelect.value;
    let siegesSelectionnes = [];

    const NOMBRE_RANGEES = 6;
    const SIEGES_PAR_RANGEE = 8;

    // --- Fonctions ---

    /**
     * Affiche l'étape spécifiée et cache les autres
     * @param {number} numeroEtape - Le numéro de l'étape à afficher (1-4)
     */
    function afficherEtape(numeroEtape) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === numeroEtape);
        });
    }

    /**
     * Génère le plan des sièges de manière dynamique
     */
    function genererPlanSieges() {
        planSieges.innerHTML = ''; // Vide le plan précédent
        const siegesOccupes = chargerSiegesOccupes();

        for (let i = 0; i < NOMBRE_RANGEES; i++) {
            const rangee = String.fromCharCode(65 + i); // A, B, C...
            for (let j = 1; j <= SIEGES_PAR_RANGEE; j++) {
                const numeroSiege = `${rangee}${j}`;
                const siege = document.createElement('div');
                siege.classList.add('siege');
                siege.dataset.siege = numeroSiege;

                if (siegesOccupes.includes(numeroSiege)) {
                    siege.classList.add('occupe');
                }

                planSieges.appendChild(siege);
            }
        }
    }

    /**
     * Met à jour le récapitulatif (nombre de sièges, prix total, liste)
     */
    function mettreAJourRecapitulatif() {
        // Met à jour la liste des sièges sélectionnés
        siegesSelectionnes = Array
            .from(document.querySelectorAll('.siege.selectionne'))
            .map(s => s.dataset.siege);

        const nombreSieges = siegesSelectionnes.length;
        const prixTotal = nombreSieges * prixDuFilm;

        nombreSiegesSpan.textContent = nombreSieges;
        prixTotalSpan.textContent = prixTotal.toFixed(2);
        listeSiegesSpan.textContent = siegesSelectionnes.length > 0 ? siegesSelectionnes.join(', ') : 'Aucun';

        // Active ou désactive le bouton de paiement
        btnVersPaiement.disabled = nombreSieges === 0;
    }

    /**
     * Gère le clic sur un siège
     * @param {Event} e - L'événement de clic
     */
    function gererClicSiege(e) {
        const siegeClique = e.target;
        if (siegeClique.classList.contains('siege') && !siegeClique.classList.contains('occupe')) {
            siegeClique.classList.toggle('selectionne');
            mettreAJourRecapitulatif();
        }
    }
    
    /**
     * Sauvegarde les sièges occupés dans le localStorage
     * @param {string[]} siegesReserves - La liste des sièges à marquer comme occupés
     */
    function sauvegarderSiegesOccupes(siegesReserves) {
        const film = filmSelect.options[filmSelect.selectedIndex].text;
        const date = dateInput.value;
        const cle = `reservations_${film}_${date}`;
        
        const siegesDejaOccupes = chargerSiegesOccupes();
        const nouveauxSiegesOccupes = [...new Set([...siegesDejaOccupes, ...siegesReserves])]; // Union sans doublons
        
        localStorage.setItem(cle, JSON.stringify(nouveauxSiegesOccupes));
    }

    /**
     * Charge les sièges occupés depuis le localStorage pour le film et la date actuels
     * @returns {string[]} - La liste des sièges déjà occupés
     */
    function chargerSiegesOccupes() {
        const film = filmSelect.options[filmSelect.selectedIndex].text;
        const date = dateInput.value;
        const cle = `reservations_${film}_${date}`;
        const siegesOccupes = JSON.parse(localStorage.getItem(cle));
        return siegesOccupes || [];
    }
    
    /**
     * Remplit les détails de la confirmation
     */
    function remplirConfirmation() {
        const filmOption = filmSelect.options[filmSelect.selectedIndex];
        document.getElementById('film-confirm').textContent = filmOption.text.split(' (')[0];
        document.getElementById('date-confirm').textContent = new Date(dateInput.value).toLocaleDateString('fr-FR');
        document.getElementById('sieges-confirm').textContent = siegesSelectionnes.join(', ');
        document.getElementById('total-confirm').textContent = (siegesSelectionnes.length * prixDuFilm).toFixed(2);
        document.getElementById('email-confirmation').textContent = document.getElementById('email').value;
    }


    // --- Écouteurs d'Événements ---

    // Changement du film sélectionné
    filmSelect.addEventListener('change', (e) => {
        prixDuFilm = +e.target.value;
        // Si on change de film à l'étape 2, il faut regénérer les sièges
        if(step2.classList.contains('active')) {
            genererPlanSieges();
            mettreAJourRecapitulatif();
        }
    });
    
    // Changement de la date
    dateInput.addEventListener('change', () => {
        // Si on change de date à l'étape 2, il faut regénérer les sièges
        if(step2.classList.contains('active')) {
            genererPlanSieges();
            mettreAJourRecapitulatif();
        }
    });

    // Clic pour passer de la sélection du film aux sièges
    btnVersSieges.addEventListener('click', () => {
        if (!dateInput.value) {
            alert('Veuillez choisir une date !');
            return;
        }
        titreFilmSieges.textContent = `Sélectionnez vos places pour ${filmSelect.options[filmSelect.selectedIndex].text.split(' (')[0]}`;
        genererPlanSieges();
        mettreAJourRecapitulatif(); // Initialise le récapitulatif
        afficherEtape(2);
    });

    // Clic sur le plan des sièges (délégation d'événement)
    planSieges.addEventListener('click', gererClicSiege);

    // Clic pour retourner à la sélection du film
    btnRetourFilm.addEventListener('click', () => {
        afficherEtape(1);
    });

    // Clic pour passer au paiement
    btnVersPaiement.addEventListener('click', () => {
        afficherEtape(3);
    });

    // Soumission du formulaire de paiement
    formPaiement.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
        sauvegarderSiegesOccupes(siegesSelectionnes);
        remplirConfirmation();
        afficherEtape(4);
    });
    
    // Clic pour faire une nouvelle réservation
    btnNouvelleReservation.addEventListener('click', () => {
        // Réinitialisation de l'état
        siegesSelectionnes = [];
        formPaiement.reset();
        afficherEtape(1);
    });

    // --- Initialisation ---
    dateInput.min = new Date().toISOString().split("T")[0]; // Empêche de choisir une date passée
    afficherEtape(1); // Affiche la première étape au chargement
});