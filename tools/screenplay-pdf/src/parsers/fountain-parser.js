/**
 * Fountain Parser
 * 
 * Parses Fountain screenplay format into structured tokens
 * for rendering to HTML/PDF.
 * 
 * Fountain spec: https://fountain.io/syntax
 */

const TokenType = {
  TITLE_PAGE: 'title_page',
  SCENE_HEADING: 'scene_heading',
  ACTION: 'action',
  CHARACTER: 'character',
  PARENTHETICAL: 'parenthetical',
  DIALOGUE: 'dialogue',
  TRANSITION: 'transition',
  CENTERED: 'centered',
  PAGE_BREAK: 'page_break',
  SECTION: 'section',
  SYNOPSIS: 'synopsis',
  NOTE: 'note',
  BONEYARD: 'boneyard',
  BLANK: 'blank'
};

class FountainParser {
  constructor(options = {}) {
    this.options = {
      includeNotes: false,
      includeSynopsis: false,
      ...options
    };
  }

  /**
   * Parse Fountain text into tokens
   */
  parse(fountain) {
    const tokens = [];
    const lines = fountain.split('\n');
    
    let i = 0;
    let inDialogue = false;
    let lastCharacter = null;
    
    // Check for title page
    const titlePageEnd = this.findTitlePageEnd(lines);
    if (titlePageEnd > 0) {
      tokens.push({
        type: TokenType.TITLE_PAGE,
        content: this.parseTitlePage(lines.slice(0, titlePageEnd))
      });
      i = titlePageEnd;
    }
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      const nextLine = lines[i + 1]?.trim() || '';
      const prevLine = lines[i - 1]?.trim() || '';
      
      // Blank line
      if (trimmed === '') {
        inDialogue = false;
        tokens.push({ type: TokenType.BLANK });
        i++;
        continue;
      }
      
      // Page break (===)
      if (/^={3,}$/.test(trimmed)) {
        tokens.push({ type: TokenType.PAGE_BREAK });
        i++;
        continue;
      }
      
      // Scene heading
      if (this.isSceneHeading(trimmed, prevLine)) {
        inDialogue = false;
        tokens.push({
          type: TokenType.SCENE_HEADING,
          content: this.cleanSceneHeading(trimmed)
        });
        i++;
        continue;
      }
      
      // Transition (TO:, FADE OUT., etc.)
      if (this.isTransition(trimmed, prevLine, nextLine)) {
        inDialogue = false;
        tokens.push({
          type: TokenType.TRANSITION,
          content: trimmed.replace(/^>/, '').trim()
        });
        i++;
        continue;
      }
      
      // Centered text (>text<)
      if (/^>.*<$/.test(trimmed)) {
        tokens.push({
          type: TokenType.CENTERED,
          content: trimmed.slice(1, -1).trim()
        });
        i++;
        continue;
      }
      
      // Character cue
      if (this.isCharacter(trimmed, prevLine, nextLine)) {
        inDialogue = true;
        lastCharacter = this.cleanCharacter(trimmed);
        tokens.push({
          type: TokenType.CHARACTER,
          content: lastCharacter
        });
        i++;
        continue;
      }
      
      // Parenthetical (inside dialogue)
      if (inDialogue && /^\(.*\)$/.test(trimmed)) {
        tokens.push({
          type: TokenType.PARENTHETICAL,
          content: trimmed
        });
        i++;
        continue;
      }
      
      // Dialogue (after character or parenthetical)
      if (inDialogue) {
        tokens.push({
          type: TokenType.DIALOGUE,
          content: trimmed
        });
        i++;
        continue;
      }
      
      // Section heading (# ## ###)
      const sectionMatch = trimmed.match(/^(#{1,6})\s*(.+)$/);
      if (sectionMatch) {
        tokens.push({
          type: TokenType.SECTION,
          level: sectionMatch[1].length,
          content: sectionMatch[2]
        });
        i++;
        continue;
      }
      
      // Synopsis (= text)
      if (trimmed.startsWith('=') && !trimmed.startsWith('==')) {
        if (this.options.includeSynopsis) {
          tokens.push({
            type: TokenType.SYNOPSIS,
            content: trimmed.slice(1).trim()
          });
        }
        i++;
        continue;
      }
      
      // Note ([[text]])
      const noteMatch = trimmed.match(/^\[\[(.+)\]\]$/);
      if (noteMatch) {
        if (this.options.includeNotes) {
          tokens.push({
            type: TokenType.NOTE,
            content: noteMatch[1]
          });
        }
        i++;
        continue;
      }
      
      // Default: Action
      tokens.push({
        type: TokenType.ACTION,
        content: line.replace(/^!/, '') // Remove forced action marker
      });
      i++;
    }
    
    return this.mergeConsecutive(tokens);
  }

  /**
   * Find where title page ends (first blank line or non-key:value line)
   */
  findTitlePageEnd(lines) {
    const titleKeys = ['title', 'credit', 'author', 'authors', 'source', 'draft date', 'contact', 'copyright', 'notes'];
    
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim().toLowerCase();
      
      if (line === '') {
        // Check if we've seen any title page content
        if (i > 0) return i + 1;
        return 0;
      }
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return 0;
      
      const key = line.slice(0, colonIndex).trim();
      if (!titleKeys.includes(key)) return 0;
    }
    
    return 0;
  }

