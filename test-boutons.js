// test-boutons.js - Script pour tester le fonctionnement des boutons

document.addEventListener('DOMContentLoaded', function() {
    console.log("Test des boutons chargé");
    
    // PARTIE 1: VÉRIFICATION DES ÉLÉMENTS DU DOM
    
    // Vérifier si tous les éléments existent
    function verifierElements() {
        console.log("Vérification des éléments du DOM");
        
        // Liste des éléments à vérifier
        const elementsAVerifier = [
            'start-btn',
            'home-btn',
            'new-prediction-btn',
            'prev-btn',
            'next-btn',
            'nav-home',
            'nav-services',
            'nav-profile'
        ];
        
        // Vérifier chaque élément
        elementsAVerifier.forEach(id => {
            const element = document.getElementById(id);
            console.log(`Élément ${id}: ${element ? 'TROUVÉ ✅' : 'MANQUANT ❌'}`);
        });
        
        // Vérifier les boutons avec des attributs data-service
        const serviceButtons = document.querySelectorAll('[data-service]');
        console.log(`Boutons de service trouvés: ${serviceButtons.length}`);
    }
    
    // PARTIE 2: TEST DIRECT DES BOUTONS
    
    // Cliquer sur un bouton et vérifier son comportement
    function testerBouton(id, message = "") {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Bouton '${id}' non trouvé`);
            return false;
        }
        
        // Message de test
        console.log(`Test du bouton '${id}'${message ? ': ' + message : ''}`);
        
        // Simuler un clic
        try {
            // Essayer différentes approches
            if (typeof element.click === 'function') {
                element.click();
            } else if (element.onclick) {
                element.onclick();
            } else {
                // Créer un événement de clic
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(event);
            }
            console.log(`Clic sur '${id}' réussi ✅`);
            return true;
        } catch (error) {
            console.error(`Erreur lors du clic sur '${id}':`, error);
            return false;
        }
    }
    
    // PARTIE 3: DÉBOGAGE DES GESTIONNAIRES D'ÉVÉNEMENTS
    
    // Vérifier si un élément a un gestionnaire d'événements
    function verifierGestionnaires(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Élément '${id}' non trouvé`);
            return;
        }
        
        console.log(`Vérification des gestionnaires pour '${id}':`);
        console.log(`- onclick: ${element.onclick ? 'Présent ✅' : 'Absent ❌'}`);
        
        // Ajout d'un gestionnaire de secours si nécessaire
        if (!element.onclick) {
            console.log(`Ajout d'un gestionnaire de secours pour '${id}'`);
            element.onclick = function() {
                console.log(`Clic de secours sur '${id}'`);
                // Appeler la fonction appropriée selon l'ID
                if (id === 'start-btn') {
                    if (window.startQuestionnaire) {
                        window.startQuestionnaire();
                    } else if (window.navigateTo) {
                        window.navigateTo('questionnaire');
                    }
                } else if (id === 'home-btn') {
                    if (window.navigateTo) {
                        window.navigateTo('home');
                    }
                } else if (id === 'new-prediction-btn') {
                    if (window.resetQuestionnaire && window.navigateTo) {
                        window.resetQuestionnaire();
                        window.navigateTo('questionnaire');
                    }
                } else if (id === 'prev-btn') {
                    if (window.navigateToPreviousStep) {
                        window.navigateToPreviousStep();
                    }
                } else if (id === 'next-btn') {
                    if (window.navigateToNextStep) {
                        window.navigateToNextStep();
                    }
                } else if (id.startsWith('nav-')) {
                    const pageId = id.replace('nav-', '');
                    if (window.navigateTo) {
                        window.navigateTo(pageId);
                    }
                }
            };
            console.log(`Gestionnaire de secours ajouté pour '${id}' ✅`);
        }
    }
    
    // PARTIE 4: EXÉCUTION DES TESTS
    
    // Exécuter tous les tests
    function executerTests() {
        console.log("Début des tests des boutons");
        
        // Vérifier les éléments
        verifierElements();
        
        // Vérifier et ajouter les gestionnaires manquants
        const boutonsPrincipaux = [
            'start-btn',
            'home-btn',
            'new-prediction-btn',
            'prev-btn',
            'next-btn',
            'nav-home',
            'nav-services',
            'nav-profile'
        ];
        
        boutonsPrincipaux.forEach(id => {
            verifierGestionnaires(id);
        });
        
        // Vérifier les boutons de service
        document.querySelectorAll('[data-service]').forEach(btn => {
            const id = btn.id || "bouton-service-" + btn.getAttribute('data-service');
            verifierGestionnaires(id);
        });
        
        console.log("Fin des tests des boutons");
    }
    
    // Exécuter les tests après un court délai
    setTimeout(executerTests, 1000);
    
    // Exposer les fonctions de test à la console
    window.testBoutons = {
        verifierElements,
        testerBouton,
        verifierGestionnaires,
        executerTests
    };
    
    console.log("Test des boutons: vous pouvez utiliser 'window.testBoutons' pour des tests manuels dans la console");
});
