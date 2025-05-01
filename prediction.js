// prediction.js - Algorithme de prédiction et génération de résultats

/**
 * Génère une prédiction à partir des cotes saisies par l'utilisateur
 * @param {Object} answers - Les réponses/cotes de l'utilisateur
 * @returns {Object} La prédiction générée
 */
function generatePrediction(answers) {
    // Initialiser l'objet de prédiction
    const prediction = {
        scoreExact1: '0-0',
        scoreExact2: '1-1',
        matchResult: 'Match nul',
        goalsPrediction: 'Moins de 3,5 buts'
    };
    
    // Analyser les cotes pour déterminer le favori et les tendances
    const favoriteAnalysis = analyzeFavorite(answers);
    const goalsAnalysis = analyzeGoals(answers);
    const bttsAnalysis = analyzeBTTS(answers);
    
    // Générer les scores exacts
    const scores = generateScores(favoriteAnalysis, goalsAnalysis, bttsAnalysis, answers);
    prediction.scoreExact1 = scores.score1;
    prediction.scoreExact2 = scores.score2;
    
    // Déterminer le résultat du match (victoire simple ou double chance)
    prediction.matchResult = determineMatchResult(favoriteAnalysis);
    
    // Déterminer la prédiction du nombre de buts
    prediction.goalsPrediction = determineGoalsPrediction(scores);
    
    return prediction;
}

/**
 * Analyse pour déterminer l'équipe favorite
 */
function analyzeFavorite(answers) {
    const homeWinOdds = answers['home-win'] || 0;
    const drawOdds = answers['draw'] || 0;
    const awayWinOdds = answers['away-win'] || 0;
    
    // Plus la cote est basse, plus l'équipe est favorite
    let favorite = 'draw';
    let favoriteOdds = drawOdds;
    
    if (homeWinOdds > 0 && homeWinOdds < favoriteOdds) {
        favorite = 'home';
        favoriteOdds = homeWinOdds;
    }
    
    if (awayWinOdds > 0 && awayWinOdds < favoriteOdds) {
        favorite = 'away';
        favoriteOdds = awayWinOdds;
    }
    
    // Calculer les différences de cotes pour estimer la force relative
    const homeAwayDiff = Math.abs(homeWinOdds - awayWinOdds);
    const homeDrawDiff = Math.abs(homeWinOdds - drawOdds);
    const awayDrawDiff = Math.abs(awayWinOdds - drawOdds);
    
    return {
        favorite,
        favoriteOdds,
        isStrongFavorite: favoriteOdds < 1.8,
        homeAwayDiff,
        homeDrawDiff,
        awayDrawDiff
    };
}

/**
 * Analyse des tendances de buts
 */
function analyzeGoals(answers) {
    // Analyser les cotes sur le nombre de buts
    const homeOver05 = answers['home-over-0-5'] || 0;
    const homeOver15 = answers['home-over-1-5'] || 0;
    const awayOver05 = answers['away-over-0-5'] || 0;
    const awayOver15 = answers['away-over-1-5'] || 0;
    const totalOver25 = answers['total-over-2-5'] || 0;
    
    // Plus la cote est basse, plus la probabilité est élevée
    const homeScore = homeOver05 && homeOver15 ? (2.5 - (homeOver05 / homeOver15) / 2) : 1;
    const awayScore = awayOver05 && awayOver15 ? (2.5 - (awayOver05 / awayOver15) / 2) : 1;
    
    // Évaluer l'attaque et la défense pour chaque équipe
    return {
        // Score normalisé entre 0 et 3 pour chaque équipe
        expectedHomeGoals: Math.min(Math.max(homeScore, 0), 3),
        expectedAwayGoals: Math.min(Math.max(awayScore, 0), 3),
        highScoring: totalOver25 < 1.8,
        lowScoring: totalOver25 > 2.5
    };
}

/**
 * Analyse des cotes "Les deux équipes marquent"
 */
function analyzeBTTS(answers) {
    const bttsYes = answers['btts-yes'] || 0;
    const bttsNo = answers['btts-no'] || 0;
    
    // Si les deux cotes sont présentes
    if (bttsYes && bttsNo) {
        return {
            bothTeamsToScore: bttsYes < bttsNo,
            strongBTTS: bttsYes < 1.8
        };
    }
    
    // Par défaut, estimation basée sur les cotes over 0.5
    return {
        bothTeamsToScore: 
            (answers['home-over-0-5'] < 1.8) && 
            (answers['away-over-0-5'] < 1.8),
        strongBTTS: false
    };
}

/**
 * Génère deux scores exacts possibles
 */
