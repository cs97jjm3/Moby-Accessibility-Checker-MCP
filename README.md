# 🐕 The Moby Accessibility Checker

**"Like a good dog, your website should be excited to greet everyone - no matter how they arrive at the door."**

A comprehensive accessibility auditing MCP server for Claude Desktop that generates **The Moby Score** - a straightforward 0-100 rating of how well your website works for everyone.

Named after Moby - because accessibility should be straightforward, reliable, and friendly.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## ✨ Features

- 🎯 **The Moby Score (0-100)** - One clear metric instead of hundreds of warnings
- 🔧 **10 Free Tools** - axe-core, Pa11y, Lighthouse, IBM Equal Access, and 6 custom checkers
- 🇬🇧 **UK Legal Compliance** - Checks Public Sector Regs 2018, Equality Act 2010, CQC standards
- 🏥 **Care Sector Focus** - NHS standards, emergency features, elderly-friendly text
- 📄 **Professional PDFs** - Stakeholder-ready reports with before/after code fixes
- 🌐 **Cross-Browser Testing** - Chromium, Firefox, WebKit
- ⚡ **Fast** - Summary in 30s, full audit in 60s
- 💯 **Free Forever** - All tools are open source, no API keys needed

## 🚀 Quick Start

### Installation

1. **Clone this repo**
   ```bash
   git clone https://github.com/yourusername/moby-accessibility-checker.git
   cd moby-accessibility-checker
   ```

2. **Run installer** (Windows/Mac/Linux)
   ```bash
   # Windows
   install.bat
   
   # Mac/Linux
   chmod +x install.sh
   ./install.sh
   ```

3. **Restart Claude Desktop**

4. **Test it**
   ```
   In Claude: "Check accessibility for https://example.com"
   ```

### Manual Installation

```bash
npm install
npx playwright install chromium firefox webkit
```

Then add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "moby-accessibility-checker": {
      "command": "node",
      "args": ["C:\\path\\to\\moby-accessibility-checker\\index.js"]
    }
  }
}
```

## 📊 The Moby Score

### Scale: 0-100

- **90-100: OUTSTANDING** 🐕 - Moby approves! Legally compliant
- **75-89: GOOD** - Minor improvements needed
- **60-74: REQUIRES IMPROVEMENT** - Significant work needed
- **40-59: INADEQUATE** - Major failures, high legal risk
- **0-39: CRITICAL** - Immediate action required

### How It's Calculated

- Start: 100 points
- Critical issue: -10 points (legal risk, safety)
- Serious issue: -3 points (major barriers)
- Moderate issue: -1 point (usability problems)
- Minor issue: -0.25 points (polish)

## 🛠️ Tools Included

1. **axe-core** - 90+ WCAG rules
2. **Pa11y** - HTML_CodeSniffer engine
3. **Lighthouse** - Google's accessibility audit
4. **IBM Equal Access** - Enterprise-grade checks
5. **Color Contrast Checker** - WCAG AA/AAA compliance
6. **Keyboard Navigation Tester** - Tab order, focus traps
7. **ARIA Validator** - Labels, roles, states
8. **Cognitive Checker** - Reading level analysis
9. **Form Auditor** - Labels, autocomplete, errors
10. **Care Sector Checker** - NHS/CQC standards

## 📖 Usage

### Basic Audit
```
User: Check accessibility for https://example.com
Claude: Full audit or summary?
User: Full
```

**Result in 60 seconds:**
```
THE MOBY ACCESSIBILITY SCORE™
🐕 72/100 - REQUIRES IMPROVEMENT

ISSUE BREAKDOWN:
• Critical:  3 issues  [-30 points]
• Serious:   12 issues [-36 points]
• Moderate:  24 issues [-24 points]
• Minor:     8 issues  [-2 points]

UK LEGAL COMPLIANCE:
✗ Not compliant - Risk Level: HIGH

