#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import BrowserManager from './lib/browser-manager.js';
import AuditEngine from './lib/audit-engine.js';
import MobyScorer from './lib/moby-scorer.js';
import PDFGenerator from './lib/pdf-generator.js';

const server = new Server(
  {
    name: 'moby-accessibility-checker',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const browserManager = new BrowserManager();
const auditEngine = new AuditEngine();
const mobyScorer = new MobyScorer();
const pdfGenerator = new PDFGenerator();

// Define all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'audit_accessibility',
        description: 'Run comprehensive accessibility audit with The Moby Score. Returns detailed analysis of WCAG compliance, UK legal requirements, and care sector standards.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to audit (e.g., https://example.com)',
            },
            mode: {
              type: 'string',
              enum: ['summary', 'full'],
              description: 'summary = quick scan (60s), full = comprehensive audit (3-5min)',
              default: 'full',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit', 'all'],
              description: 'Browser to test with. Use "all" for cross-browser comparison',
              default: 'chromium',
            },
            wcag_level: {
              type: 'string',
              enum: ['A', 'AA', 'AAA'],
              description: 'WCAG compliance level to test against',
              default: 'AA',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'generate_pdf_report',
        description: 'Generate professional PDF report with The Moby Score, issues, fixes, and UK legal compliance summary.',
        inputSchema: {
          type: 'object',
          properties: {
            audit_id: {
              type: 'string',
              description: 'ID of completed audit (returned from audit_accessibility)',
            },
            include_screenshots: {
              type: 'boolean',
              description: 'Include annotated screenshots of issues',
              default: true,
            },
            include_code_snippets: {
              type: 'boolean',
              description: 'Include before/after code examples',
              default: true,
            },
            group_by: {
              type: 'string',
              enum: ['severity', 'wcag-principle', 'page-section'],
              description: 'How to organize issues in report',
              default: 'severity',
            },
          },
          required: ['audit_id'],
        },
      },
      {
        name: 'check_color_contrast',
        description: 'Detailed color contrast analysis against WCAG AA/AAA standards. Tests all text elements.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to check',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
            level: {
              type: 'string',
              enum: ['AA', 'AAA'],
              description: 'WCAG level to test against',
              default: 'AA',
            },
            selector: {
              type: 'string',
              description: 'Optional: CSS selector to check specific elements only',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'test_keyboard_navigation',
        description: 'Test keyboard-only navigation. Records tab order, identifies focus traps, checks skip links.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to test',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
            start_selector: {
              type: 'string',
              description: 'Optional: Start testing from specific element',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'validate_aria_labels',
        description: 'Validate ARIA attributes, labels, and roles. Checks all interactive elements.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to validate',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
            check_interactive_only: {
              type: 'boolean',
              description: 'Only check buttons, links, inputs (faster)',
              default: true,
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'audit_form_accessibility',
        description: 'Comprehensive form accessibility check. Labels, error messages, field associations, autocomplete.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL with form to audit',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
            form_selector: {
              type: 'string',
              description: 'Optional: Specific form to check',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'check_cognitive_accessibility',
        description: 'Analyze reading level, sentence complexity, jargon usage. Care sector focus (elderly users).',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to analyze',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'check_care_sector_standards',
        description: 'Care sector specific checks: NHS standards, CQC requirements, emergency feature accessibility.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to check',
            },
            browser: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser to use',
              default: 'chromium',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'compare_browsers',
        description: 'Run same audit across all browsers. Identifies browser-specific accessibility issues.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to test',
            },
            wcag_level: {
              type: 'string',
              enum: ['A', 'AA', 'AAA'],
              description: 'WCAG level',
              default: 'AA',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'get_moby_score',
        description: 'Calculate The Moby Score (0-100) from audit results. Includes rating and improvement suggestions.',
        inputSchema: {
          type: 'object',
          properties: {
            audit_id: {
              type: 'string',
              description: 'ID of completed audit',
            },
          },
          required: ['audit_id'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'audit_accessibility': {
        const { url, mode = 'full', browser = 'chromium', wcag_level = 'AA' } = args;
        
        const result = await auditEngine.runFullAudit({
          url,
          mode,
          browser,
          wcagLevel: wcag_level,
          browserManager,
        });

        const mobyScore = await mobyScorer.calculateScore(result);
        result.mobyScore = mobyScore;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'generate_pdf_report': {
        const {
          audit_id,
          include_screenshots = true,
          include_code_snippets = true,
          group_by = 'severity',
        } = args;

        const pdfPath = await pdfGenerator.generate({
          auditId: audit_id,
          includeScreenshots: include_screenshots,
          includeCodeSnippets: include_code_snippets,
          groupBy: group_by,
        });

        return {
          content: [
            {
              type: 'text',
              text: `PDF report generated: ${pdfPath}`,
            },
          ],
        };
      }

      case 'check_color_contrast': {
        const { url, browser = 'chromium', level = 'AA', selector } = args;
        
        const result = await auditEngine.checkColorContrast({
          url,
          browser,
          level,
          selector,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'test_keyboard_navigation': {
        const { url, browser = 'chromium', start_selector } = args;
        
        const result = await auditEngine.testKeyboardNavigation({
          url,
          browser,
          startSelector: start_selector,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'validate_aria_labels': {
        const { url, browser = 'chromium', check_interactive_only = true } = args;
        
        const result = await auditEngine.validateAriaLabels({
          url,
          browser,
          checkInteractiveOnly: check_interactive_only,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'audit_form_accessibility': {
        const { url, browser = 'chromium', form_selector } = args;
        
        const result = await auditEngine.auditFormAccessibility({
          url,
          browser,
          formSelector: form_selector,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'check_cognitive_accessibility': {
        const { url, browser = 'chromium' } = args;
        
        const result = await auditEngine.checkCognitiveAccessibility({
          url,
          browser,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'check_care_sector_standards': {
        const { url, browser = 'chromium' } = args;
        
        const result = await auditEngine.checkCareSectorStandards({
          url,
          browser,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'compare_browsers': {
        const { url, wcag_level = 'AA' } = args;
        
        const result = await auditEngine.compareBrowsers({
          url,
          wcagLevel: wcag_level,
          browserManager,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_moby_score': {
        const { audit_id } = args;
        
        const score = await mobyScorer.getScore(audit_id);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(score, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Moby Accessibility Checker MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
