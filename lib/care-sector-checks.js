class CareSectorChecks {
  async check(page) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    try {
      // Check for emergency/crisis features
      const emergencyFeatures = await this.checkEmergencyAccessibility(page);
      if (emergencyFeatures.issues.length > 0) {
        issues.critical.push(...emergencyFeatures.issues);
      }

      // Check text size for elderly users
      const textSizeIssues = await this.checkTextSizeForElderly(page);
      if (textSizeIssues.length > 0) {
        issues.moderate.push(...textSizeIssues);
      }

      // Check for NHS colour palette compliance (if applicable)
      const nhsColorIssues = await this.checkNHSColors(page);
      if (nhsColorIssues.length > 0) {
        issues.minor.push(...nhsColorIssues);
      }

      // Check medication/health information clarity
      const healthInfoIssues = await this.checkHealthInformationClarity(page);
      if (healthInfoIssues.length > 0) {
        issues.serious.push(...healthInfoIssues);
      }

      // Check for care record accessibility
      const careRecordIssues = await this.checkCareRecordFeatures(page);
      if (careRecordIssues.length > 0) {
        issues.moderate.push(...careRecordIssues);
      }

      return {
        issues,
        careSectorCompliance: {
          emergencyAccessible: emergencyFeatures.issues.length === 0,
          elderlyFriendly: textSizeIssues.length === 0,
          nhsCompliant: nhsColorIssues.length === 0,
          healthInfoClear: healthInfoIssues.length === 0,
          careRecordAccessible: careRecordIssues.length === 0,
        },
      };
    } catch (error) {
      console.error('Care sector checks error:', error);
      return { issues, error: error.message };
    }
  }

  async checkEmergencyAccessibility(page) {
    const issues = [];

    const emergencyElements = await page.evaluate(() => {
      const keywords = ['emergency', 'urgent', 'crisis', 'alert', '999', '111', 'help'];
      const elements = [];

      // Find elements with emergency-related text
      const allElements = document.querySelectorAll('button, a, div[role="button"], [class*="emergency"], [class*="alert"]');
      
      for (const el of allElements) {
        const text = el.textContent?.toLowerCase() || '';
        const classes = el.className?.toLowerCase() || '';
        const id = el.id?.toLowerCase() || '';

        if (keywords.some(keyword => text.includes(keyword) || classes.includes(keyword) || id.includes(keyword))) {
          const styles = window.getComputedStyle(el);
          elements.push({
            text: el.textContent?.trim().substring(0, 50),
            tagName: el.tagName.toLowerCase(),
            fontSize: parseFloat(styles.fontSize),
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontWeight: styles.fontWeight,
            isVisible: el.offsetParent !== null,
            hasAriaLabel: el.hasAttribute('aria-label'),
            role: el.getAttribute('role'),
          });
        }
      }

      return elements;
    });

    for (const element of emergencyElements) {
      // Emergency features must be highly visible
      if (element.fontSize < 16) {
        issues.push({
          tool: 'care-sector-checker',
          type: 'emergency-feature-too-small',
          wcag: ['1.4.4', 'CQC-Safe'],
          description: `Emergency feature text too small (${element.fontSize}px)`,
          element: element.text,
          suggestion: 'Emergency features should be at least 18px for elderly users',
          careSectorStandard: 'CQC Safe - Emergency features must be immediately identifiable',
        });
      }

      // Emergency features should have clear labels
      if (!element.hasAriaLabel && element.text.length < 5) {
        issues.push({
          tool: 'care-sector-checker',
          type: 'emergency-feature-unclear-label',
          wcag: ['4.1.2', 'CQC-Safe'],
          description: 'Emergency feature has unclear or missing label',
          element: element.tagName,
          suggestion: 'Add clear aria-label describing the emergency action',
          careSectorStandard: 'CQC Safe - Emergency features must be clearly labelled',
        });
      }

      // Check visibility
      if (!element.isVisible) {
        issues.push({
          tool: 'care-sector-checker',
          type: 'emergency-feature-hidden',
          wcag: ['CQC-Safe'],
          description: 'Emergency feature is hidden',
          element: element.text,
          suggestion: 'Emergency features must be always visible',
          severity: 'critical',
          careSectorStandard: 'CQC Safe - Emergency features must be accessible at all times',
        });
      }
    }

    return { issues };
  }

  async checkTextSizeForElderly(page) {
    const issues = [];

    const textElements = await page.evaluate(() => {
      const elements = [];
      const allText = document.querySelectorAll('p, li, td, span, div, label');

      for (const el of allText) {
        const text = el.textContent?.trim();
        if (!text || text.length < 10) continue;

        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);

        if (fontSize < 14) {
          elements.push({
            tagName: el.tagName.toLowerCase(),
            fontSize,
            text: text.substring(0, 50),
          });
        }
      }

      return elements.slice(0, 10); // Limit to 10 examples
    });

    if (textElements.length > 0) {
      issues.push({
        tool: 'care-sector-checker',
        type: 'text-too-small-for-elderly',
        wcag: ['1.4.4', 'NHS-Digital-Standard'],
        description: `${textElements.length} text elements below 14px (elderly users may struggle)`,
        suggestion: 'Use minimum 14px for body text, 16px preferred for elderly users',
        examples: textElements.slice(0, 5),
        careSectorStandard: 'NHS Digital Service Standard - Design for users with visual impairments',
      });
    }

    return issues;
  }

  async checkNHSColors(page) {
    const issues = [];

    // NHS colour palette (for NHS-connected services)
    const nhsBlue = '#005eb8';
    const nhsWhite = '#ffffff';
    const nhsBlack = '#212b32';

    const colorUsage = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="nhs"], [class*="NHS"]');
      const colors = [];

      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        colors.push({
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        });
      }

      return colors;
    });

    // This is a basic check - full implementation would validate NHS design system compliance
    if (colorUsage.length > 0) {
      // Check if using NHS branding but not NHS colors
      // This would be more sophisticated in production
    }

    return issues;
  }

  async checkHealthInformationClarity(page) {
    const issues = [];

    const healthKeywords = [
      'medication', 'dosage', 'prescription', 'treatment', 'diagnosis',
      'allergy', 'condition', 'symptoms', 'side effects', 'contraindication'
    ];

    const healthInfo = await page.evaluate((keywords) => {
      const findings = [];
      const allText = document.querySelectorAll('p, li, div, span, td');

      for (const el of allText) {
        const text = el.textContent?.toLowerCase() || '';
        
        if (keywords.some(keyword => text.includes(keyword))) {
          const styles = window.getComputedStyle(el);
          findings.push({
            text: el.textContent?.trim().substring(0, 100),
            fontSize: parseFloat(styles.fontSize),
            fontWeight: styles.fontWeight,
            containsKeyword: keywords.find(k => text.includes(k)),
          });
        }
      }

      return findings;
    }, healthKeywords);

    for (const info of healthInfo) {
      // Health information should be very clear (larger text, bold)
      if (info.fontSize < 14) {
        issues.push({
          tool: 'care-sector-checker',
          type: 'health-info-unclear',
          wcag: ['CQC-Effective'],
          description: 'Health/medication information uses small text',
          text: info.text,
          fontSize: info.fontSize,
          suggestion: 'Health-critical information should be at least 16px and bold',
          careSectorStandard: 'CQC Effective - Health information must be clearly communicated',
        });
      }
    }

    return issues;
  }

  async checkCareRecordFeatures(page) {
    const issues = [];

    const careRecordElements = await page.evaluate(() => {
      const keywords = ['care plan', 'resident', 'patient', 'notes', 'assessment', 'observation'];
      const elements = [];

      const inputs = document.querySelectorAll('input, textarea, select');
      
      for (const input of inputs) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const placeholder = input.placeholder?.toLowerCase() || '';
        const labelText = label?.textContent?.toLowerCase() || '';
        const name = input.name?.toLowerCase() || '';

        if (keywords.some(keyword => 
          placeholder.includes(keyword) || 
          labelText.includes(keyword) ||
          name.includes(keyword)
        )) {
          elements.push({
            type: input.type,
            hasLabel: !!label,
            hasAutocomplete: input.hasAttribute('autocomplete'),
            placeholder,
            labelText,
          });
        }
      }

      return elements;
    });

    for (const element of careRecordElements) {
      // Care record fields should have proper autocomplete
      if (!element.hasAutocomplete && element.type !== 'textarea') {
        issues.push({
          tool: 'care-sector-checker',
          type: 'care-record-missing-autocomplete',
          wcag: ['1.3.5'],
          description: 'Care record field missing autocomplete attribute',
          field: element.labelText || element.placeholder,
          suggestion: 'Add autocomplete to help staff fill forms faster',
          careSectorStandard: 'CQC Effective - Systems should support efficient care delivery',
        });
      }
    }

    return issues;
  }
}

export default CareSectorChecks;