NEXT STEPS:
1. [P0] Fix 3 critical issues (2 days)
2. [P1] Fix 12 serious issues (3 days)
3. Target: 85/100 = Legal compliance
```

### Generate PDF Report
```
User: Generate PDF report for that audit
```

Gets you a professional 20-page PDF with:
- Moby Score and rating
- Executive summary
- All issues with screenshots
- Before/after code fixes
- UK legal compliance status
- Prioritised action plan

### Other Commands
```
Check color contrast on https://example.com
Test keyboard navigation for https://example.com
Compare browsers for https://example.com
Check NHS and CQC standards for https://example.com
```

## 🇬🇧 UK Legal Compliance

Automatically checks:

- ✅ **Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018**
- ✅ **Equality Act 2010** (Reasonable adjustments)
- ✅ **CQC Safe & Effective standards** (Care sector)
- ✅ **NHS Digital Service Standard**

## 🏥 Care Sector Features

- Emergency button accessibility (size, visibility, labels)
- Text size for elderly users (14px+ minimum)
- Health information clarity (medications, dosages)
- Care record form accessibility
- NHS colour palette compliance

## 📄 Example Output

### Before
*"Our site has 143 accessibility violations but we don't know what to fix first..."*

### After
```
THE MOBY SCORE: 58/100 - INADEQUATE

PRIORITY ACTIONS:
1. [P0] Fix 5 critical issues (2 days) → +50 points
2. [P1] Fix 18 serious issues (3 days) → +54 points
3. Target: 85/100 = Legal compliance

Current Risk: HIGH
Estimated to compliance: 5 days
```

## 🔧 Configuration

### Browser Settings
Edit `config/browsers.json`:
```json
{
  "chromium": { "enabled": true, "engine": "puppeteer" },
  "firefox": { "enabled": true, "engine": "playwright" },
  "webkit": { "enabled": true, "engine": "playwright" }
}
```

### Scoring Customization
Edit `config/moby-scoring.json` to adjust:
- Point deductions per severity
- Bonus points criteria
- Rating thresholds
- Legal compliance requirements

## 📦 What's Included

```
moby-accessibility-checker/
├── package.json              # Dependencies
├── index.js                  # MCP server
├── .gitignore               # Git exclusions
├── install.bat              # Windows installer
├── install.sh               # Mac/Linux installer
├── manifest.json            # Claude Desktop config
├── README.md                # This file
├── config/
│   ├── browsers.json        # Browser settings
│   └── moby-scoring.json    # Score thresholds
└── lib/
    ├── audit-engine.js      # Orchestrates all checks
    ├── browser-manager.js   # Handles browsers
    ├── moby-scorer.js       # Calculates Moby Score
    ├── contrast-checker.js  # Color contrast
    ├── keyboard-tester.js   # Keyboard navigation
    ├── cognitive-checker.js # Reading level
    ├── care-sector-checks.js # NHS/CQC
    └── pdf-generator.js     # Creates PDFs
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **axe-core** - Deque Systems
- **Pa11y** - Pa11y team  
- **Lighthouse** - Google
- **Playwright** - Microsoft
- **Puppeteer** - Google
- **IBM Equal Access** - IBM

## 🐕 Why "Moby"?

Named after my dog - because accessibility should be straightforward, reliable, and friendly. No corporate jargon, just clear results that help real people access care services.

---

## 📚 Want to Build Tools Like This?

This tool was built using the process documented in **["The Business Analyst's Guide to AI-Assisted Tool Development"](https://gumroad.com/l/ba-ai-tools)**.

Learn how to:
- Identify workflows worth automating
- Work effectively with AI as a collaborator
- Build production-ready tools without being a developer
- Avoid common pitfalls and mistakes

**£5 • Real code • Real examples • Real process**

Available February 4th, 2025

---

**Questions?** Open an issue  
**Want to help?** Submit a PR  
**Found it useful?** Star the repo ⭐

Made with ❤️ by James at The Access Group
"# Moby-Accessibility-Checker-MCP" 
