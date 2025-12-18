class MobyScorer {
  constructor() {
    this.scores = new Map();
  }

  async calculateScore(auditResults) {
    let baseScore = 100;

    // Deduct points based on severity
    const deductions = {
      critical: 10,  // Legal risk, safety concerns
      serious: 3,    // Major barriers
      moderate: 1,   // Usability problems
      minor: 0.25,   // Polish items
    };

    for (const severity of ['critical', 'serious', 'moderate', 'minor']) {
      const issueCount = auditResults.issues[severity].length;
      baseScore -= issueCount * deductions[severity];
    }

    // Don't go below 0
    baseScore = Math.max(0, baseScore);

    // Calculate bonuses (future feature)
    let bonuses = 0;
    
    // Check for AAA compliance in key areas
    if (this.hasAAACompliance(auditResults)) {
      bonuses += 5;
    }

    // Check for care sector best practices
    if (this.hasCareSectorBestPractices(auditResults)) {
      bonuses += 2;
    }

    const finalScore = Math.min(100, Math.round(baseScore + bonuses));

    const scoreData = {
      score: finalScore,
      rating: this.getRating(finalScore),
      ratingDescription: this.getRatingDescription(finalScore),
      breakdown: {
        baseScore: Math.round(baseScore),
        bonuses,
        deductions: {
          critical: auditResults.summary.critical * deductions.critical,
          serious: auditResults.summary.serious * deductions.serious,
          moderate: auditResults.summary.moderate * deductions.moderate,
          minor: auditResults.summary.minor * deductions.minor,
        },
      },
      issues: auditResults.summary,
      wcagLevel: this.determineWCAGLevel(auditResults),
      legalCompliance: this.checkLegalCompliance(finalScore, auditResults),
      recommendations: this.generateRecommendations(finalScore, auditResults),
      tagline: 'Like a good dog, your website should be excited to greet everyone - no matter how they arrive at the door.',
    };

    // Store score
    this.scores.set(auditResults.id, scoreData);

    return scoreData;
  }

  getRating(score) {
    if (score >= 90) return 'OUTSTANDING';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'REQUIRES IMPROVEMENT';
    if (score >= 40) return 'INADEQUATE';
    return 'CRITICAL';
  }

  getRatingDescription(score) {
    const descriptions = {
      OUTSTANDING: '🐕 Moby approves! Accessible to virtually everyone.',
      GOOD: 'Minor improvements needed. Most users can access content.',
      'REQUIRES IMPROVEMENT': 'Significant barriers exist. Some disabled users cannot use site.',
      INADEQUATE: 'Major accessibility failures. Many disabled users excluded.',
      CRITICAL: 'Immediate action required. Legal risk, user safety concerns.',
    };

    return descriptions[this.getRating(score)];
  }

  determineWCAGLevel(auditResults) {
    const { critical, serious } = auditResults.summary;
    
    if (critical === 0 && serious === 0) {
      return { level: 'AA', compliant: true };
    }
    if (critical === 0) {
      return { level: 'A', compliant: true };
    }
    return { level: 'None', compliant: false };
  }

  checkLegalCompliance(score, auditResults) {
    const compliance = {
      uk_public_sector_regulations_2018: score >= 75 && auditResults.summary.critical === 0,
      equality_act_2010: score >= 70,
      cqc_digital_standards: score >= 75,
      overall_status: 'NON_COMPLIANT',
      risk_level: 'HIGH',
    };

    if (score >= 85 && auditResults.summary.critical === 0) {
      compliance.overall_status = 'COMPLIANT';
      compliance.risk_level = 'LOW';
    } else if (score >= 70) {
      compliance.overall_status = 'PARTIAL_COMPLIANCE';
      compliance.risk_level = 'MEDIUM';
    }

    return compliance;
  }

  generateRecommendations(score, auditResults) {
    const recommendations = [];

    // Priority 1: Critical issues
    if (auditResults.summary.critical > 0) {
      recommendations.push({
        priority: 'P0',
        action: `Fix ${auditResults.summary.critical} critical issue(s) immediately`,
        reason: 'Legal risk and user safety concerns',
        estimatedDays: Math.ceil(auditResults.summary.critical * 0.5),
        expectedScoreGain: auditResults.summary.critical * 10,
      });
    }

    // Priority 2: Serious issues
    if (auditResults.summary.serious > 0) {
      recommendations.push({
        priority: 'P1',
        action: `Address ${auditResults.summary.serious} serious issue(s)`,
        reason: 'Major barriers preventing disabled users from accessing content',
        estimatedDays: Math.ceil(auditResults.summary.serious * 0.25),
        expectedScoreGain: auditResults.summary.serious * 3,
      });
    }

    // Priority 3: Path to compliance
    if (score < 85) {
      const pointsNeeded = 85 - score;
      recommendations.push({
        priority: 'P1',
        action: `Achieve legal compliance (85+ score)`,
        reason: 'Meet UK Public Sector Regulations 2018 and CQC standards',
        estimatedDays: Math.ceil(pointsNeeded / 5),
        currentScore: score,
        targetScore: 85,
      });
    }

    // Priority 4: Moderate issues
    if (auditResults.summary.moderate > 5) {
      recommendations.push({
        priority: 'P2',
        action: `Improve usability by fixing ${auditResults.summary.moderate} moderate issue(s)`,
        reason: 'Enhance user experience for all users',
        estimatedDays: Math.ceil(auditResults.summary.moderate * 0.1),
        expectedScoreGain: auditResults.summary.moderate * 1,
      });
    }

    return recommendations;
  }

  hasAAACompliance(auditResults) {
    // Check if any AAA-specific issues are present
    // This is a simplified check - full implementation would analyze WCAG tags
    return auditResults.summary.critical === 0 && 
           auditResults.summary.serious === 0 && 
           auditResults.summary.moderate < 5;
  }

  hasCareSectorBestPractices(auditResults) {
    // Check if care sector specific checks passed
    // Would need to check for specific tool results
    return false; // Placeholder
  }

  getScore(auditId) {
    return this.scores.get(auditId);
  }

  // Generate text summary for display
  generateSummary(scoreData) {
    return `
THE MOBY ACCESSIBILITY SCORE™
${scoreData.tagline}

SCORE: 🐕 ${scoreData.score}/100 - ${scoreData.rating}
${scoreData.ratingDescription}

ISSUE BREAKDOWN:
• Critical (Must Fix):     ${scoreData.issues.critical} issues  [-${scoreData.breakdown.deductions.critical} points]
• Serious (Should Fix):    ${scoreData.issues.serious} issues  [-${scoreData.breakdown.deductions.serious} points]
• Moderate (Nice to Fix):  ${scoreData.issues.moderate} issues  [-${scoreData.breakdown.deductions.moderate} points]
• Minor (Polish):          ${scoreData.issues.minor} issues  [-${scoreData.breakdown.deductions.minor} points]

UK LEGAL COMPLIANCE:
• Public Sector Regulations 2018: ${scoreData.legalCompliance.uk_public_sector_regulations_2018 ? '✓ PASS' : '✗ FAIL'}
• Equality Act 2010: ${scoreData.legalCompliance.equality_act_2010 ? '✓ PASS' : '✗ FAIL'}
• CQC Digital Standards: ${scoreData.legalCompliance.cqc_digital_standards ? '✓ PASS' : '✗ FAIL'}
• Overall Risk Level: ${scoreData.legalCompliance.risk_level}

NEXT STEPS:
${scoreData.recommendations.map((r, i) => `${i + 1}. [${r.priority}] ${r.action} (${r.estimatedDays} days)`).join('\n')}

WCAG Compliance Level: ${scoreData.wcagLevel.level} ${scoreData.wcagLevel.compliant ? '✓' : '✗'}
    `.trim();
  }
}

export default MobyScorer;
