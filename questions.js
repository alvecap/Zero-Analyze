// questions.js - Gestion du système de questionnaire étape par étape

// Configuration des étapes du questionnaire
const questionnaireSteps = [
    {
        id: 'step1',
        title: 'Cotes 1N2 (temps réglementaire)',
        questions: [
            {
                id: 'home-win',
                label: 'Cote pour la victoire de l\'équipe à domicile',
                legend: 'Entrer la cote affichée',
                type: 'number',
                required: true
            },
            {
                id: 'draw',
                label: 'Cote pour un match nul',
                legend: 'Entrer la cote affichée',
                type: 'number',
                required: true
            },
            {
                id: 'away-win',
                label: 'Cote pour la victoire de l\'équipe à l\'extérieur',
                legend: 'Entrer la cote affichée',
                type: 'number',
                required: true
            }
        ]
    },
    {
        id: 'step2',
        title: 'Première mi-temps',
        questions: [
            {
                id: 'ht-home-win',
                label: 'Cote pour la victoire de l\'équipe à domicile en première mi-temps',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'ht-draw',
                label: 'Cote pour un match nul à la mi-temps',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'ht-away-win',
                label: 'Cote pour la victoire de l\'équipe à l\'extérieur en première mi-temps',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'ht-btts',
                label: 'Cote pour que chaque équipe marque au moins un but en première mi-temps',
                legend: 'Une par équipe',
                type: 'number',
                required: true
            }
        ]
    },
    {
        id: 'step3',
        title: 'Deuxième mi-temps',
        questions: [
            {
                id: 'ft-home-goal',
                label: 'Cote pour que l\'équipe à domicile marque au moins un but en deuxième mi-temps',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'ft-away-goal',
                label: 'Cote pour que l\'équipe à l\'extérieur marque au moins un but en deuxième mi-temps',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'ft-over-1-5',
                label: 'Cote pour plus de 1,5 but en deuxième mi-temps',
                legend: 'Entrer la cote s\'il y a',
                type: 'number',
                required: true
            }
        ]
    },
    {
        id: 'step4',
        title: 'Les deux équipes marquent',
        questions: [
            {
                id: 'btts-yes',
                label: 'Cote pour "Les deux équipes marquent – Oui"',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'btts-no',
                label: 'Cote pour "Les deux équipes marquent – Non"',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            }
        ]
    },
    {
        id: 'step5',
        title: 'Handicap',
        questions: [
            {
                id: 'home-handicap-minus1',
                label: 'Cote pour l\'équipe à domicile avec un handicap de -1 but',
                legend: 'Entrer la cote si disponible',
                type: 'number',
                required: false
            },
            {
                id: 'home-handicap-plus1',
                label: 'Cote pour l\'équipe à domicile avec un handicap de +1 but',
                legend: 'Entrer la cote si disponible',
                type: 'number',
                required: false
            },
            {
                id: 'away-handicap-minus1',
                label: 'Cote pour l\'équipe à l\'extérieur avec un handicap de -1 but',
                legend: 'Entrer la cote si disponible',
                type: 'number',
                required: false
            },
            {
                id: 'away-handicap-plus1',
                label: 'Cote pour l\'équipe à l\'extérieur avec un handicap de +1 but',
                legend: 'Entrer la cote si disponible',
                type: 'number',
                required: false
            }
        ],
        specialMessage: 'Option non disponible ? Laissez vide. Cela sera pris en compte dans l\'analyse.'
    },
    {
        id: 'step6',
        title: 'Total de buts',
        questions: [
            {
                id: 'home-over-0-5',
                label: 'Cote pour que l\'équipe à domicile marque plus de 0,5 but',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'home-over-1-5',
                label: 'Cote pour que l\'équipe à domicile marque plus de 1,5 but',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'away-over-0-5',
                label: 'Cote pour que l\'équipe à l\'extérieur marque plus de 0,5 but',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'away-over-1-5',
                label: 'Cote pour que l\'équipe à l\'extérieur marque plus de 1,5 but',
                legend: 'Entrer la cote',
                type: 'number',
                required: true
            },
            {
                id: 'total-over-2-5',
                label: 'Cote pour plus de 2,5 buts dans le match',
                legend: 'Entrer la cote totale',
                type: 'number',
                required: true
            }
        ]
    }
];

// Variables globales
let currentStep = 0;
let userAnswers = {};

// Initialisation du questionnaire
document.addEventListener('DOMContentLoaded', function() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    // Événements des boutons
    prevButton.addEventListener('click', navigateToPreviousStep);
    nextButton.addEventListener('click', navigateToNextStep);
    
    // Réinitialisation du questionnaire au démarrage
    resetQuestionnaire();
});

// Réinitialisation complète du questionnaire
function resetQuestionnaire() {
    // Réinitialiser les variables
    currentStep = 0;
    userAnswers = {};
    
    // Générer les indicateurs de progression
    generateStepIndicators();
    
    // Charger la première étape
    loadCurrentStep();
    
    // Mettre à jour les boutons
    updateNavigationButtons();
}

