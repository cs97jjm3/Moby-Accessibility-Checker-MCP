import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { mkdirSync } from 'fs';

class PDFGenerator {
  constructor() {
    this.outputDir = join(process.cwd(), 'reports');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async generate({ auditId, includeScreenshots, includeCodeSnippets, groupBy }) {
    // This would fetch audit results from the audit engine
    // For now, returning a placeholder

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `moby-report-${auditId}-${timestamp}.pdf`;
    const filepath = join(this.outputDir, filename);

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    doc.pipe(createWriteStream(filepath));

    // Build PDF content
    await this.buildCoverPage(doc);
    await this.buildExecutiveSummary(doc);
    await this.buildIssuesSection(doc, groupBy);
    await this.buildRecommendationsSection(doc);
    await this.buildComplianceSection(doc);

    doc.end();

    return filepath;
  }

  async buildCoverPage(doc) {
    // Title
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .text('THE MOBY', 100, 150, { align: 'center' })
       .text('ACCESSIBILITY SCORE™', { align: 'center' });

    // Tagline
    doc.fontSize(12)
       .font('Helvetica-Oblique')
       .moveDown(2)
       .text('"Like a good dog, your website should be excited', { align: 'center' })
       .text('to greet everyone - no matter how they arrive', { align: 'center' })
       .text('at the door."', { align: 'center' });

    // Dog emoji/icon placeholder
    doc.fontSize(48)
       .moveDown(2)
       .text('🐕', { align: 'center' });

    // Score
    doc.fontSize(72)
       .font('Helvetica-Bold')
       .moveDown()
       .text('72/100', { align: 'center' });

    // Rating
    doc.fontSize(24)
       .fillColor('#d97706')
       .text('REQUIRES IMPROVEMENT', { align: 'center' });

    // Details
    doc.fontSize(12)
       .fillColor('#000000')
       .font('Helvetica')
       .moveDown(2)
       .text('Website: https://example.com', { align: 'center' })
       .text(`Date: ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
       .text('WCAG Level: AA', { align: 'center' });

    doc.addPage();
  }

  async buildExecutiveSummary(doc) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('EXECUTIVE SUMMARY');

    doc.fontSize(12)
       .font('Helvetica')
       .moveDown()
       .text('Your website has significant barriers that prevent some disabled users from accessing care information and services.');

    // What this means
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .moveDown()
       .text('WHAT THIS MEANS:');

    doc.fontSize(11)
       .font('Helvetica')
       .list([
         'Some residents cannot book appointments',
         'Staff with visual impairments struggle',
         'Legal compliance risk under Equality Act',
         'CQC inspection concerns',
       ]);

    // Good news
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .moveDown()
       .text('GOOD NEWS:');

    doc.fontSize(11)
       .font('Helvetica')
       .text('Most issues are quick fixes. Estimated 3-5 days of development work to reach "GOOD" rating and legal compliance.');

    // Issue breakdown
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .moveDown(2)
       .text('ISSUE BREAKDOWN');

    const tableData = [
      ['Critical (Must Fix):', '3 issues', '-30 points'],
      ['Serious (Should Fix):', '12 issues', '-36 points'],
      ['Moderate (Nice to Fix):', '24 issues', '-24 points'],
      ['Minor (Polish):', '8 issues', '-2 points'],
    ];

    let y = doc.y + 10;
    doc.fontSize(11).font('Helvetica');

    for (const row of tableData) {
      doc.text(row[0], 50, y, { width: 200, continued: true });
      doc.text(row[1], 250, y, { width: 100, continued: true });
      doc.text(row[2], 350, y, { width: 100 });
      y += 20;
    }

    doc.addPage();
  }

  async buildIssuesSection(doc, groupBy) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('CRITICAL ISSUES');

    doc.fontSize(10)
       .font('Helvetica')
       .moveDown()
       .text('These issues must be fixed immediately. They present legal risk and prevent disabled users from accessing your service.');

    // Example issue
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .moveDown()
       .text('CRITICAL #1: Insufficient Color Contrast');

    doc.fontSize(10)
       .font('Helvetica')
       .text('WCAG: 1.4.3 Contrast (Minimum) - Level AA')
       .text('Detected by: axe-core, Pa11y, Custom checker')
       .text('Impact: 2,500 daily users with low vision cannot read text');

    doc.moveDown()
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Current Implementation:')
       .font('Courier')
       .fillColor('#666666')
       .text('.btn-primary {')
       .text('  color: #6B7280;')
       .text('  background: #E5E7EB;')
       .text('}')
       .text('/* Ratio: 2.8:1 (FAIL - need 4.5:1) */');

    doc.moveDown()
       .fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('✓ Fixed Code:')
       .font('Courier')
       .fillColor('#16a34a')
       .text('.btn-primary {')
       .text('  color: #1F2937;  /* Changed */')
       .text('  background: #E5E7EB;')
       .text('}')
       .text('/* New ratio: 7.2:1 (PASS AA & AAA) */');

    doc.moveDown()
       .fontSize(9)
       .font('Helvetica')
       .fillColor('#000000')
       .text('Effort: 5 minutes | Priority: P0 - Fix immediately | Browser: All browsers affected');

    doc.addPage();
  }

  async buildRecommendationsSection(doc) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('RECOMMENDATIONS');

    doc.fontSize(12)
       .font('Helvetica')
       .moveDown()
       .text('Prioritised action plan to achieve legal compliance and improve user experience:');

    const recommendations = [
      {
        priority: 'P0',
        action: 'Fix 3 critical issues immediately',
        reason: 'Legal risk and user safety concerns',
        days: 2,
        gain: 30,
      },
      {
        priority: 'P1',
        action: 'Address 12 serious issues',
        reason: 'Major barriers preventing disabled users',
        days: 3,
        gain: 36,
      },
      {
        priority: 'P1',
        action: 'Achieve legal compliance (85+ score)',
        reason: 'Meet UK Public Sector Regulations & CQC',
        days: 5,
        gain: null,
      },
    ];

    doc.moveDown();
    let y = doc.y;

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(rec.priority === 'P0' ? '#dc2626' : '#d97706')
         .text(`${i + 1}. [${rec.priority}] ${rec.action}`, 50, y);

      y += 15;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Reason: ${rec.reason}`, 70, y);

      y += 15;
      doc.text(`Estimated: ${rec.days} days${rec.gain ? ` | Expected score gain: +${rec.gain} points` : ''}`, 70, y);

      y += 25;
    }

    doc.addPage();
  }

