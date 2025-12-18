# 🐕 The Moby Accessibility Checker - Quick Start

## Installation (Takes 2 minutes)

### Windows
1. Open Command Prompt in this folder
2. Run: `install.bat`
3. Wait for installation to complete
4. Restart Claude Desktop

### Mac/Linux
1. Open Terminal in this folder
2. Run: `chmod +x install.sh && ./install.sh`
3. Wait for installation to complete
4. Restart Claude Desktop

## First Use

In Claude, just say:
```
Check accessibility for https://your-site.com
```

Claude will ask "Full audit or summary?" - pick one.

You'll get:
- **The Moby Score** (0-100)
- Rating (Outstanding/Good/Requires Improvement/etc.)
- List of all issues with fixes
- UK legal compliance status
- Estimated time to fix

Then say:
```
Generate PDF report
```

You'll get a professional PDF with:
- Cover page with Moby Score
- Executive summary
- All issues with before/after code
- Prioritised action plan
- UK legal compliance section

## What Makes This Special?

### 1. The Moby Score
Instead of saying "143 violations found", you get:
- **Score: 72/100 - REQUIRES IMPROVEMENT**
- Clear ratings everyone understands
- Path to legal compliance

### 2. UK Legal Focus
Checks against:
- Public Sector Bodies Regulations 2018
- Equality Act 2010
- CQC Safe & Effective standards

### 3. Care Sector Specific
Extra checks for:
- Emergency features (crisis buttons)
- Text size for elderly users
- Health information clarity
- Care record accessibility

### 4. Actionable Fixes
Every issue includes:
```
Current Code:
.btn { color: #888; background: #ddd; }

Fixed Code:
.btn { color: #222; background: #ddd; }

Effort: 5 minutes | Priority: P0
```

### 5. 10 Free Tools
Runs comprehensive checks from:
- axe-core, Pa11y, Lighthouse
- IBM Equal Access
- Custom contrast/keyboard/ARIA checkers
- Care sector validator

### 6. Cross-Browser
Tests on:
- Chromium (Chrome, Edge, Brave)
- Firefox
- WebKit (Safari)

## Example Commands

**Full audit:**
```
Audit accessibility for https://care-home.com
```

**Just contrast:**
```
Check color contrast on https://example.com
```

**Just keyboard:**
```
Test keyboard navigation for https://example.com
```

**Compare browsers:**
```
Compare browser accessibility for https://example.com
```

**Care sector check:**
```
Check NHS and CQC standards for https://example.com
```

## Scoring Guide

- **90-100: OUTSTANDING** 🐕 - Moby approves! Legal compliant
- **75-89: GOOD** - Minor fixes needed, likely compliant
- **60-74: REQUIRES IMPROVEMENT** - Significant work needed
- **40-59: INADEQUATE** - Major failures, high legal risk
- **0-39: CRITICAL** - Immediate action required

## Troubleshooting

**Not working?**
1. Check Node.js installed: `node --version` (need 18+)
2. Restart Claude Desktop
3. Check config file exists (see README.md)

**Browsers not installing?**
```
npx playwright install chromium firefox webkit
```

**Want to customize?**
- Edit `config/browsers.json` for browser settings
- Edit `config/moby-scoring.json` for score thresholds

## What Gets Checked

- ✅ Color contrast (WCAG AA/AAA)
- ✅ Keyboard navigation & focus
- ✅ ARIA labels and roles
- ✅ Form labels and errors
- ✅ Reading level & complexity
- ✅ Screen reader compatibility
- ✅ Skip navigation links
- ✅ Emergency feature accessibility
- ✅ Text size for elderly
- ✅ Health information clarity
- ✅ And 90+ more WCAG checks

## For Your Team

**Developers:**
- Copy-paste code fixes from report
- Test as you build with quick checks
- Compare browsers to find edge cases

**Business Analysts:**
- Generate test cases from issues
- Write acceptance criteria with WCAG refs
- Estimate effort using report timings

**Project Managers:**
- Show executives clear Moby Score
- Track improvement over time
- Demonstrate CQC compliance

**QA/Testers:**
- Run full audit before release
- Generate evidence for inspections
- Validate fixes with re-testing

---

**That's it!** You now have a professional accessibility auditor that:
1. Runs 10+ free tools in one go
2. Gives you a clear score (not 500 warnings)
3. Provides exact code fixes
4. Checks UK legal compliance
5. Generates professional PDFs

Named after Moby - because accessibility should be straightforward, reliable, and friendly. 🐕
