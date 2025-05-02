// questions.js - Gestion du système de questionnaire étape par étape
// Version améliorée avec design moderne et animations

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
    
    // Vérifier si les boutons existent
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    // Les gestionnaires d'événements sont maintenant définis dans index.html avec onclick
    // pour assurer la compatibilité, mais vérifions quand même
    if (prevButton && !prevButton.onclick) {
        prevButton.onclick = navigateToPreviousStep;
    }
    
    if (nextButton && !nextButton.onclick) {
        nextButton.onclick = navigateToNextStep;
    }
});

// Réinitialisation complète du questionnaire
async function resetQuestionnaire() {
    console.log("Réinitialisation du questionnaire");
    
    // Vérifier d'abord si l'utilisateur peut faire une prédiction
    let canProceed = true;
    
    if (window.telegramAuth && window.telegramAuth.isAuthenticated && window.telegramAuth.isAuthenticated()) {
        if (window.predictionLimits && window.predictionLimits.canMakePrediction) {
            const limitStatus = await window.predictionLimits.canMakePrediction(window.telegramAuth.getUserId());
            canProceed = limitStatus.allowed;
            
            if (!canProceed) {
                showLimitReachedMessage(limitStatus.message);
                return;
            }
        }
    }
    
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
}

// Afficher un message lorsque la limite est atteinte
function showLimitReachedMessage(message) {
    const container = document.getElementById('questions-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message centered" style="background-color: rgba(239, 68, 68, 0.1); padding: 25px; border-radius: 16px;">
            <div class="error-icon" style="font-size: 48px; margin-bottom: 15px;">⏱️</div>
            <h3 style="color: var(--error); margin-bottom: 10px;">Limite atteinte</h3>
            <p style="margin-bottom: 20px;">${message}</p>
            <button id="back-to-home-btn" class="btn" style="max-width: 200px; margin: 0 auto;">Retour à l'accueil</button>
        </div>
    `;
    
    // Configurer le bouton de retour
    const backButton = document.getElementById('back-to-home-btn');
    if (backButton) {
        backButton.onclick = function() {
            window.navigateTo('home');
        };
    }
    
    // Masquer les boutons de navigation
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    
    // Masquer les indicateurs d'étape
    const stepIndicators = document.getElementById('step-indicators');
    if (stepIndicators) stepIndicators.style.display = 'none';
}

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
    if (!container) return;
    
    // Préparer la transition
    container.style.opacity = 0;
    container.style.transform = 'translateY(20px)';
    
    // Mettre à jour le titre de l'étape
    const stepTitleElement = document.getElementById('step-title');
    if (stepTitleElement) {
        stepTitleElement.innerHTML = `
            ${step.icon} ${step.title}
            <div style="font-size: 16px; font-weight: 400; margin-top: 5px; color: var(--text-light);">${step.subtitle}</div>
        `;
    }
    
    // Court délai pour permettre l'animation
    setTimeout(() => {
        // Vider le contenu précédent
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
        
        // Animation d'entrée
        container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        container.style.opacity = 1;
        container.style.transform = 'translateY(0)';
        
        // Mettre à jour la barre de progression
        updateProgressBarWithAnimation();
        
        // Mettre à jour les indicateurs d'étape
        updateStepIndicators();
    }, 100);
}

// Mise à jour de la barre de progression avec animation
function updateProgressBarWithAnimation() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    const progress = (currentStep / (questionnaireSteps.length - 1)) * 100;
    
    // Animer la progression
    progressBar.style.width = `${progress}%`;
    
    // Effet de pulsation
    progressBar.style.transition = 'width 0.5s ease-out, opacity 0.3s';
    progressBar.style.opacity = 0.8;
    
    setTimeout(() => {
        progressBar.style.opacity = 1;
    }, 300);
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
        
        // Animation de sortie pour le conteneur de questions
        const container = document.getElementById('questions-container');
        if (container) {
            container.style.opacity = 0;
            container.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                currentStep--;
                loadCurrentStep();
                updateNavigationButtons();
                
                // Restaurer l'animation
                container.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    container.style.opacity = 1;
                    container.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        } else {
            currentStep--;
            loadCurrentStep();
            updateNavigationButtons();
        }
    }
}

// Navigation vers l'étape suivante ou soumission
async function navigateToNextStep() {
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
    
    // Vérifier l'authentification et les limites à la dernière étape
    if (currentStep === questionnaireSteps.length - 1) {
        // Vérifier l'authentification
        if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
            const isAuthenticated = window.telegramAuth.isAuthenticated();
            if (!isAuthenticated) {
                const container = document.getElementById('questions-container');
                if (container && window.telegramAuth.showAuthError) {
                    window.telegramAuth.showAuthError(container);
                } else {
                    showAuthError(container);
                }
                return;
            }
        }
        
        // Vérifier les limites de prédiction
        if (window.predictionLimits && window.predictionLimits.canMakePrediction) {
            const userId = window.telegramAuth ? window.telegramAuth.getUserId() : null;
            if (userId) {
                const limitStatus = await window.predictionLimits.canMakePrediction(userId);
                if (!limitStatus.allowed) {
                    showLimitReachedMessage(limitStatus.message);
                    return;
                }
            }
        }
        
        // Animation de chargement pour le bouton
        if (nextButton) {
            nextButton.classList.add('btn-loading');
            setTimeout(() => {
                nextButton.classList.remove('btn-loading');
                // Soumettre le formulaire
                submitForm();
            }, 1000);
        } else {
            // Soumettre le formulaire directement
            submitForm();
        }
    } else {
        // Animation de sortie pour le conteneur de questions
        const container = document.getElementById('questions-container');
        if (container) {
            container.style.opacity = 0;
            container.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                // Passer à l'étape suivante
                currentStep++;
                loadCurrentStep();
                updateNavigationButtons();
                
                // Restaurer l'animation
                container.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    container.style.opacity = 1;
                    container.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        } else {
            // Passer à l'étape suivante directement
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
            if (window.showError) {
                window.showError('Ce champ est obligatoire', input);
            } else {
                showError('Ce champ est obligatoire', input);
            }
            isValid = false;
        } else if (value !== '' && (isNaN(value) || parseFloat(value) < 1)) {
            if (window.showError) {
                window.showError('Entrez une cote valide (≥ 1)', input);
            } else {
                showError('Entrez une cote valide (≥ 1)', input);
            }
            isValid = false;
        }
        
        // Sauvegarder si valide
        if (value !== '') {
            userAnswers[question.id] = parseFloat(value);
        }
    });
    
    return isValid;
}

// Fonction d'erreur de secours si window.showError n'est pas disponible
function showError(message, element) {
    if (!element) return;
    
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
        errorMessage.style.opacity = 0;
        errorMessage.style.transform = 'translateY(-10px)';
        errorMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 300);
    }, 3000);
}

// Fonction d'erreur d'authentification de secours
function showAuthError(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="error-icon">⚠️</div>
            <h3>Authentification requise</h3>
            <p class="error-subtitle">Ajoutez un nom d'utilisateur dans votre profil Telegram pour accéder à l'application.</p>
        </div>
    `;
}

// Soumission du formulaire
function submitForm() {
    console.log("Soumission du formulaire avec les réponses:", userAnswers);
    
    // Vérifier si l'utilisateur est authentifié
    let isAuthenticated = false;
    
    if (window.telegramAuth && window.telegramAuth.isAuthenticated) {
        isAuthenticated = window.telegramAuth.isAuthenticated();
    }
    
    if (!isAuthenticated) {
        // Afficher un message d'erreur
        const container = document.getElementById('questions-container');
        if (container) {
            if (window.telegramAuth && window.telegramAuth.showAuthError) {
                window.telegramAuth.showAuthError(container);
            } else {
                showAuthError(container);
            }
        }
        return;
    }
    
    // Générer et afficher les résultats de la prédiction
    if (window.generatePrediction) {
        try {
            const prediction = window.generatePrediction(userAnswers);
            
            // Ajouter l'ID utilisateur pour l'enregistrement si disponible
            if (window.telegramAuth && window.telegramAuth.getUserId) {
                prediction.userId = window.telegramAuth.getUserId();
            }
            
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
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `
                <div class="toast-icon">❌</div>
                <div class="toast-content">
                    <div class="toast-title">Erreur</div>
                    <div class="toast-message">Impossible de générer la prédiction</div>
                </div>
                <div class="toast-close" onclick="this.parentNode.remove()">×</div>
            `;
            document.body.appendChild(toast);
            
            // Supprimer après 4 secondes
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.classList.add('toast-hide');
                    setTimeout(() => toast.remove(), 300);
                }
            }, 4000);
        }
    } else {
        console.error("Fonction de prédiction non disponible");
    }
}

// Exposer les fonctions au contexte global
window.resetQuestionnaire = resetQuestionnaire;
window.navigateToPreviousStep = navigateToPreviousStep;
window.navigateToNextStep = navigateToNextStep;
window.showAuthError = showAuthError;
window.showError = showError;

// Animation initiale au chargement de la page
setTimeout(() => {
    const stepIndicators = document.getElementById('step-indicators');
    if (stepIndicators) {
        stepIndicators.style.opacity = 0;
        stepIndicators.style.transform = 'translateY(20px)';
        stepIndicators.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            stepIndicators.style.opacity = 1;
            stepIndicators.style.transform = 'translateY(0)';
        }, 100);
    }
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'width 0.8s ease-in-out';
        
        setTimeout(() => {
            progressBar.style.width = '2%';
        }, 300);
    }
}, 500);