  async buildComplianceSection(doc) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('UK LEGAL COMPLIANCE');

    doc.fontSize(12)
       .font('Helvetica')
       .moveDown()
       .text('This audit covers requirements under:');

    doc.fontSize(11)
       .moveDown();

    const compliance = [
      { name: 'Public Sector Bodies Regulations 2018 (WCAG 2.1 AA)', status: false },
      { name: 'Equality Act 2010 (Reasonable adjustments)', status: false },
      { name: 'CQC Safe & Effective care standards', status: false },
    ];

    for (const item of compliance) {
      doc.font('Helvetica')
         .fillColor(item.status ? '#16a34a' : '#dc2626')
         .text(item.status ? '✓ PASS' : '✗ FAIL', 50, doc.y, { width: 60, continued: true })
         .fillColor('#000000')
         .text(item.name);
      doc.moveDown(0.5);
    }

    doc.moveDown()
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Current Compliance Level: NON-COMPLIANT')
       .font('Helvetica')
       .text('Critical Barriers for Disabled Users: 3 issues')
       .text('Estimated Time to Legal Compliance: 5 days');

    doc.moveDown(2)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('NEXT STEPS:');

    doc.fontSize(11)
       .font('Helvetica')
       .list([
         'Fix P0 critical issues (legal risk)',
         'Address P1 serious issues (CQC inspection risk)',
         'Implement P2 moderate issues (best practice)',
       ]);

    // Footer
    doc.fontSize(9)
       .fillColor('#666666')
       .text('Generated by The Moby Accessibility Checker', 50, 750, { align: 'center' })
       .text('Named after Moby - because accessibility should be straightforward, reliable, and friendly', { align: 'center' });
  }
}

export default PDFGenerator;