// Générer les indicateurs d'étapes
function generateStepIndicators() {
    const container = document.querySelector('.step-indicators');
    container.innerHTML = '';
    
    questionnaireSteps.forEach((step, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        if (index === 0) indicator.classList.add('active');
        container.appendChild(indicator);
    });
}

// Chargement de l'étape actuelle
function loadCurrentStep() {
    // Obtenir l'étape actuelle
    const step = questionnaireSteps[currentStep];
    const container = document.getElementById('questions-container');
    
    // Vider le contenu précédent
    container.innerHTML = '';
    
    // Ajouter le titre de l'étape
    const title = document.createElement('h2');
    title.textContent = step.title;
    container.appendChild(title);
    
    // Créer le groupe de questions
    const questionGroup = document.createElement('div');
    questionGroup.className = 'question-group';
    container.appendChild(questionGroup);
    
    // Ajouter les questions
    step.questions.forEach(question => {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        const label = document.createElement('label');
        label.className = 'question-label';
        label.htmlFor = question.id;
        label.textContent = question.label;
        inputContainer.appendChild(label);
        
        const legend = document.createElement('div');
        legend.className = 'question-legend';
        legend.textContent = question.legend;
        inputContainer.appendChild(legend);
        
        const input = document.createElement('input');
        input.type = question.type;
        input.id = question.id;
        input.name = question.id;
        input.step = '0.01';
        input.min = '1';
        
        // Restaurer la valeur si déjà répondue
        if (userAnswers[question.id]) {
            input.value = userAnswers[question.id];
        }
        
        inputContainer.appendChild(input);
        questionGroup.appendChild(inputContainer);
    });
    
    // Ajouter un message spécial si nécessaire (pour l'étape du handicap)
    if (step.specialMessage) {
        const specialMessage = document.createElement('div');
        specialMessage.className = 'question-legend centered mt-2';
        specialMessage.textContent = step.specialMessage;
        container.appendChild(specialMessage);
    }
    
    // Mettre à jour la barre de progression
    updateProgressBar();
    
    // Mettre à jour les indicateurs d'étape
    updateStepIndicators();
}

// Mise à jour de la barre de progression
function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progress = (currentStep / (questionnaireSteps.length - 1)) * 100;
    progressFill.style.width = `${progress}%`;
}

// Mise à jour des indicateurs d'étape
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === currentStep) {
            indicator.classList.add('active');
        }
    });
}

// Mise à jour des boutons de navigation
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    // Bouton précédent
    if (currentStep === 0) {
        prevButton.style.visibility = 'hidden';
    } else {
        prevButton.style.visibility = 'visible';
    }
    
    // Bouton suivant
    if (currentStep === questionnaireSteps.length - 1) {
        nextButton.textContent = 'Obtenir la prédiction';
    } else {
        nextButton.textContent = 'Suivant';
    }
}

// Navigation vers l'étape précédente
function navigateToPreviousStep() {
    if (currentStep > 0) {
        currentStep--;
        loadCurrentStep();
        updateNavigationButtons();
    }
}

// Navigation vers l'étape suivante ou soumission
function navigateToNextStep() {
    // Sauvegarder les réponses de l'étape actuelle
    if (!saveCurrentStepAnswers()) {
        return; // Validation échouée
    }
    
    // Vérifier si c'est la dernière étape
    if (currentStep === questionnaireSteps.length - 1) {
        // Soumettre le formulaire
        submitForm();
    } else {
        // Passer à l'étape suivante
        currentStep++;
        loadCurrentStep();
        updateNavigationButtons();
    }
}

// Sauvegarder les réponses de l'étape actuelle
function saveCurrentStepAnswers() {
    const step = questionnaireSteps[currentStep];
    let isValid = true;
    
    // Vérifier et sauvegarder chaque réponse
    step.questions.forEach(question => {
        const input = document.getElementById(question.id);
        const value = input.value.trim();
        
        // Validation
        if (question.required && value === '') {
            window.zeroAnalyzeApp.showError('Ce champ est obligatoire', input);
            isValid = false;
        } else if (value !== '' && (isNaN(value) || parseFloat(value) < 1)) {
            window.zeroAnalyzeApp.showError('Entrez une cote valide (≥ 1)', input);
            isValid = false;
        }
        
        // Sauvegarder si valide
        if (value !== '') {
            userAnswers[question.id] = parseFloat(value);
        }
    });
    
    return isValid;
}

// Soumission du formulaire
function submitForm() {
    // Envoyer les données au modèle de prédiction
    const prediction = generatePrediction(userAnswers);
    
    // Afficher les résultats
    window.zeroAnalyzeApp.showResults(prediction);
}

// Fonction globale
window.resetQuestionnaire = resetQuestionnaire;
