/**
 * HTML Renderer
 * 
 * Converts parsed Fountain tokens to HTML with proper screenplay classes
 * for styling with CSS.
 */

const { TokenType } = require('../parsers/fountain-parser');
const path = require('path');
const fs = require('fs');

class HTMLRenderer {
  constructor(options = {}) {
    this.options = {
      includeStyles: true,
      customCss: null,
      pageNumbers: true,
      ...options
    };
  }

  /**
   * Render tokens to complete HTML document
   */
  render(tokens, title = 'Screenplay') {
    const body = this.renderTokens(tokens);
    const css = this.getStyles();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  ${this.options.includeStyles ? `<style>${css}</style>` : ''}
  ${this.options.customCss ? `<style>${this.options.customCss}</style>` : ''}
</head>
<body>
  <div class="screenplay">
${body}
  </div>
</body>
</html>`;
  }

  /**
   * Render tokens to HTML body content
   */
  renderTokens(tokens) {
    const parts = [];
    
    for (const token of tokens) {
      switch (token.type) {
        case TokenType.TITLE_PAGE:
          parts.push(this.renderTitlePage(token.content));
          break;
          
        case TokenType.SCENE_HEADING:
          parts.push(`    <div class="scene-heading">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.ACTION:
          parts.push(`    <div class="action">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.CHARACTER:
          parts.push(`    <div class="character">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.PARENTHETICAL:
          parts.push(`    <div class="parenthetical">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.DIALOGUE:
          parts.push(`    <div class="dialogue">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.TRANSITION:
          parts.push(`    <div class="transition">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.CENTERED:
          parts.push(`    <div class="centered">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.PAGE_BREAK:
          parts.push(`    <div class="page-break"></div>`);
          break;
          
        case TokenType.SECTION:
          parts.push(`    <h${token.level} class="section section-${token.level}">${this.escapeHtml(token.content)}</h${token.level}>`);
          break;
          
        case TokenType.NOTE:
          parts.push(`    <div class="note">${this.escapeHtml(token.content)}</div>`);
          break;
          
        case TokenType.BLANK:
          // Skip blanks - spacing handled by CSS
          break;
      }
    }
    
    return parts.join('\n');
  }

  /**
   * Render title page
   */
  renderTitlePage(info) {
    const parts = ['    <div class="title-page">'];
    
    if (info.title) {
      parts.push(`      <div class="title">${this.escapeHtml(info.title)}</div>`);
    }
    
    if (info.credit) {
      parts.push(`      <div class="credit">${this.escapeHtml(info.credit)}</div>`);
    }
    
    if (info.author || info.authors) {
      parts.push(`      <div class="author">${this.escapeHtml(info.author || info.authors)}</div>`);
    }
    
    if (info.source) {
      parts.push(`      <div class="source">${this.escapeHtml(info.source)}</div>`);
    }
    
    const bottomInfo = [];
    if (info.draft_date) bottomInfo.push(info.draft_date);
    if (info.contact) bottomInfo.push(info.contact);
    if (info.copyright) bottomInfo.push(info.copyright);
    
    if (bottomInfo.length > 0) {
      parts.push(`      <div class="contact">${bottomInfo.map(i => this.escapeHtml(i)).join('<br>')}</div>`);
    }
    
    parts.push('    </div>');
    return parts.join('\n');
  }

  /**
   * Get CSS styles
   */
  getStyles() {
    return `
/* Screenplay PDF Styles - Industry Standard Format */

@page {
  size: letter;
  margin: 1in;
  
  @top-right {
    content: counter(page) ".";
    font-family: "Courier Prime", "Courier New", Courier, monospace;
    font-size: 12pt;
  }
}

@page:first {
  @top-right {
    content: "";
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Courier Prime", "Courier New", Courier, monospace;
  font-size: 12pt;
  line-height: 1;
  background: white;
  color: black;
}

.screenplay {
  max-width: 6in;
  margin: 0 auto;
  padding: 0;
}

/* Title Page */
.title-page {
  page-break-after: always;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2in 0;
}

.title-page .title {
  font-size: 24pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 24pt;
}

.title-page .credit {
  font-size: 12pt;
  margin-bottom: 12pt;
}

.title-page .author {
  font-size: 12pt;
  margin-bottom: 48pt;
}

.title-page .source {
  font-size: 12pt;
  font-style: italic;
  margin-bottom: 12pt;
}

.title-page .contact {
  position: absolute;
  bottom: 1in;
  left: 1in;
  text-align: left;
  font-size: 12pt;
}

/* Scene Heading */
.scene-heading {
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 24pt;
  margin-bottom: 12pt;
  page-break-after: avoid;
}

/* Action */
.action {
  margin-bottom: 12pt;
  white-space: pre-wrap;
}

/* Character */
.character {
  margin-left: 2.2in;
  margin-top: 12pt;
  margin-bottom: 0;
  text-transform: uppercase;
  page-break-after: avoid;
}

/* Parenthetical */
.parenthetical {
  margin-left: 1.6in;
  margin-right: 1.6in;
  margin-bottom: 0;
  page-break-before: avoid;
  page-break-after: avoid;
}

/* Dialogue */
.dialogue {
  margin-left: 1in;
  margin-right: 1in;
  margin-bottom: 12pt;
  page-break-before: avoid;
}

/* Transition */
.transition {
  text-align: right;
  text-transform: uppercase;
  margin-top: 12pt;
  margin-bottom: 12pt;
}

/* Centered */
.centered {
  text-align: center;
  margin-top: 12pt;
  margin-bottom: 12pt;
}

/* Page Break */
.page-break {
  page-break-after: always;
}

/* Section Headers */
.section {
  font-weight: bold;
  margin-top: 24pt;
  margin-bottom: 12pt;
  display: none; /* Hidden by default - they're for organization */
}

/* Notes */
.note {
  background: #ffffcc;
  padding: 6pt;
  margin: 12pt 0;
  font-style: italic;
  border-left: 3pt solid #ffcc00;
}

/* Print-specific */
@media print {
  body {
    background: white;
  }
  
  .screenplay {
    max-width: none;
  }
  
  .note {
    display: none; /* Hide notes in print */
  }
}
`;
  }

  /**
   * Escape HTML entities
   */
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }
}

module.exports = { HTMLRenderer };
