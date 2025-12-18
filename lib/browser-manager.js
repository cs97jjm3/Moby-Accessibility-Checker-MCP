import puppeteer from 'puppeteer';
import { chromium, firefox, webkit } from 'playwright';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BrowserManager {
  constructor() {
    this.browsers = {};
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = join(__dirname, '..', 'config', 'browsers.json');
      return JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (error) {
      // Return default config if file doesn't exist
      return {
        chromium: { enabled: true, engine: 'puppeteer' },
        firefox: { enabled: true, engine: 'playwright' },
        webkit: { enabled: true, engine: 'playwright' },
        default: 'chromium',
      };
    }
  }

  async getBrowser(browserType = 'chromium') {
    // Return existing browser if already launched
    if (this.browsers[browserType]) {
      return this.browsers[browserType];
    }

    const config = this.config[browserType];
    if (!config || !config.enabled) {
      throw new Error(`Browser ${browserType} is not enabled in config`);
    }

    let browser;

    try {
      if (config.engine === 'puppeteer' && browserType === 'chromium') {
        browser = await puppeteer.launch({
          headless: 'new',
          args: config.args || ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: config.executablePath || undefined,
        });
      } else {
        // Use Playwright for Firefox and WebKit
        const playwrightBrowser = { chromium, firefox, webkit }[browserType];
        browser = await playwrightBrowser.launch({
          headless: true,
          args: config.args || [],
          executablePath: config.executablePath || undefined,
        });
      }

      this.browsers[browserType] = {
        instance: browser,
        type: browserType,
        engine: config.engine,
      };

      return this.browsers[browserType];
    } catch (error) {
      throw new Error(`Failed to launch ${browserType}: ${error.message}`);
    }
  }

  async getPage(browserType = 'chromium') {
    const browser = await this.getBrowser(browserType);
    
    if (browser.engine === 'puppeteer') {
      return await browser.instance.newPage();
    } else {
      const context = await browser.instance.newContext();
      return await context.newPage();
    }
  }

  async navigateTo(url, browserType = 'chromium', options = {}) {
    const page = await this.getPage(browserType);
    
    try {
      await page.goto(url, {
        waitUntil: options.waitUntil || 'networkidle2',
        timeout: options.timeout || 30000,
      });

      return { page, success: true };
    } catch (error) {
      return { 
        page, 
        success: false, 
        error: error.message 
      };
    }
  }

  async closeBrowser(browserType) {
    if (this.browsers[browserType]) {
      await this.browsers[browserType].instance.close();
      delete this.browsers[browserType];
    }
  }

  async closeAll() {
    for (const browserType of Object.keys(this.browsers)) {
      await this.closeBrowser(browserType);
    }
  }

  // Helper to run same operation across all browsers
  async runAcrossBrowsers(operation) {
    const results = {};
    const browsers = ['chromium', 'firefox', 'webkit'];

    for (const browser of browsers) {
      if (this.config[browser]?.enabled) {
        try {
          results[browser] = await operation(browser);
        } catch (error) {
          results[browser] = { 
            error: error.message,
            success: false 
          };
        }
      }
    }

    return results;
  }
}

export default BrowserManager;
