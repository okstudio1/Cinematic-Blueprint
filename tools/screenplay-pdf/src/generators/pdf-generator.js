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
      // The Chrome sandbox stays on: this renders screenplay files supplied by
      // the user, and the sandbox is what keeps a renderer bug from becoming
      // code execution on the host. Only opt out via PUPPETEER_NO_SANDBOX in
      // containers that genuinely cannot provide it.
      const args = ['--disable-dev-shm-usage'];
      if (process.env.PUPPETEER_NO_SANDBOX === '1') {
        console.warn('Warning: Chrome sandbox disabled via PUPPETEER_NO_SANDBOX.');
        args.push('--no-sandbox', '--disable-setuid-sandbox');
      }

      // 'new' was removed as a headless value in Puppeteer 23; true is the
      // modern-headless setting.
      this.browser = await puppeteer.launch({ headless: true, args });
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
   * Blocks outbound requests during rendering.
   *
   * The rendered screenplay is fully self-contained (inline CSS, no images), so
   * nothing legitimate needs the network. Blocking it means a crafted input can
   * never turn PDF generation into an outbound request from the user's machine.
   * Set PUPPETEER_ALLOW_NETWORK=1 if a custom stylesheet needs remote fonts.
   */
  async _isolate(page) {
    if (process.env.PUPPETEER_ALLOW_NETWORK === '1') return;

    await page.setRequestInterception(true);
    page.on('request', req => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('about:') || url.startsWith('blob:')) {
        req.continue();
      } else {
        req.abort();
      }
    });
  }

  /**
   * Generate PDF from HTML string
   */
  async generateFromHTML(html, outputPath) {
    await this.init();

    const page = await this.browser.newPage();

    try {
      await this._isolate(page);

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
      await this._isolate(page);

      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      
      const bytes = await page.pdf({
        format: this.options.format,
        margin: this.options.margin,
        printBackground: this.options.printBackground,
        displayHeaderFooter: this.options.displayHeaderFooter,
        headerTemplate: this.options.headerTemplate,
        footerTemplate: this.options.footerTemplate
      });

      // Puppeteer 23+ resolves page.pdf() to a Uint8Array rather than a Buffer.
      return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    } finally {
      await page.close();
    }
  }
}

module.exports = { PDFGenerator };
