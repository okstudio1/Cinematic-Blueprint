#!/usr/bin/env node

/**
 * Screenplay PDF CLI
 * 
 * Command-line interface for converting screenplay files to PDF.
 * 
 * Usage:
 *   screenplay-pdf --input <dir> --output <file.pdf> [options]
 *   screenplay-pdf -i ./Scenes -o screenplay.pdf --title "My Movie"
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { ScreenplayPDF } = require('../src/index');

const program = new Command();

program
  .name('screenplay-pdf')
  .description('Convert markdown screenplay files to professionally formatted PDF')
  .version('1.0.0');

program
  .requiredOption('-i, --input <path>', 'Input directory containing .md files or single .md file')
  .requiredOption('-o, --output <path>', 'Output PDF file path')
  .option('-t, --title <title>', 'Screenplay title', 'Untitled Screenplay')
  .option('-a, --author <author>', 'Author name', '')
  .option('-d, --draft-date <date>', 'Draft date', new Date().toLocaleDateString())
  .option('-c, --contact <contact>', 'Contact information', '')
  .option('-p, --pattern <glob>', 'File pattern to match (default: *.md)', '*.md')
  .option('--html', 'Also output HTML file for preview')
  .option('-v, --verbose', 'Verbose output');

program.parse();

const options = program.opts();

async function main() {
  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output);
  
  // Validate input exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input path does not exist: ${inputPath}`);
    process.exit(1);
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  if (options.verbose) {
    console.log('Screenplay PDF Generator');
    console.log('========================');
    console.log(`Input:  ${inputPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Title:  ${options.title}`);
    console.log(`Author: ${options.author || '(none)'}`);
    console.log('');
  }
  
  const converter = new ScreenplayPDF({
    title: options.title,
    author: options.author,
    draftDate: options.draftDate,
    contact: options.contact
  });
  
  try {
    const stats = fs.statSync(inputPath);
    
    if (stats.isDirectory()) {
      // Convert directory of files
      if (options.verbose) {
        console.log(`Scanning for files matching: ${options.pattern}`);
      }
      
      const result = await converter.convertDirectory(inputPath, outputPath, options.pattern);
      
      console.log(`✓ Converted ${result.filesProcessed} files to ${outputPath}`);
      
      if (options.verbose) {
        console.log('\nFiles processed:');
        result.files.forEach(f => console.log(`  - ${f}`));
      }
      
      // Generate HTML preview if requested
      if (options.html) {
        const htmlPath = outputPath.replace(/\.pdf$/i, '.html');
        await converter.generateHTML(inputPath, htmlPath, options.pattern);
        console.log(`✓ HTML preview: ${htmlPath}`);
      }
      
    } else {
      // Convert single file
      await converter.convertFile(inputPath, outputPath);
      console.log(`✓ Converted ${path.basename(inputPath)} to ${outputPath}`);
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
