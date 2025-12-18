import AxePuppeteer from '@axe-core/puppeteer';
import pa11y from 'pa11y';
import * as cheerio from 'cheerio';
import ColorContrastChecker from './contrast-checker.js';
import KeyboardTester from './keyboard-tester.js';
import CognitiveChecker from './cognitive-checker.js';
import CareSectorChecks from './care-sector-checks.js';
import { randomUUID } from 'crypto';

class AuditEngine {
  constructor() {
    this.audits = new Map();
    this.contrastChecker = new ColorContrastChecker();
    this.keyboardTester = new KeyboardTester();
    this.cognitiveChecker = new CognitiveChecker();
    this.careSectorChecker = new CareSectorChecks();
  }

  async runFullAudit({ url, mode, browser, wcagLevel, browserManager }) {
    const auditId = randomUUID();
    const startTime = Date.now();

    console.error(`Starting ${mode} audit for ${url} using ${browser}...`);

    const results = {
      id: auditId,
      url,
      mode,
      browser,
      wcagLevel,
      timestamp: new Date().toISOString(),
      issues: {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
      },
      summary: {
        total: 0,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
      },
      tools_run: [],
    };

    try {
      // Navigate to page
      const { page, success, error } = await browserManager.navigateTo(url, browser);
      
      if (!success) {
        throw new Error(`Failed to load page: ${error}`);
      }

      // Run axe-core (always run - fast and comprehensive)
      console.error('Running axe-core...');
      const axeResults = await this.runAxe(page, wcagLevel);
      results.tools_run.push('axe-core');
      this.mergeIssues(results, axeResults);

      if (mode === 'full') {
        // Run Pa11y
        console.error('Running Pa11y...');
        const pa11yResults = await this.runPa11y(url, wcagLevel);
        results.tools_run.push('pa11y');
        this.mergeIssues(results, pa11yResults);

        // Lighthouse skipped (requires special Chrome setup)
        // We have axe-core and Pa11y which cover the same checks

        // Run custom checks
        console.error('Running color contrast checks...');
        const contrastResults = await this.contrastChecker.check(page, wcagLevel);
        results.tools_run.push('contrast-checker');
        this.mergeIssues(results, contrastResults);

        console.error('Running keyboard navigation tests...');
        const keyboardResults = await this.keyboardTester.test(page);
        results.tools_run.push('keyboard-tester');
        this.mergeIssues(results, keyboardResults);

        console.error('Running cognitive accessibility checks...');
        const cognitiveResults = await this.cognitiveChecker.check(page);
        results.tools_run.push('cognitive-checker');
        this.mergeIssues(results, cognitiveResults);

        console.error('Running care sector checks...');
        const careSectorResults = await this.careSectorChecker.check(page);
        results.tools_run.push('care-sector-checker');
        this.mergeIssues(results, careSectorResults);
      }

      // Close page
      await page.close();

      // Calculate summary
      results.summary.critical = results.issues.critical.length;
      results.summary.serious = results.issues.serious.length;
      results.summary.moderate = results.issues.moderate.length;
      results.summary.minor = results.issues.minor.length;
      results.summary.total =
        results.summary.critical +
        results.summary.serious +
        results.summary.moderate +
        results.summary.minor;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      results.duration_seconds = duration;
      console.error(`Audit completed in ${duration}s`);

      // Store results
      this.audits.set(auditId, results);

      return results;
    } catch (error) {
      console.error('Audit error:', error);
      throw error;
    }
  }

  async runAxe(page, wcagLevel) {
    const axeResults = await new AxePuppeteer(page)
      .withTags([`wcag2${wcagLevel.toLowerCase()}`])
      .analyze();

    return this.formatAxeResults(axeResults);
  }

  async runPa11y(url, wcagLevel) {
    try {
      const results = await pa11y(url, {
        standard: `WCAG2${wcagLevel}`,
        timeout: 30000,
        wait: 1000,
      });

      return this.formatPa11yResults(results);
    } catch (error) {
      console.error('Pa11y error:', error.message);
      return { issues: { critical: [], serious: [], moderate: [], minor: [] } };
    }
  }

  // Lighthouse removed to simplify dependencies
  // axe-core and Pa11y provide comprehensive WCAG coverage

  formatAxeResults(axeResults) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    // Map axe-core violations to our severity levels
    for (const violation of axeResults.violations) {
      const severity = this.mapAxeSeverity(violation.impact);
      
      for (const node of violation.nodes) {
        issues[severity].push({
          tool: 'axe-core',
          type: violation.id,
          wcag: violation.tags.filter(t => t.startsWith('wcag')),
          description: violation.description,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          selector: node.target.join(' '),
          html: node.html,
          failureSummary: node.failureSummary,
        });
      }
    }

