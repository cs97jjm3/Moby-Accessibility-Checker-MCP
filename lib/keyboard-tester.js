class KeyboardTester {
  async test(page, startSelector = null) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    try {
      // Start from specified element or body
      if (startSelector) {
        await page.focus(startSelector);
      }

      // Get all focusable elements
      const focusableElements = await page.evaluate(() => {
        const selector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const elements = Array.from(document.querySelectorAll(selector));
        
        return elements.map((el, index) => ({
          index,
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: el.className,
          tabIndex: el.tabIndex,
          text: el.textContent?.trim().substring(0, 30) || '',
          type: el.type || null,
          isVisible: el.offsetParent !== null,
        }));
      });

      // Test tab order
      const tabOrder = [];
      let tabCount = 0;
      const maxTabs = Math.min(50, focusableElements.length);

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        
        const currentFocus = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            tagName: active.tagName.toLowerCase(),
            id: active.id,
            className: active.className,
            text: active.textContent?.trim().substring(0, 30) || '',
          };
        });

        tabOrder.push(currentFocus);
        tabCount++;

        // Check for focus trap (same element focused twice in a row)
        if (tabCount > 1 && 
            tabOrder[tabCount - 1].id === tabOrder[tabCount - 2].id &&
            tabOrder[tabCount - 1].id !== '') {
          issues.critical.push({
            tool: 'keyboard-tester',
            type: 'focus-trap',
            wcag: ['2.1.2'],
            description: 'Keyboard focus trap detected - users cannot escape',
            element: currentFocus.tagName,
            elementId: currentFocus.id,
          });
          break;
        }
      }

      // Check for skip links
      const hasSkipLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="#"]'));
        return links.some(link => 
          link.textContent?.toLowerCase().includes('skip') ||
          link.textContent?.toLowerCase().includes('jump')
        );
      });

      if (!hasSkipLink && focusableElements.length > 20) {
        issues.moderate.push({
          tool: 'keyboard-tester',
          type: 'missing-skip-link',
          wcag: ['2.4.1'],
          description: 'No skip link found - keyboard users must tab through all navigation',
          suggestion: 'Add a "Skip to main content" link as the first focusable element',
        });
      }

      // Check for visible focus indicators
      const focusIndicatorIssues = await page.evaluate(() => {
        const selector = 'a[href], button, input, select, textarea';
        const elements = Array.from(document.querySelectorAll(selector));
        const issues = [];

        for (const el of elements.slice(0, 10)) { // Check first 10 elements
          el.focus();
          const styles = window.getComputedStyle(el);
          const focusStyles = window.getComputedStyle(el, ':focus');
          
          // Check if there's a visible focus indicator
          const hasOutline = focusStyles.outlineWidth !== '0px' && 
                           focusStyles.outlineStyle !== 'none';
          const hasBoxShadow = focusStyles.boxShadow !== 'none';
          const hasBorder = focusStyles.borderWidth !== styles.borderWidth ||
                          focusStyles.borderColor !== styles.borderColor;

          if (!hasOutline && !hasBoxShadow && !hasBorder) {
            issues.push({
              tagName: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className,
            });
          }
        }

        return issues;
      });

      if (focusIndicatorIssues.length > 0) {
        issues.serious.push({
          tool: 'keyboard-tester',
          type: 'missing-focus-indicator',
          wcag: ['2.4.7'],
          description: `${focusIndicatorIssues.length} elements have no visible focus indicator`,
          elements: focusIndicatorIssues.slice(0, 5), // Show first 5
          fix: 'Add visible :focus styles with outline, box-shadow, or border changes',
        });
      }

      // Check tab order logic
      const tabOrderIssues = this.analyzeTabOrder(tabOrder, focusableElements);
      if (tabOrderIssues.length > 0) {
        issues.moderate.push(...tabOrderIssues);
      }

      return { 
        issues,
        tabOrder: tabOrder.slice(0, 20), // Return first 20 for debugging
        summary: {
          totalFocusable: focusableElements.length,
          tabsTested: tabCount,
          hasSkipLink,
          focusIndicatorIssues: focusIndicatorIssues.length,
        },
      };
    } catch (error) {
      console.error('Keyboard testing error:', error);
      return { issues, error: error.message };
    }
  }

  analyzeTabOrder(tabOrder, focusableElements) {
    const issues = [];

    // Check for illogical jumps in tab order
    // This is a simplified check - full implementation would use DOM order
    const skipCounts = new Map();

    for (let i = 1; i < tabOrder.length; i++) {
      const prev = tabOrder[i - 1];
      const curr = tabOrder[i];

      // Count how many times focus jumps to completely different sections
      const key = `${prev.tagName}-${curr.tagName}`;
      skipCounts.set(key, (skipCounts.get(key) || 0) + 1);
    }

    // Check if tab order seems chaotic (many different jumps)
    if (skipCounts.size > tabOrder.length * 0.7) {
      issues.push({
        tool: 'keyboard-tester',
        type: 'chaotic-tab-order',
        wcag: ['2.4.3'],
        description: 'Tab order appears illogical - may confuse keyboard users',
        suggestion: 'Review tabindex values and DOM order',
      });
    }

    return issues;
  }
}

export default KeyboardTester;