  /**
   * Parse title page into object
   */
  parseTitlePage(lines) {
    const result = {};
    let currentKey = null;
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.slice(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
        result[currentKey] = line.slice(colonIndex + 1).trim();
      } else if (currentKey && line.trim()) {
        result[currentKey] += '\n' + line.trim();
      }
    }
    
    return result;
  }

  /**
   * Check if line is a scene heading
   */
  isSceneHeading(line, prevLine) {
    // Forced scene heading with .
    if (line.startsWith('.') && line.length > 1) return true;
    
    // Standard scene heading patterns
    const patterns = /^(INT|EXT|EST|INT\.\/EXT|I\/E|INTERCUT|MONTAGE|FLASHBACK)/i;
    
    // Must be preceded by blank line (or start of doc)
    if (prevLine !== '' && prevLine !== undefined) return false;
    
    return patterns.test(line);
  }

  /**
   * Clean scene heading (remove forced marker)
   */
  cleanSceneHeading(line) {
    return line.startsWith('.') ? line.slice(1) : line;
  }

  /**
   * Check if line is a character cue
   */
  isCharacter(line, prevLine, nextLine) {
    // Forced character with @
    if (line.startsWith('@')) return true;
    
    // Must be preceded by blank line
    if (prevLine !== '') return false;
    
    // Must be followed by non-blank (dialogue or parenthetical)
    if (nextLine === '') return false;
    
    // Must be mostly uppercase
    const letters = line.replace(/[^a-zA-Z]/g, '');
    const upperLetters = line.replace(/[^A-Z]/g, '');
    
    if (letters.length === 0) return false;
    if (upperLetters.length / letters.length < 0.8) return false;
    
    // Exclude things that look like transitions
    if (/TO:$/.test(line)) return false;
    
    return true;
  }

  /**
   * Clean character name (remove @ prefix and extensions in parens)
   */
  cleanCharacter(line) {
    let name = line.startsWith('@') ? line.slice(1) : line;
    return name.trim();
  }

  /**
   * Check if line is a transition
   */
  isTransition(line, prevLine, nextLine) {
    // Forced transition with >
    if (line.startsWith('>') && !line.endsWith('<')) return true;
    
    // Standard transitions end with TO: or are FADE OUT. etc.
    if (!/TO:$|FADE OUT\.|FADE TO:|CUT TO:|DISSOLVE TO:/i.test(line)) return false;
    
    // Must be preceded and followed by blank lines
    if (prevLine !== '' || nextLine !== '') return false;
    
    return true;
  }

  /**
   * Merge consecutive tokens of same type (for multi-line action/dialogue)
   */
  mergeConsecutive(tokens) {
    const merged = [];
    
    for (const token of tokens) {
      const last = merged[merged.length - 1];
      
      // Merge consecutive action lines
      if (token.type === TokenType.ACTION && last?.type === TokenType.ACTION) {
        last.content += '\n' + token.content;
        continue;
      }
      
      // Merge consecutive dialogue lines
      if (token.type === TokenType.DIALOGUE && last?.type === TokenType.DIALOGUE) {
        last.content += ' ' + token.content;
        continue;
      }
      
      merged.push(token);
    }
    
    return merged;
  }
}

module.exports = { FountainParser, TokenType };
