import { syllable } from 'syllable';

class CognitiveChecker {
  async check(page) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    try {
      // Extract main content text
      const textContent = await page.evaluate(() => {
        // Try to find main content area
        const main = document.querySelector('main, [role="main"], article, .content, #content');
        const contentArea = main || document.body;
        
        // Get all text nodes, excluding navigation, headers, footers
        const walker = document.createTreeWalker(
          contentArea,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              
              const excludeTags = ['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER'];
              if (excludeTags.includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
              }
              
              const text = node.textContent.trim();
              return text.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          }
        );

        const texts = [];
        let node;
        while (node = walker.nextNode()) {
          texts.push(node.textContent.trim());
        }

        return texts.join(' ');
      });

      if (!textContent || textContent.length < 100) {
        return { 
          issues, 
          message: 'Insufficient text content to analyze',
        };
      }

      // Calculate reading level metrics
      const metrics = this.calculateReadability(textContent);

      // Check Flesch Reading Ease (60+ is good for general audience)
      if (metrics.fleschReadingEase < 60) {
        const severity = metrics.fleschReadingEase < 30 ? 'serious' : 'moderate';
        
        issues[severity].push({
          tool: 'cognitive-checker',
          type: 'difficult-reading-level',
          wcag: ['3.1.5'],
          description: `Text is difficult to read (Flesch score: ${metrics.fleschReadingEase.toFixed(1)})`,
          detail: `Reading level: ${metrics.readingLevel}`,
          suggestion: 'Simplify sentences and use common words. Target Flesch score: 60+',
          currentScore: metrics.fleschReadingEase.toFixed(1),
          targetScore: '60+',
        });
      }

      // Check for very long sentences
      if (metrics.averageSentenceLength > 25) {
        issues.moderate.push({
          tool: 'cognitive-checker',
          type: 'long-sentences',
          wcag: ['3.1.5'],
          description: `Sentences are too long (average: ${metrics.averageSentenceLength.toFixed(1)} words)`,
          suggestion: 'Break long sentences into shorter ones. Target: 15-20 words per sentence',
          longestSentences: metrics.longestSentences.slice(0, 3),
        });
      }

      // Check for complex words (3+ syllables)
      if (metrics.complexWordPercentage > 15) {
        issues.moderate.push({
          tool: 'cognitive-checker',
          type: 'complex-vocabulary',
          wcag: ['3.1.5'],
          description: `${metrics.complexWordPercentage.toFixed(1)}% of words are complex (3+ syllables)`,
          suggestion: 'Use simpler alternatives for complex words. Target: <10% complex words',
          examples: metrics.complexWords.slice(0, 10),
        });
      }

      // Check for jargon (care sector specific)
      const jargonIssues = this.detectJargon(textContent);
      if (jargonIssues.length > 0) {
        issues.minor.push({
          tool: 'cognitive-checker',
          type: 'jargon-detected',
          wcag: ['3.1.3', '3.1.4'],
          description: `Technical jargon found (${jargonIssues.length} terms)`,
          suggestion: 'Provide definitions or simpler alternatives',
          terms: jargonIssues,
        });
      }

      // Check for time limits
      const timeLimits = await this.checkTimeLimits(page);
      if (timeLimits.found) {
        issues.serious.push({
          tool: 'cognitive-checker',
          type: 'time-limits',
          wcag: ['2.2.1'],
          description: 'Time limits detected - may trap users who need more time',
          suggestion: 'Allow users to extend, adjust, or disable time limits',
          details: timeLimits.details,
        });
      }

      return {
        issues,
        metrics,
        summary: {
          readingLevel: metrics.readingLevel,
          fleschScore: metrics.fleschReadingEase.toFixed(1),
          averageSentenceLength: metrics.averageSentenceLength.toFixed(1),
          complexWordPercentage: metrics.complexWordPercentage.toFixed(1),
          jargonTerms: jargonIssues.length,
        },
      };
    } catch (error) {
      console.error('Cognitive checker error:', error);
      return { issues, error: error.message };
    }
  }

  calculateReadability(text) {
    // Split into sentences (simple approach)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Split into words
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const wordCount = words.length;

    // Count syllables
    let totalSyllables = 0;
    const complexWords = [];
    
    for (const word of words) {
      const syllableCount = syllable(word);
      totalSyllables += syllableCount;
      
      if (syllableCount >= 3 && word.length > 6) {
        complexWords.push({ word, syllables: syllableCount });
      }
    }

    // Flesch Reading Ease Score
    // Score = 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = totalSyllables / wordCount;
    
    const fleschReadingEase = 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    // Determine reading level
    let readingLevel;
    if (fleschReadingEase >= 90) readingLevel = 'Very Easy (5th grade)';
    else if (fleschReadingEase >= 80) readingLevel = 'Easy (6th grade)';
    else if (fleschReadingEase >= 70) readingLevel = 'Fairly Easy (7th grade)';
    else if (fleschReadingEase >= 60) readingLevel = 'Standard (8th-9th grade)';
    else if (fleschReadingEase >= 50) readingLevel = 'Fairly Difficult (10th-12th grade)';
    else if (fleschReadingEase >= 30) readingLevel = 'Difficult (College)';
    else readingLevel = 'Very Difficult (College graduate)';

    // Find longest sentences
    const longestSentences = sentences
      .map(s => ({ text: s.trim(), wordCount: s.split(/\s+/).length }))
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);

    return {
      fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
      readingLevel,
      sentenceCount,
      wordCount,
      averageSentenceLength: avgWordsPerSentence,
      averageSyllablesPerWord: avgSyllablesPerWord,
      complexWords: complexWords.slice(0, 20),
      complexWordPercentage: (complexWords.length / wordCount) * 100,
      longestSentences,
    };
  }

  detectJargon(text) {
    // Common care sector jargon that might confuse residents/families
    const jargonTerms = [
      'holistic', 'multidisciplinary', 'stakeholder', 'baseline', 'metrics',
      'synergy', 'leverage', 'paradigm', 'utilization', 'facilitate',
      'implementation', 'optimization', 'streamline', 'bandwidth',
      'CQC', 'GDPR', 'safeguarding', 'care plan', 'risk assessment',
    ];

    const found = [];
    const lowerText = text.toLowerCase();

    for (const term of jargonTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        found.push(term);
      }
    }

    return found;
  }

  async checkTimeLimits(page) {
    try {
      const timeLimitInfo = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const found = [];

        for (const script of scripts) {
          const content = script.textContent || '';
          
          // Check for setTimeout, session timeout, etc.
          if (content.includes('setTimeout') || 
              content.includes('sessionTimeout') ||
              content.includes('idleTimeout')) {
            found.push({
              type: 'JavaScript timeout detected',
              preview: content.substring(0, 100),
            });
          }
        }

        // Check for meta refresh
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
          found.push({
            type: 'Meta refresh detected',
            content: metaRefresh.content,
          });
        }

        return {
          found: found.length > 0,
          details: found,
        };
      });

      return timeLimitInfo;
    } catch (error) {
      return { found: false, error: error.message };
    }
  }
}

export default CognitiveChecker;