function generateScores(favoriteAnalysis, goalsAnalysis, bttsAnalysis, answers) {
    // Initialiser avec des valeurs par défaut
    let homeScore1 = 1;
    let awayScore1 = 1;
    let homeScore2 = 1;
    let awayScore2 = 0;
    
    // Adapter le score selon l'équipe favorite
    if (favoriteAnalysis.favorite === 'home') {
        if (favoriteAnalysis.isStrongFavorite) {
            homeScore1 = Math.min(Math.round(goalsAnalysis.expectedHomeGoals), 3);
            awayScore1 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
            
            homeScore2 = Math.min(Math.round(goalsAnalysis.expectedHomeGoals + 0.5), 4);
            awayScore2 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
        } else {
            homeScore1 = 1;
            awayScore1 = 0;
            
            homeScore2 = 2;
            awayScore2 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
        }
    } else if (favoriteAnalysis.favorite === 'away') {
        if (favoriteAnalysis.isStrongFavorite) {
            homeScore1 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
            awayScore1 = Math.min(Math.round(goalsAnalysis.expectedAwayGoals), 3);
            
            homeScore2 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
            awayScore2 = Math.min(Math.round(goalsAnalysis.expectedAwayGoals + 0.5), 4);
        } else {
            homeScore1 = 0;
            awayScore1 = 1;
            
            homeScore2 = bttsAnalysis.bothTeamsToScore ? 1 : 0;
            awayScore2 = 2;
        }
    } else {
        // Match nul
        if (bttsAnalysis.bothTeamsToScore) {
            homeScore1 = 1;
            awayScore1 = 1;
            
            // Si de faibles probabilités de buts, match nul 0-0
            if (goalsAnalysis.lowScoring) {
                homeScore2 = 0;
                awayScore2 = 0;
            } else {
                homeScore2 = 2;
                awayScore2 = 2;
            }
        } else {
            homeScore1 = 0;
            awayScore1 = 0;
            
            homeScore2 = 1;
            awayScore2 = 1;
        }
    }
    
    // Petite adaptation en fonction du handicap
    adjustScoresBasedOnHandicap(answers, homeScore1, awayScore1, homeScore2, awayScore2);
    
    // S'assurer que les scores sont différents
    if (homeScore1 === homeScore2 && awayScore1 === awayScore2) {
        if (Math.random() > 0.5) {
            homeScore2 += 1;
        } else {
            awayScore2 += 1;
        }
    }
    
    return {
        score1: `${homeScore1}-${awayScore1}`,
        score2: `${homeScore2}-${awayScore2}`
    };
}

/**
 * Ajuste les scores en fonction des cotes de handicap
 */
function adjustScoresBasedOnHandicap(answers, homeScore1, awayScore1, homeScore2, awayScore2) {
    // Vérifier si des cotes de handicap sont disponibles
    const homeHandicapMinus1 = answers['home-handicap-minus1'];
    const homeHandicapPlus1 = answers['home-handicap-plus1'];
    const awayHandicapMinus1 = answers['away-handicap-minus1'];
    const awayHandicapPlus1 = answers['away-handicap-plus1'];
    
    // Ajuster les scores si des cotes de handicap intéressantes sont disponibles
    if (homeHandicapMinus1 && homeHandicapMinus1 < 2.2) {
        // L'équipe à domicile est susceptible de gagner avec un écart
        if (homeScore1 <= awayScore1) {
            homeScore1 = awayScore1 + 1;
        }
    }
    
    if (awayHandicapMinus1 && awayHandicapMinus1 < 2.2) {
        // L'équipe à l'extérieur est susceptible de gagner avec un écart
        if (awayScore1 <= homeScore1) {
            awayScore1 = homeScore1 + 1;
        }
    }
    
    // Les handicaps positifs indiquent une faiblesse de l'équipe
    if (homeHandicapPlus1 && homeHandicapPlus1 < 1.5) {
        // L'équipe à domicile est probablement plus faible
        if (homeScore2 >= awayScore2) {
            awayScore2 = homeScore2 + 1;
        }
    }
    
    if (awayHandicapPlus1 && awayHandicapPlus1 < 1.5) {
        // L'équipe à l'extérieur est probablement plus faible
        if (awayScore2 >= homeScore2) {
            homeScore2 = awayScore2 + 1;
        }
    }
}

/**
 * Détermine le résultat du match (victoire simple ou double chance)
 */
function determineMatchResult(favoriteAnalysis) {
    // Si pas d'équipe clairement favorite, prédire match nul
    if (favoriteAnalysis.favorite === 'draw') {
        return 'Match nul';
    }
    
    // Si la cote du favori est >= 1.80, suggérer double chance
    if (!favoriteAnalysis.isStrongFavorite) {
        if (favoriteAnalysis.favorite === 'home') {
            return 'Double chance: 1X (domicile ou nul)';
        } else {
            return 'Double chance: X2 (nul ou extérieur)';
        }
    } else {
        // Sinon, victoire simple du favori
        if (favoriteAnalysis.favorite === 'home') {
            return 'Victoire domicile';
        } else {
            return 'Victoire extérieur';
        }
    }
}

/**
 * Détermine la prédiction du nombre de buts
 */
function determineGoalsPrediction(scores) {
    // Calculer le nombre total de buts des scores prédits
    const score1Parts = scores.score1.split('-');
    const score2Parts = scores.score2.split('-');
    
    const totalGoals1 = parseInt(score1Parts[0]) + parseInt(score1Parts[1]);
    const totalGoals2 = parseInt(score2Parts[0]) + parseInt(score2Parts[1]);
    
    // Prendre le nombre le plus élevé des deux scores
    const maxTotalGoals = Math.max(totalGoals1, totalGoals2);
    
    // Appliquer les règles définies
    if (maxTotalGoals <= 2) {
        return 'Moins de 3,5 buts';
    } else if (maxTotalGoals === 3) {
        return 'Plus de 1,5 buts';
    } else {
        return 'Plus de 2,5 buts';
    }
}

// Exporter la fonction pour l'utiliser dans d'autres modules
window.generatePrediction = generatePrediction;
