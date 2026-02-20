/**
 * HeartPath AI Risk Logic
 * Detects clinical risk patterns from patient data.
 * NOTE: This is a wellness support tool, not a medical diagnostic system.
 */

/**
 * Detect overexertion risk based on heart rate data
 * @param {number} hr - average heart rate in bpm
 * @param {number} maxHR - patient's max heart rate (default 220 - age, approximate)
 * @returns {{ risk: boolean, level: string, message: string }}
 */
export function detectOverexertion(hr, maxHR = 150) {
    const ratio = hr / maxHR
    if (ratio > 0.85) {
        return { risk: true, level: 'high', message: 'Heart rate significantly above safe zone. Rest is recommended.' }
    } else if (ratio > 0.75) {
        return { risk: true, level: 'medium', message: 'Heart rate approaching upper limit of safe zone.' }
    }
    return { risk: false, level: 'low', message: 'Heart rate within safe zone.' }
}

/**
 * Calculate readiness score (0–100) based on patient daily metrics
 * @param {{ fatigue: number, hr: number, sleep: number, hrv: number }} metrics
 * @returns {{ score: number, category: string, suggestion: string }}
 */
export function calcReadinessScore({ fatigue = 5, hr = 70, sleep = 7, hrv = 40 }) {
    // Normalize each factor to 0-25 scale
    const fatigueScore = (fatigue / 10) * 25 // higher fatigue = better score
    const hrScore = hr < 60 ? 25 : hr < 80 ? 20 : hr < 100 ? 10 : 5
    const sleepScore = sleep >= 8 ? 25 : sleep >= 7 ? 20 : sleep >= 6 ? 12 : 5
    const hrvScore = hrv >= 50 ? 25 : hrv >= 35 ? 18 : hrv >= 20 ? 10 : 5

    const total = Math.round(fatigueScore + hrScore + sleepScore + hrvScore)

    let category, suggestion
    if (total >= 80) {
        category = 'excellent'
        suggestion = 'Great readiness! You can follow your full program today.'
    } else if (total >= 60) {
        category = 'good'
        suggestion = 'Good readiness. Moderate exercise recommended.'
    } else if (total >= 40) {
        category = 'fair'
        suggestion = 'Moderate readiness. Consider a lighter session today.'
    } else {
        category = 'low'
        suggestion = 'Low readiness detected. Rest or very gentle walking only.'
    }

    return { score: total, category, suggestion }
}

/**
 * Flag symptom risk from recent reports
 * @param {Array<{type: string, severity: string, timestamp: string}>} reports
 * @returns {{ flagged: boolean, level: string, reason: string }}
 */
export function flagSymptomRisk(reports) {
    if (!reports || reports.length === 0) return { flagged: false, level: 'none', reason: '' }

    const last24h = reports.filter(r => {
        const age = Date.now() - new Date(r.timestamp).getTime()
        return age < 24 * 60 * 60 * 1000
    })

    const severeSymptoms = last24h.filter(r => r.severity === 'severe')
    const chestPain = last24h.find(r => r.type === 'chest_pain')

    if (severeSymptoms.length > 0 || chestPain) {
        return {
            flagged: true,
            level: 'critical',
            reason: chestPain
                ? 'Chest pain reported — clinical review required immediately.'
                : 'Severe symptoms reported. Immediate medical review recommended.',
        }
    }

    if (last24h.length >= 2) {
        return {
            flagged: true,
            level: 'moderate',
            reason: 'Multiple symptoms reported in 24 hours. Doctor review advised.',
        }
    }

    return { flagged: false, level: 'low', reason: '' }
}

/**
 * Analyze patient adherence and warn if missing exercise sessions
 * @param {Array<{ date: string, completed: boolean }>} sessions
 * @returns {{ adherence: number, warning: boolean, message: string }}
 */
export function analyzeAdherence(sessions) {
    if (!sessions || sessions.length === 0) {
        return { adherence: 0, warning: true, message: 'No activity recorded yet.' }
    }

    const completed = sessions.filter(s => s.completed).length
    const adherence = Math.round((completed / sessions.length) * 100)

    if (adherence < 50) {
        return {
            adherence,
            warning: true,
            message: `Adherence at ${adherence}%. Patient may need motivational support.`,
        }
    }

    return { adherence, warning: adherence < 75, message: '' }
}

/**
 * Get color for risk level
 */
export function getRiskColor(level) {
    const colors = {
        high: '#ef4444',
        critical: '#ef4444',
        medium: '#f59e0b',
        moderate: '#f59e0b',
        low: '#10b981',
        none: '#10b981',
    }
    return colors[level] || '#64748b'
}

/**
 * Generate AI insight message based on metrics
 */
export function generateAIInsight(metrics) {
    const { score, suggestion } = calcReadinessScore(metrics)
    const tips = [
        'Remember to stay hydrated during exercise.',
        'Cool down for 5 minutes after each session.',
        'Log your symptoms promptly so your doctor can support you.',
        'Consistency is more important than intensity in cardiac rehab.',
        'Your progress charts are looking great — keep it up!',
    ]
    const tip = tips[Math.floor(Date.now() / 86400000) % tips.length]
    return { readiness: score, suggestion, tip }
}
