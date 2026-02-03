# 🐕 THE MOBY ACCESSIBILITY CHECKER
## One-Click Install Package for Claude Desktop

**Created by:** James, Business Analyst,
**Version:** 1.0.0  
**Installation Time:** 2 minutes  
**First Audit:** 60 seconds

---

## What This Does

Runs comprehensive accessibility audits on any website and generates **The Moby Score** - a clear 0-100 rating that tells you exactly how accessible your site is.

### The Tagline
*"Like a good dog, your website should be excited to greet everyone - no matter how they arrive at the door."*

### Why "Moby"?
Named after my dog - because accessibility should be straightforward, reliable, and friendly. No corporate jargon, just clear results.

---

## Key Features

### 1. One Simple Score
Instead of: *"143 violations, 67 warnings, 12 best practices"*  
You get: **Score: 72/100 - REQUIRES IMPROVEMENT**

Clear ratings everyone understands:
- 90-100: OUTSTANDING 🐕
- 75-89: GOOD
- 60-74: REQUIRES IMPROVEMENT
- 40-59: INADEQUATE
- 0-39: CRITICAL

### 2. 10 Free Tools in One
Runs simultaneously:
- axe-core (90+ rules)
- Pa11y (HTML_CodeSniffer)
- Lighthouse (Google)
- IBM Equal Access
- Custom contrast checker
- Keyboard navigation tester
- ARIA validator
- Cognitive checker (reading level)
- Form auditor
- Care sector checker (NHS/CQC)

### 3. UK Legal Compliance Built-In
Automatically checks against:
- Public Sector Bodies Regulations 2018
- Equality Act 2010
- CQC Safe & Effective standards
- NHS Digital Service Standard

Tells you: **"Risk Level: HIGH - Not compliant"** or **"Risk Level: LOW - Compliant"**

### 4. Care Sector Specific
Extra checks for:
- Emergency button accessibility
- Text size for elderly users (beyond WCAG)
- Health information clarity
- Care record form accessibility
- Medication dosage readability

### 5. Actionable Fixes
Every issue shows:
```
CRITICAL #1: Low Contrast

Current Code (line 156):
.btn { color: #888; background: #ddd; }
Ratio: 2.8:1 (FAIL)

✓ Fixed Code:
.btn { color: #222; background: #ddd; }
Ratio: 7.2:1 (PASS AA & AAA)

Effort: 5 minutes | Priority: P0
```

### 6. Professional PDF Reports
- Executive summary
- Moby Score with rating
- Issues grouped by severity
- Screenshots of problems
- Before/after code fixes
- UK legal compliance status
- Prioritised action plan
- Estimated days to fix

### 7. Cross-Browser Testing
Tests on Chromium, Firefox, WebKit  
Finds browser-specific issues

---

## Installation

**Windows:** Run `install.bat`  
**Mac/Linux:** Run `./install.sh`

That's it. Installer handles everything:
- Dependencies
- Browser downloads
- Claude Desktop config
- Testing

---

## Usage

### Basic Audit
```
User: Check accessibility for https://example.com
Claude: Full audit or summary?
User: Full
```

Result in 60 seconds:
- Moby Score: 72/100
- Rating: REQUIRES IMPROVEMENT
- 3 critical, 12 serious, 24 moderate, 8 minor issues
- Legal compliance: NOT MET
- Path to compliance: 5 days work

### Generate Report
```
User: Generate PDF report
```

Professional PDF saved to `/reports/` folder

### Quick Checks
```
Check color contrast on https://example.com
Test keyboard navigation for https://example.com
Compare browsers for https://example.com
```

---

## What Gets Checked

**Visual:** Color contrast, text size, focus indicators  
**Keyboard:** Tab order, focus traps, skip links  
**ARIA:** Labels, roles, states, properties  
**Forms:** Labels, error messages, autocomplete  
**Content:** Reading level, sentence complexity, jargon  
**Structure:** Headings, landmarks, page structure  
**Media:** Alt text, captions, transcripts  
**Care Sector:** Emergency features, elderly-friendly text, health info clarity  
**Legal:** WCAG 2.1 A/AA/AAA, UK regulations

---

## For Different Roles

### Developers
- Copy-paste fixes from reports
- Test as you build
- Catch issues before QA

### Business Analysts
- Generate acceptance criteria
- Write user stories with WCAG refs
- Estimate effort from report timings

### Project Managers
- Show executives clear scores
- Track monthly improvements
- Demonstrate compliance for CQC

### QA/Testers
- Run before every release
- Generate inspection evidence
- Validate fixes work

---

## Real Results

### Before
*"Our site has accessibility issues but we don't know what they are or how urgent they are or what to fix first..."*

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

Now you have a plan.

---

## Why This Beats Other Tools

| Other Tools | The Moby Checker |
|-------------|------------------|
| 143 violations listed | One score: 72/100 |
| "Fix these" | "Fix these in 5 days" |
| Generic warnings | UK legal compliance |
| No care focus | NHS/CQC checks built-in |
| Pay per scan | Completely free |
| One tool at a time | 10 tools simultaneously |
| Technical output | Executive summary included |
| No priorities | P0/P1/P2/P3 with timings |

---

## Package Contents

```
moby-accessibility-checker/
├── install.bat                (Windows installer)
├── install.sh                 (Mac/Linux installer)
├── package.json               (Dependencies)
├── manifest.json              (Claude Desktop config)
├── index.js                   (MCP server)
├── README.md                  (Full documentation)
├── QUICK_START.md             (2-minute guide)
├── config/
│   ├── browsers.json          (Browser settings)
│   └── moby-scoring.json      (Score thresholds)
└── lib/
    ├── browser-manager.js     (Cross-browser support)
    ├── audit-engine.js        (Main orchestrator)
    ├── moby-scorer.js         (Score calculator)
    ├── contrast-checker.js    (Color contrast)
    ├── keyboard-tester.js     (Keyboard nav)
    ├── cognitive-checker.js   (Reading level)
    ├── care-sector-checks.js  (NHS/CQC)
    └── pdf-generator.js       (Report builder)
```

---

## Distribution

### For Your Team
1. Share this folder
2. They run installer
3. They're ready to use it

### For Other BA Teams
- Works for any sector (not just care)
- Customizable scoring thresholds
- Can disable care-specific checks
- Universal WCAG compliance

### For Wider Anthropic Community
- MIT License (use freely)
- No API keys needed
- 100% free tools
- Open source friendly

---

## Technical Requirements

- **Node.js 18+** (check: `node --version`)
- **5GB disk space** (for browsers)
- **Windows/Mac/Linux**
- **Claude Desktop** (free or Pro)

---

## Future Enhancements

Possible additions:
- Historical trending (track Moby Score over time)
- Email alerts when score drops
- Automated monthly audits
- Team dashboards
- API for CI/CD pipelines
- Slack notifications

---

## Support

**Questions?** Check the README.md  
**Issues?** Check QUICK_START.md troubleshooting  
**Want changes?** Edit config files  
**Need help?** Ask Claude - it knows this tool inside out

---

## The Bottom Line

You ask Claude:
```
Check accessibility for https://our-care-system.com
```

60 seconds later:
- ✅ Moby Score calculated
- ✅ 10 tools run
- ✅ Issues prioritised
- ✅ Fixes provided
- ✅ Legal compliance checked
- ✅ PDF ready for stakeholders

**That's the power of The Moby Checker.** 🐕

---

*Named after Moby - because accessibility should be straightforward, reliable, and friendly.*

*Built by James 