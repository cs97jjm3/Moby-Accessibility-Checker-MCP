import ColorContrastCheckerLib from 'color-contrast-checker';

class ColorContrastChecker {
  constructor() {
    this.checker = new ColorContrastCheckerLib();
  }

  async check(page, level = 'AA', selector = null) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    // Get all text elements or specific selector
    const elements = await page.$$(selector || 'body *');
    const minRatio = level === 'AAA' ? 7.0 : 4.5;
    const minLargeTextRatio = level === 'AAA' ? 4.5 : 3.0;

    const checkedCombinations = new Set();

    for (const element of elements) {
      try {
        // Get computed styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          const text = el.textContent?.trim() || '';
          
          if (!text) return null;

          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: parseFloat(computed.fontSize),
            fontWeight: computed.fontWeight,
            text: text.substring(0, 50), // First 50 chars for context
            tagName: el.tagName.toLowerCase(),
          };
        });

        if (!styles || !styles.color || !styles.backgroundColor) continue;

        // Skip if we've already checked this combination
        const combo = `${styles.color}|${styles.backgroundColor}`;
        if (checkedCombinations.has(combo)) continue;
        checkedCombinations.add(combo);

        // Parse colors
        const textColor = this.parseColor(styles.color);
        const bgColor = this.parseColor(styles.backgroundColor);

        if (!textColor || !bgColor) continue;

        // Calculate contrast ratio
        const ratio = this.checker.getContrastRatio(textColor, bgColor);
        
        // Determine if text is large (18pt+ or 14pt+ bold)
        const isLargeText = styles.fontSize >= 18 || 
                           (styles.fontSize >= 14 && parseInt(styles.fontWeight) >= 700);
        
        const requiredRatio = isLargeText ? minLargeTextRatio : minRatio;

        // Check if it passes
        if (ratio < requiredRatio) {
          const severity = ratio < 3.0 ? 'critical' : 'serious';
          
          issues[severity].push({
            tool: 'contrast-checker',
            type: 'insufficient-contrast',
            wcag: ['1.4.3', level === 'AAA' ? '1.4.6' : null].filter(Boolean),
            description: `Insufficient color contrast`,
            element: styles.tagName,
            textColor: styles.color,
            backgroundColor: styles.backgroundColor,
            actualRatio: ratio.toFixed(2),
            requiredRatio: requiredRatio.toFixed(2),
            level,
            isLargeText,
            sample: styles.text,
            fix: this.suggestFix(textColor, bgColor, requiredRatio),
          });
        }
      } catch (error) {
        // Skip elements that can't be evaluated
        continue;
      }
    }

    // Remove duplicates and limit results
    const uniqueIssues = this.deduplicateIssues(issues);

    return { 
      issues: uniqueIssues,
      summary: {
        totalChecked: checkedCombinations.size,
        failed: uniqueIssues.critical.length + uniqueIssues.serious.length,
      },
    };
  }

  parseColor(colorString) {
    // Parse rgb/rgba color strings
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;

    return {
      red: parseInt(match[1]),
      green: parseInt(match[2]),
      blue: parseInt(match[3]),
    };
  }

  suggestFix(textColor, bgColor, requiredRatio) {
    // Simple fix: darken text or lighten background
    const suggestions = [];

    // Try darkening text
    const darkerText = {
      red: Math.max(0, textColor.red - 50),
      green: Math.max(0, textColor.green - 50),
      blue: Math.max(0, textColor.blue - 50),
    };
    
    const darkerRatio = this.checker.getContrastRatio(darkerText, bgColor);
    if (darkerRatio >= requiredRatio) {
      suggestions.push({
        method: 'Darken text color',
        newTextColor: `rgb(${darkerText.red}, ${darkerText.green}, ${darkerText.blue})`,
        newRatio: darkerRatio.toFixed(2),
      });
    }

    // Try lightening background
    const lighterBg = {
      red: Math.min(255, bgColor.red + 50),
      green: Math.min(255, bgColor.green + 50),
      blue: Math.min(255, bgColor.blue + 50),
    };
    
    const lighterRatio = this.checker.getContrastRatio(textColor, lighterBg);
    if (lighterRatio >= requiredRatio) {
      suggestions.push({
        method: 'Lighten background color',
        newBackgroundColor: `rgb(${lighterBg.red}, ${lighterBg.green}, ${lighterBg.blue})`,
        newRatio: lighterRatio.toFixed(2),
      });
    }

    // Fallback: suggest high contrast combinations
    if (suggestions.length === 0) {
      suggestions.push({
        method: 'Use high contrast colors',
        newTextColor: '#1F2937',
        newBackgroundColor: '#FFFFFF',
        newRatio: '14.5',
      });
    }

    return suggestions[0]; // Return best suggestion
  }

  deduplicateIssues(issues) {
    const deduplicated = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    for (const severity of ['critical', 'serious', 'moderate', 'minor']) {
      const seen = new Set();
      
      for (const issue of issues[severity]) {
        const key = `${issue.textColor}|${issue.backgroundColor}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated[severity].push(issue);
        }
      }
    }

    return deduplicated;
  }
}

export default ColorContrastChecker;
