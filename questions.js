// questions.js - Gestion du système de questionnaire étape par étape
// Version améliorée avec correction des problèmes de chargement

// Configuration des étapes du questionnaire
const questionnaireSteps = [
    {
        id: 'step1',
        title: 'Cotes 1N2 (temps réglementaire)',
        subtitle: 'Ces cotes représentent les probabilités des trois résultats possibles à la fin du match',
        icon: '🏆',
        questions: [
            {
                id: 'home-win',
                label: 'Cote pour la victoire à domicile',
                legend: 'Équipe jouant à domicile',
                type: 'number',
                required: true,
                icon: '🏠'
            },
            {
                id: 'draw',
                label: 'Cote pour un match nul',
                legend: 'Résultat d\'égalité',
                type: 'number',
                required: true,
                icon: '⚖️'
            },
            {
                id: 'away-win',
                label: 'Cote pour la victoire à l\'extérieur',
                legend: 'Équipe jouant à l\'extérieur',
                type: 'number',
                required: true,
                icon: '✈️'
            }
        ]
    },
    {
        id: 'step2',
        title: 'Première mi-temps',
        subtitle: 'Ces cotes concernent uniquement le résultat à la fin de la première mi-temps',
        icon: '⏱️',
        questions: [
            {
                id: 'ht-home-win',
                label: 'Cote pour la victoire à domicile en 1ère mi-temps',
                legend: 'Équipe jouant à domicile',
                type: 'number',
                required: true,
                icon: '🏠'
            },
            {
                id: 'ht-draw',
                label: 'Cote pour un match nul à la mi-temps',
                legend: 'Résultat d\'égalité',
                type: 'number',
                required: true,
                icon: '⚖️'
            },
            {
                id: 'ht-away-win',
                label: 'Cote pour la victoire à l\'extérieur en 1ère mi-temps',
                legend: 'Équipe jouant à l\'extérieur',
                type: 'number',
                required: true,
                icon: '✈️'
            },
            {
                id: 'ht-btts',
                label: 'Cote pour que les deux équipes marquent en 1ère mi-temps',
                legend: 'Au moins un but par équipe',
                type: 'number',
                required: true,
                icon: '⚽'
            }
        ]
    },
    {
        id: 'step3',
        title: 'Deuxième mi-temps',
        subtitle: 'Ces cotes concernent uniquement les événements de la seconde période',
        icon: '⌛',
        questions: [
            {
                id: 'ft-home-goal',
                label: 'Cote pour un but à domicile en 2ème mi-temps',
                legend: 'Au moins un but',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'ft-away-goal',
                label: 'Cote pour un but à l\'extérieur en 2ème mi-temps',
                legend: 'Au moins un but',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'ft-over-1-5',
                label: 'Cote pour plus de 1,5 but en 2ème mi-temps',
                legend: 'Au moins 2 buts',
                type: 'number',
                required: true,
                icon: '🔢'
            }
        ]
    },
    {
        id: 'step4',
        title: 'Les deux équipes marquent',
        subtitle: 'Est-ce que chaque équipe marquera au moins un but dans le match ?',
        icon: '⚽',
        questions: [
            {
                id: 'btts-yes',
                label: 'Cote pour "Les deux équipes marquent – Oui"',
                legend: 'Au moins un but pour chaque équipe',
                type: 'number',
                required: true,
                icon: '✅'
            },
            {
                id: 'btts-no',
                label: 'Cote pour "Les deux équipes marquent – Non"',
                legend: 'Au moins une équipe ne marque pas',
                type: 'number',
                required: true,
                icon: '❌'
            }
        ]
    },
    {
        id: 'step5',
        title: 'Handicap',
        subtitle: 'Cotes avec avantage ou désavantage d\'un but pour une équipe',
        icon: '🧮',
        questions: [
            {
                id: 'home-handicap-minus1',
                label: 'Domicile avec handicap -1 but',
                legend: 'Victoire avec au moins 2 buts d\'écart',
                type: 'number',
                required: false,
                icon: '➖'
            },
            {
                id: 'home-handicap-plus1',
                label: 'Domicile avec handicap +1 but',
                legend: 'Victoire, nul ou défaite par 1 but',
                type: 'number',
                required: false,
                icon: '➕'
            },
            {
                id: 'away-handicap-minus1',
                label: 'Extérieur avec handicap -1 but',
                legend: 'Victoire avec au moins 2 buts d\'écart',
                type: 'number',
                required: false,
                icon: '➖'
            },
            {
                id: 'away-handicap-plus1',
                label: 'Extérieur avec handicap +1 but',
                legend: 'Victoire, nul ou défaite par 1 but',
                type: 'number',
                required: false,
                icon: '➕'
            }
        ],
        specialMessage: 'Option non disponible ? Laissez vide. Cela sera pris en compte dans l\'analyse.'
    },
    {
        id: 'step6',
        title: 'Total de buts',
        subtitle: 'Cotes concernant le nombre de buts marqués dans le match',
        icon: '🔢',
        questions: [
            {
                id: 'home-over-0-5',
                label: 'Domicile marque plus de 0,5 but',
                legend: 'Au moins 1 but',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'home-over-1-5',
                label: 'Domicile marque plus de 1,5 but',
                legend: 'Au moins 2 buts',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'away-over-0-5',
                label: 'Extérieur marque plus de 0,5 but',
                legend: 'Au moins 1 but',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'away-over-1-5',
                label: 'Extérieur marque plus de 1,5 but',
                legend: 'Au moins 2 buts',
                type: 'number',
                required: true,
                icon: '🥅'
            },
            {
                id: 'total-over-2-5',
                label: 'Plus de 2,5 buts dans le match',
                legend: 'Au moins 3 buts au total',
                type: 'number',
                required: true,
                icon: '🔢'
            }
        ]
    }
];

