/**
 * Screenplay PDF Generator
 * 
 * Main module that orchestrates markdown parsing, fountain conversion,
 * and PDF generation.
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const { MarkdownToFountainParser } = require('./parsers/markdown-to-fountain');
const { FountainParser } = require('./parsers/fountain-parser');
const { HTMLRenderer } = require('./renderers/html-renderer');
const { PDFGenerator } = require('./generators/pdf-generator');

class ScreenplayPDF {
  constructor(options = {}) {
    this.options = {
      title: 'Untitled Screenplay',
      author: '',
      draftDate: new Date().toLocaleDateString(),
      contact: '',
      ...options
    };
    
    this.mdParser = new MarkdownToFountainParser({
      titlePage: {
        title: this.options.title,
        credit: 'Written by',
        author: this.options.author,
        draftDate: this.options.draftDate,
        contact: this.options.contact
      }
    });
    
    this.fountainParser = new FountainParser();
    this.htmlRenderer = new HTMLRenderer();
    this.pdfGenerator = new PDFGenerator();
  }

  /**
   * Convert a single markdown file to PDF
   */
  async convertFile(inputPath, outputPath) {
    const content = await fs.readFile(inputPath, 'utf-8');
    const fountain = this.mdParser.parse(content);
    const tokens = this.fountainParser.parse(fountain);
    const html = this.htmlRenderer.render(tokens, this.options.title);
    
    await this.pdfGenerator.generateFromHTML(html, outputPath);
    await this.pdfGenerator.close();
    
    return outputPath;
  }

  /**
   * Convert a directory of markdown files to a single PDF
   */
  async convertDirectory(inputDir, outputPath, pattern = '*.md') {
    // Find all markdown files
    const files = await glob(path.join(inputDir, pattern), {
      windowsPathsNoEscape: true
    });
    
    // Sort files naturally (01_, 02_, etc.)
    files.sort((a, b) => {
      const nameA = path.basename(a);
      const nameB = path.basename(b);
      return nameA.localeCompare(nameB, undefined, { numeric: true });
    });
    
    if (files.length === 0) {
      throw new Error(`No markdown files found in ${inputDir} matching ${pattern}`);
    }
    
    // Read all files
    const fileContents = await Promise.all(
      files.map(async (filePath) => ({
        path: filePath,
        name: path.basename(filePath),
        content: await fs.readFile(filePath, 'utf-8')
      }))
    );
    
    // Convert to Fountain
    const fountain = this.mdParser.parseMultiple(fileContents);
    
    // Parse Fountain to tokens
    const tokens = this.fountainParser.parse(fountain);
    
    // Render to HTML
    const html = this.htmlRenderer.render(tokens, this.options.title);
    
    // Generate PDF
    await this.pdfGenerator.generateFromHTML(html, outputPath);
    await this.pdfGenerator.close();
    
    return {
      outputPath,
      filesProcessed: files.length,
      files: files.map(f => path.basename(f))
    };
  }

  /**
   * Convert markdown string directly to PDF buffer
   */
  async convertString(markdown) {
    const fountain = this.mdParser.parse(markdown);
    const tokens = this.fountainParser.parse(fountain);
    const html = this.htmlRenderer.render(tokens, this.options.title);
    
    const buffer = await this.pdfGenerator.generateBuffer(html);
    await this.pdfGenerator.close();
    
    return buffer;
  }

  /**
   * Convert Fountain string directly to PDF
   */
  async convertFountain(fountain, outputPath) {
    const tokens = this.fountainParser.parse(fountain);
    const html = this.htmlRenderer.render(tokens, this.options.title);
    
    await this.pdfGenerator.generateFromHTML(html, outputPath);
    await this.pdfGenerator.close();
    
    return outputPath;
  }

  /**
   * Preview: Generate HTML only (for debugging)
   */
  async generateHTML(inputDir, outputPath, pattern = '*.md') {
    const files = await glob(path.join(inputDir, pattern), {
      windowsPathsNoEscape: true
    });
    
    files.sort((a, b) => {
      const nameA = path.basename(a);
      const nameB = path.basename(b);
      return nameA.localeCompare(nameB, undefined, { numeric: true });
    });
    
    const fileContents = await Promise.all(
      files.map(async (filePath) => ({
        path: filePath,
        name: path.basename(filePath),
        content: await fs.readFile(filePath, 'utf-8')
      }))
    );
    
    const fountain = this.mdParser.parseMultiple(fileContents);
    const tokens = this.fountainParser.parse(fountain);
    const html = this.htmlRenderer.render(tokens, this.options.title);
    
    await fs.writeFile(outputPath, html, 'utf-8');
    
    return outputPath;
  }
}

module.exports = { 
  ScreenplayPDF,
  MarkdownToFountainParser,
  FountainParser,
  HTMLRenderer,
  PDFGenerator
};
