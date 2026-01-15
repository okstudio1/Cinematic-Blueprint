/**
 * Basic test script for screenplay-pdf
 * Run: node test/test.js
 */

const path = require('path');
const fs = require('fs');
const { MarkdownToFountainParser } = require('../src/parsers/markdown-to-fountain');
const { FountainParser } = require('../src/parsers/fountain-parser');
const { HTMLRenderer } = require('../src/renderers/html-renderer');

// Test the parsers without needing Puppeteer
async function testParsers() {
  console.log('Testing Screenplay PDF Parsers\n');
  console.log('='.repeat(40));
  
  // Read sample file
  const samplePath = path.join(__dirname, 'sample.md');
  const markdown = fs.readFileSync(samplePath, 'utf-8');
  
  console.log('\n1. Original Markdown (first 500 chars):');
  console.log('-'.repeat(40));
  console.log(markdown.slice(0, 500) + '...\n');
  
  // Parse markdown to fountain
  const mdParser = new MarkdownToFountainParser({
    titlePage: {
      title: 'Test Screenplay',
      author: 'Test Author'
    }
  });
  
  const fountain = mdParser.parse(markdown);
  
  console.log('2. Converted to Fountain (first 500 chars):');
  console.log('-'.repeat(40));
  console.log(fountain.slice(0, 500) + '...\n');
  
  // Parse fountain to tokens
  const fountainParser = new FountainParser();
  const tokens = fountainParser.parse(fountain);
  
  console.log('3. Parsed Tokens:');
  console.log('-'.repeat(40));
  console.log(`Total tokens: ${tokens.length}`);
  
  // Count by type
  const counts = {};
  tokens.forEach(t => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });
  
  Object.entries(counts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Render to HTML
  const htmlRenderer = new HTMLRenderer();
  const html = htmlRenderer.render(tokens, 'Test Screenplay');
  
  console.log('\n4. Generated HTML:');
  console.log('-'.repeat(40));
  console.log(`HTML length: ${html.length} characters`);
  
  // Write HTML for manual inspection
  const htmlPath = path.join(__dirname, 'output.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`Written to: ${htmlPath}`);
  
  console.log('\n' + '='.repeat(40));
  console.log('✓ Parser tests complete!');
  console.log('Open test/output.html in a browser to preview.');
}

testParsers().catch(console.error);