    return { issues };
  }

  formatPa11yResults(results) {
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    for (const issue of results.issues) {
      const severity = this.mapPa11ySeverity(issue.type);
      
      issues[severity].push({
        tool: 'pa11y',
        type: issue.code,
        wcag: [issue.code],
        description: issue.message,
        selector: issue.selector,
        context: issue.context,
        runner: issue.runner,
      });
    }

    return { issues };
  }

  mapAxeSeverity(impact) {
    const map = {
      critical: 'critical',
      serious: 'serious',
      moderate: 'moderate',
      minor: 'minor',
    };
    return map[impact] || 'moderate';
  }

  mapPa11ySeverity(type) {
    const map = {
      error: 'critical',
      warning: 'serious',
      notice: 'moderate',
    };
    return map[type] || 'moderate';
  }

  mergeIssues(results, newResults) {
    if (!newResults || !newResults.issues) return;

    for (const severity of ['critical', 'serious', 'moderate', 'minor']) {
      if (newResults.issues[severity]) {
        results.issues[severity].push(...newResults.issues[severity]);
      }
    }
  }

  // Individual tool methods
  async checkColorContrast({ url, browser, level, selector, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.contrastChecker.check(page, level, selector);
    await page.close();
    return results;
  }

  async testKeyboardNavigation({ url, browser, startSelector, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.keyboardTester.test(page, startSelector);
    await page.close();
    return results;
  }

  async validateAriaLabels({ url, browser, checkInteractiveOnly, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.checkAriaLabels(page, checkInteractiveOnly);
    await page.close();
    return results;
  }

  async auditFormAccessibility({ url, browser, formSelector, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.checkForms(page, formSelector);
    await page.close();
    return results;
  }

  async checkCognitiveAccessibility({ url, browser, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.cognitiveChecker.check(page);
    await page.close();
    return results;
  }

  async checkCareSectorStandards({ url, browser, browserManager }) {
    const { page } = await browserManager.navigateTo(url, browser);
    const results = await this.careSectorChecker.check(page);
    await page.close();
    return results;
  }

  async compareBrowsers({ url, wcagLevel, browserManager }) {
    const results = await browserManager.runAcrossBrowsers(async (browser) => {
      return await this.runFullAudit({
        url,
        mode: 'summary',
        browser,
        wcagLevel,
        browserManager,
      });
    });

    return results;
  }

  async checkAriaLabels(page, checkInteractiveOnly) {
    const selector = checkInteractiveOnly
      ? 'button, a, input, select, textarea, [role="button"], [role="link"]'
      : '*[role], *[aria-label], *[aria-labelledby]';

    const elements = await page.$$(selector);
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    for (const element of elements) {
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const role = await element.evaluate(el => el.getAttribute('role'));
      const ariaLabel = await element.evaluate(el => el.getAttribute('aria-label'));
      const ariaLabelledBy = await element.evaluate(el => el.getAttribute('aria-labelledby'));
      const text = await element.evaluate(el => el.textContent?.trim());

      // Check if interactive element has accessible name
      if (checkInteractiveOnly) {
        if (!ariaLabel && !ariaLabelledBy && !text) {
          issues.serious.push({
            tool: 'aria-validator',
            type: 'missing-accessible-name',
            wcag: ['4.1.2'],
            description: `${tagName} has no accessible name`,
            element: tagName,
            role: role || 'none',
          });
        }
      }

      // Check for invalid roles
      const validRoles = [
        'alert', 'button', 'checkbox', 'dialog', 'link', 'menu', 
        'navigation', 'region', 'tab', 'tabpanel', 'textbox'
      ];
      
      if (role && !validRoles.includes(role)) {
        issues.moderate.push({
          tool: 'aria-validator',
          type: 'invalid-role',
          wcag: ['4.1.2'],
          description: `Invalid ARIA role: ${role}`,
          element: tagName,
          role,
        });
      }
    }

    return { issues };
  }

  async checkForms(page, formSelector) {
    const selector = formSelector || 'form';
    const forms = await page.$$(selector);
    const issues = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    for (const form of forms) {
      const inputs = await form.$$('input, select, textarea');

      for (const input of inputs) {
        const type = await input.evaluate(el => el.type);
        const id = await input.evaluate(el => el.id);
        const name = await input.evaluate(el => el.name);
        const label = id ? await form.$(`label[for="${id}"]`) : null;
        const ariaLabel = await input.evaluate(el => el.getAttribute('aria-label'));
        const ariaLabelledBy = await input.evaluate(el => el.getAttribute('aria-labelledby'));

        // Check for missing labels
        if (!label && !ariaLabel && !ariaLabelledBy && type !== 'hidden') {
          issues.critical.push({
            tool: 'form-auditor',
            type: 'missing-label',
            wcag: ['3.3.2', '1.3.1'],
            description: `Form field has no associated label`,
            element: `input[type="${type}"]`,
            name: name || 'unnamed',
          });
        }

        // Check for autocomplete attributes
        const autocomplete = await input.evaluate(el => el.getAttribute('autocomplete'));
        const relevantTypes = ['email', 'tel', 'url', 'text', 'password'];
        
        if (relevantTypes.includes(type) && !autocomplete) {
          issues.minor.push({
            tool: 'form-auditor',
            type: 'missing-autocomplete',
            wcag: ['1.3.5'],
            description: `Input field missing autocomplete attribute`,
            element: `input[type="${type}"]`,
            suggestion: `Add autocomplete="${this.suggestAutocomplete(type, name)}"`,
          });
        }
      }
    }

    return { issues };
  }

  suggestAutocomplete(type, name) {
    const suggestions = {
      email: 'email',
      tel: 'tel',
      password: 'current-password',
    };

    if (suggestions[type]) return suggestions[type];
    if (name?.includes('postal')) return 'postal-code';
    if (name?.includes('address')) return 'street-address';
    
    return 'on';
  }

  getAudit(auditId) {
    return this.audits.get(auditId);
  }
}

export default AuditEngine;
