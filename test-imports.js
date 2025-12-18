#!/usr/bin/env node

// Simple test to see what's failing
console.error('[TEST] Starting imports...');

try {
  console.error('[TEST] Importing SDK...');
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  console.error('[TEST] SDK imported OK');
  
  console.error('[TEST] Importing BrowserManager...');
  const BrowserManagerModule = await import('./lib/browser-manager.js');
  console.error('[TEST] BrowserManager imported OK');
  
  console.error('[TEST] Importing AuditEngine...');
  const AuditEngineModule = await import('./lib/audit-engine.js');
  console.error('[TEST] AuditEngine imported OK');
  
  console.error('[TEST] Importing MobyScorer...');
  const MobyScorerModule = await import('./lib/moby-scorer.js');
  console.error('[TEST] MobyScorer imported OK');
  
  console.error('[TEST] Importing PDFGenerator...');
  const PDFGeneratorModule = await import('./lib/pdf-generator.js');
  console.error('[TEST] PDFGenerator imported OK');
  
  console.error('[TEST] All imports successful!');
  process.exit(0);
  
} catch (error) {
  console.error('[TEST] ERROR:', error.message);
  console.error('[TEST] Stack:', error.stack);
  process.exit(1);
}