// Variables globales
let currentStep = 0;
let userAnswers = {};
let stepsCompleted = [];

// Initialisation du questionnaire au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Questionnaire initialisé");
    
    // Générer les indicateurs d'étape
    generateStepIndicators();
    
    // Vérifier si les boutons existent
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    // Ajouter des gestionnaires d'événements
    if (prevButton && !prevButton.onclick) {
        prevButton.onclick = navigateToPreviousStep;
    }
    
    if (nextButton && !nextButton.onclick) {
        nextButton.onclick = navigateToNextStep;
    }
    
    // Ajouter un gestionnaire pour le bouton de démarrage si on est sur la page d'accueil
    const startButton = document.getElementById('start-btn');
    if (startButton && !startButton.onclick) {
        startButton.onclick = function() {
            window.startQuestionnaire();
        };
    }
});

// Réinitialisation complète du questionnaire et démarrage
window.resetQuestionnaire = function() {
    console.log("Réinitialisation du questionnaire");
    
    // Réinitialiser les variables
    currentStep = 0;
    userAnswers = {};
    stepsCompleted = [];
    
    // Générer les indicateurs de progression
    generateStepIndicators();
    
    // Charger la première étape
    loadCurrentStep();
    
    // Mettre à jour les boutons
    updateNavigationButtons();
    
    // Animation de la barre de progression
    updateProgressBarWithAnimation();
    
    return true; // Indiquer que l'initialisation a réussi
};

// Fonction améliorée pour le bouton "Commencer"
window.startQuestionnaire = function() {
    console.log("Démarrage du questionnaire");
    
    // Ajouter une animation au bouton
    const startButton = document.getElementById('start-btn');
    if (startButton) {
        startButton.classList.add('btn-loadingstartButton.disabled = true; // Désactiver pour éviter les doubles clics
        
        // Masquer immédiatement le texte du bouton pour montrer l'animation
        startButton.innerHTML = '';
        startButton.classList.add('btn-loading');
        
        // Définir la navigation avec un délai minimal
        setTimeout(() => {
            // Réactiver le bouton et restaurer le texte
            startButton.classList.remove('btn-loading');
            startButton.innerHTML = 'Commencer';
            startButton.disabled = false;
            
            // Réinitialiser le questionnaire
            window.resetQuestionnaire();
            
            // Naviguer vers la page du questionnaire
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('questionnaire');
            } else {
                // Fallback si la fonction navigateTo n'est pas disponible
                const pages = document.querySelectorAll('.page');
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                const questionnairePage = document.getElementById('questionnaire');
                if (questionnairePage) {
                    questionnairePage.classList.add('active');
                }
            }
        }, 300);
    }
};

// Générer les indicateurs d'étapes
function generateStepIndicators() {
    const container = document.getElementById('step-indicators');
    if (!container) return;
    
    container.innerHTML = '';
    
    questionnaireSteps.forEach((step, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'step';
        if (index === 0) indicator.classList.add('active');
        if (stepsCompleted.includes(index)) indicator.classList.add('completed');
        container.appendChild(indicator);
    });
}

