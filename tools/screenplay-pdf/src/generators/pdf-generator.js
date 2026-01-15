/**
 * PDF Generator
 * 
 * Generates PDF from HTML using Puppeteer (headless Chrome).
 * Handles proper page sizing, margins, and page numbers for screenplays.
 */

const puppeteer = require('puppeteer');

class PDFGenerator {
  constructor(options = {}) {
    this.options = {
      format: 'Letter',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1.5in'
      },
      printBackground: false,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-family: 'Courier New', monospace; font-size: 12pt; width: 100%; text-align: right; padding-right: 1in;">
          <span class="pageNumber"></span>.
        </div>
      `,
      ...options
    };
    
    this.browser = null;
  }

  /**
   * Initialize browser instance
   */
  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  /**
   * Close browser instance
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate PDF from HTML string
   */
  async generateFromHTML(html, outputPath) {
    await this.init();
    
    const page = await this.browser.newPage();
    
    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      
      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: this.options.format,
        margin: this.options.margin,
        printBackground: this.options.printBackground,
        displayHeaderFooter: this.options.displayHeaderFooter,
        headerTemplate: this.options.headerTemplate,
        footerTemplate: this.options.footerTemplate
      });
      
      return outputPath;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate PDF buffer (for streaming/API use)
   */
  async generateBuffer(html) {
    await this.init();
    
    const page = await this.browser.newPage();
    
    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      
      const buffer = await page.pdf({
        format: this.options.format,
        margin: this.options.margin,
        printBackground: this.options.printBackground,
        displayHeaderFooter: this.options.displayHeaderFooter,
        headerTemplate: this.options.headerTemplate,
        footerTemplate: this.options.footerTemplate
      });
      
      return buffer;
    } finally {
      await page.close();
    }
  }
}

module.exports = { PDFGenerator };
