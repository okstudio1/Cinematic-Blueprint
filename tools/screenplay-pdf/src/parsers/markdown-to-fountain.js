/**
 * Markdown to Fountain Parser
 * 
 * Converts markdown screenplay files (like those in OverPar-Film)
 * to Fountain format for proper screenplay rendering.
 * 
 * Input format (markdown):
 *   ## INT. LOCATION - TIME
 *   Action description.
 *   
 *   ## CHARACTER
 *   (parenthetical)
 *   Dialogue here.
 * 
 * Output format (Fountain):
 *   INT. LOCATION - TIME
 *   
 *   Action description.
 *   
 *   CHARACTER
 *   (parenthetical)
 *   Dialogue here.
 */

class MarkdownToFountainParser {
  constructor(options = {}) {
    this.options = {
      preserveNotes: false,
      titlePage: null,
      ...options
    };
  }

  /**
   * Parse a single markdown file content to Fountain
   */
  parse(markdown) {
    let content = markdown;
    
    // Remove YAML frontmatter
    content = this.removeFrontmatter(content);
    
    // Convert scene headings: ## INT. -> INT.
    content = this.convertSceneHeadings(content);
    
    // Convert character names: ## CHARACTER -> CHARACTER
    content = this.convertCharacterCues(content);
    
    // Remove remaining markdown artifacts
    content = this.cleanMarkdown(content);
    
    // Normalize line breaks and spacing
    content = this.normalizeSpacing(content);
    
    return content;
  }

  /**
   * Parse multiple files and combine into single screenplay
   */
  parseMultiple(files) {
    let combined = '';
    
    // Add title page if provided
    if (this.options.titlePage) {
      combined += this.generateTitlePage(this.options.titlePage);
      combined += '\n\n===\n\n'; // Fountain page break
    }
    
    for (const file of files) {
      const parsed = this.parse(file.content);
      combined += parsed + '\n\n';
    }
    
    return combined.trim();
  }

  /**
   * Remove YAML frontmatter (--- ... ---)
   */
  removeFrontmatter(content) {
    return content.replace(/^---[\s\S]*?---\s*/m, '');
  }

  /**
   * Convert markdown scene headings to Fountain format
   * ## INT. LOCATION - TIME -> INT. LOCATION - TIME
   * 
   * Fountain requires scene headings to start with INT, EXT, EST, INT./EXT, I/E
   * or be forced with a period prefix
   */
  convertSceneHeadings(content) {
    // Match ## followed by scene heading patterns
    const sceneHeadingPattern = /^##\s*((?:INT\.|EXT\.|EST\.|INT\.\/EXT\.|I\/E|INTERCUT|MONTAGE|FLASHBACK)[\s\S]*?)$/gim;
    
    return content.replace(sceneHeadingPattern, (match, heading) => {
      // Fountain scene headings are just the text, uppercase
      return '\n' + heading.trim().toUpperCase() + '\n';
    });
  }

  /**
   * Convert character cues from markdown to Fountain
   * ## CHARACTER -> CHARACTER (centered, triggers dialogue mode)
   * ## CHARACTER (CONT'D) -> CHARACTER (CONT'D)
   */
  convertCharacterCues(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a character cue (## followed by name, not a scene heading)
      const charMatch = line.match(/^##\s*([A-Z][A-Z0-9\s'.\-]*(?:\s*\([^)]+\))?)$/);
      
      if (charMatch) {
        const charName = charMatch[1].trim();
        
        // Skip if it's actually a scene heading
        if (this.isSceneHeading(charName)) {
          result.push(line);
          continue;
        }
        
        // Fountain character cues need to be uppercase and preceded by blank line
        // Add @ prefix to force character if needed
        result.push('');
        result.push('@' + charName);
      } else {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }

  /**
   * Check if text is a scene heading
   */
  isSceneHeading(text) {
    const upper = text.toUpperCase();
    return /^(INT\.|EXT\.|EST\.|INT\.\/EXT\.|I\/E|INTERCUT|MONTAGE|FLASHBACK)/.test(upper);
  }

  /**
   * Clean remaining markdown artifacts
   */
  cleanMarkdown(content) {
    let cleaned = content;
    
    // Remove # headers that aren't scene/character
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    
    // Remove horizontal rules
    cleaned = cleaned.replace(/^-{3,}\s*$/gm, '');
    cleaned = cleaned.replace(/^\*{3,}\s*$/gm, '');
    
    // Remove bold markers
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Remove italic markers
    cleaned = cleaned.replace(/\*([^*\n]+)\*/g, '$1');
    
    // Remove inline code
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Remove blockquotes
    cleaned = cleaned.replace(/^>\s*/gm, '');
    
    return cleaned;
  }

  /**
   * Normalize spacing for Fountain format
   */
  normalizeSpacing(content) {
    let normalized = content;
    
    // Collapse multiple blank lines to max 2
    normalized = normalized.replace(/\n{4,}/g, '\n\n\n');
    
    // Ensure scene headings have blank line before
    normalized = normalized.replace(/([^\n])\n((?:INT\.|EXT\.|EST\.))/gi, '$1\n\n$2');
    
    // Trim each line
    normalized = normalized.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Trim overall
    normalized = normalized.trim();
    
    return normalized;
  }

  /**
   * Generate Fountain title page
   */
  generateTitlePage(info) {
    const parts = [];
    
    if (info.title) parts.push(`Title: ${info.title}`);
    if (info.credit) parts.push(`Credit: ${info.credit}`);
    if (info.author) parts.push(`Author: ${info.author}`);
    if (info.source) parts.push(`Source: ${info.source}`);
    if (info.draftDate) parts.push(`Draft date: ${info.draftDate}`);
    if (info.contact) parts.push(`Contact: ${info.contact}`);
    
    return parts.join('\n');
  }
}

module.exports = { MarkdownToFountainParser };