// Chargement de l'étape actuelle avec animation
function loadCurrentStep() {
    // Obtenir l'étape actuelle
    const step = questionnaireSteps[currentStep];
    const container = document.getElementById('questions-container');
    if (!container || !step) {
        console.error("Conteneur de questions ou étape non trouvé");
        return;
    }
    
    // Mettre à jour le titre de l'étape
    const stepTitleElement = document.getElementById('step-title');
    if (stepTitleElement) {
        stepTitleElement.innerHTML = `
            ${step.icon} ${step.title}
            <div style="font-size: 16px; font-weight: 400; margin-top: 5px; color: var(--text-light);">${step.subtitle}</div>
        `;
    }
    
    // Vider le contenu précédent et afficher directement le nouveau
    container.innerHTML = '';
    
    // Créer un wrapper pour toutes les questions
    const questionsWrapper = document.createElement('div');
    
    // Ajouter les questions
    step.questions.forEach((question, qIndex) => {
        const questionGroup = document.createElement('div');
        questionGroup.className = 'question-group';
        questionGroup.style.animationDelay = `${qIndex * 0.1}s`;
        
        const labelContainer = document.createElement('div');
        labelContainer.style.display = 'flex';
        labelContainer.style.alignItems = 'center';
        labelContainer.style.marginBottom = '10px';
        
        const iconSpan = document.createElement('span');
        iconSpan.textContent = question.icon;
        iconSpan.style.marginRight = '10px';
        iconSpan.style.fontSize = '20px';
        
        const label = document.createElement('label');
        label.className = 'question-label';
        label.htmlFor = question.id;
        label.textContent = question.label;
        
        labelContainer.appendChild(iconSpan);
        labelContainer.appendChild(label);
        
        const hint = document.createElement('div');
        hint.className = 'question-hint';
        hint.textContent = question.legend;
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        
        const input = document.createElement('input');
        input.type = question.type;
        input.id = question.id;
        input.name = question.id;
        input.step = '0.01';
        input.min = '1';
        input.required = question.required;
        input.placeholder = 'Entrez la cote...';
        
        const inputIcon = document.createElement('div');
        inputIcon.className = 'input-icon';
        inputIcon.textContent = '🔢';
        
        // Restaurer la valeur si déjà répondue
        if (userAnswers[question.id]) {
            input.value = userAnswers[question.id];
        }
        
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(inputIcon);
        
        questionGroup.appendChild(labelContainer);
        questionGroup.appendChild(hint);
        questionGroup.appendChild(inputWrapper);
        questionsWrapper.appendChild(questionGroup);
    });
    
    container.appendChild(questionsWrapper);
    
    // Ajouter un message spécial si nécessaire
    if (step.specialMessage) {
        const specialMessage = document.createElement('div');
        specialMessage.className = 'centered';
        specialMessage.style.fontSize = '14px';
        specialMessage.style.color = 'var(--text-light)';
        specialMessage.style.margin = '15px 0';
        specialMessage.style.padding = '10px';
        specialMessage.style.borderRadius = 'var(--border-radius)';
        specialMessage.style.background = 'rgba(245, 158, 11, 0.1)';
        specialMessage.style.border = '1px solid rgba(245, 158, 11, 0.2)';
        specialMessage.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 8px; font-size: 18px;">ℹ️</span>
                <span>${step.specialMessage}</span>
            </div>
        `;
        container.appendChild(specialMessage);
    }
    
    // Mettre à jour la barre de progression
    updateProgressBarWithAnimation();
    
    // Mettre à jour les indicateurs d'étape
    updateStepIndicators();
}

// Mise à jour de la barre de progression avec animation
function updateProgressBarWithAnimation() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    const progress = (currentStep / (questionnaireSteps.length - 1)) * 100;
    
    // Animer la progression
    progressBar.style.width = `${progress}%`;
}

// Mise à jour des indicateurs d'étape
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentStep);
        indicator.classList.toggle('completed', stepsCompleted.includes(index));
    });
}

// Mise à jour des boutons de navigation
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    if (!prevButton || !nextButton) return;
    
    // Bouton précédent
    if (currentStep === 0) {
        prevButton.style.visibility = 'hidden';
        prevButton.style.opacity = 0.3;
        prevButton.style.cursor = 'not-allowed';
    } else {
        prevButton.style.visibility = 'visible';
        prevButton.style.opacity = 1;
        prevButton.style.cursor = 'pointer';
    }
    
    // Bouton suivant
    if (currentStep === questionnaireSteps.length - 1) {
        nextButton.innerHTML = `
            <span style="margin-right: 8px;">🎯</span>
            <span>Obtenir la prédiction</span>
        `;
    } else {
        nextButton.innerHTML = `
            <span>Suivant</span>
            <span style="margin-left: 8px;">→</span>
        `;
    }
}

// Navigation vers l'étape précédente
function navigateToPreviousStep() {
    if (currentStep > 0) {
        // Ajouter une animation au bouton
        const prevButton = document.getElementById('prev-btn');
        if (prevButton) {
            prevButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                prevButton.style.transform = 'scale(1)';
            }, 100);
        }
        
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
    
    // Ajouter l'étape actuelle aux étapes complétées
    if (!stepsCompleted.includes(currentStep)) {
        stepsCompleted.push(currentStep);
    }
    
    // Ajouter une animation au bouton
    const nextButton = document.getElementById('next-btn');
    if (nextButton) {
        nextButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            nextButton.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Dernière étape : soumettre le formulaire
    if (currentStep === questionnaireSteps.length - 1) {
        if (nextButton) {
            nextButton.classList.add('btn-loading');
            setTimeout(() => {
                nextButton.classList.remove('btn-loading');
                // Soumettre le formulaire
                submitForm();
            }, 500);
        } else {
            // Soumettre le formulaire directement
            submitForm();
        }
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
        if (!input) return;
        
        const value = input.value.trim();
        
        // Validation
        if (question.required && value === '') {
            showError('Ce champ est obligatoire', input);
            isValid = false;
        } else if (value !== '' && (isNaN(value) || parseFloat(value) < 1)) {
            showError('Entrez une cote valide (≥ 1)', input);
            isValid = false;
        }
        
        // Sauvegarder si valide
        if (value !== '') {
            userAnswers[question.id] = parseFloat(value);
        }
    });
    
    return isValid;
}

// Afficher un message d'erreur
function showError(message, element) {
    if (!element) return;
    
    // Supprimer toute erreur existante
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Créer le message d'erreur
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">⚠️</span>
            <span>${message}</span>
        </div>
    `;
    
    // Ajouter la classe d'erreur à l'élément
    element.classList.add('input-error');
    
    // Ajouter le message après l'élément
    element.parentNode.appendChild(errorMessage);
    
    // Supprimer après un délai
    setTimeout(function() {
        element.classList.remove('input-error');
        if (errorMessage.parentNode) {
            errorMessage.remove();
        }
    }, 3000);
}

// Soumission du formulaire
function submitForm() {
    console.log("Soumission du formulaire avec les réponses:", userAnswers);
    
    // Générer et afficher les résultats de la prédiction
    if (window.generatePrediction) {
        try {
            const prediction = window.generatePrediction(userAnswers);
            
            // Afficher les résultats via l'API globale
            if (window.showResults) {
                window.showResults(prediction);
            } else {
                // Fallback: naviguer directement vers la page de résultats
                if (window.navigateTo) {
                    window.navigateTo('results');
                }
            }
        } catch (error) {
            console.error("Erreur lors de la génération de la prédiction:", error);
            // Afficher une erreur
            showToast("Erreur", "Impossible de générer la prédiction", "❌");
        }
    } else {
        console.error("Fonction de prédiction non disponible");
        showToast("Erreur", "Fonction de prédiction non disponible", "❌");
    }
}

// Fonction pour afficher un toast de notification
function showToast(title, message, icon) {
    // Vérifier si window.showToast existe déjà
    if (typeof window.showToast === 'function') {
        window.showToast(title, message, icon);
        return;
    }
    
    // Supprimer le toast existant s'il y en a un
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Créer un nouveau toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close" onclick="this.parentNode.remove()">×</div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(toast);
    
    // Supprimer automatiquement après 4 secondes
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Exposer les fonctions au contexte global
window.navigateToPreviousStep = navigateToPreviousStep;
window.navigateToNextStep = navigateToNextStep;
window.showError = showError;

// Exécuter la réinitialisation au chargement si on est sur la page du questionnaire
if (document.getElementById('questionnaire').classList.contains('active')) {
    setTimeout(() => {
        window.resetQuestionnaire();
    }, 100);
}
