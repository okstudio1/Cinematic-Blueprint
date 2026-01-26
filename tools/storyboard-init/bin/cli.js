#!/usr/bin/env node

/**
 * Storyboard Init CLI
 * 
 * A utility to scaffold Cinematic Blueprint storyboard projects.
 * Copy this entire `storyboard-init` folder to any repo to use.
 * 
 * Usage:
 *   node bin/cli.js init <project-name> [options]
 *   node bin/cli.js init my-documentary --output ./storyboards
 * 
 * For LLM Integration:
 *   See README.md for detailed instructions on how to use this tool.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function printHelp() {
  console.log(`
Storyboard Init - Scaffold Cinematic Blueprint projects

USAGE:
  node bin/cli.js init <project-name> [options]
  node bin/cli.js build [options]

COMMANDS:
  init <name>    Create a new storyboard project folder
  build          Build/copy the HTML tool to current directory
  help           Show this help message

OPTIONS:
  --output, -o   Output directory (default: current directory)
  --title, -t    Project title (default: project name)
  --template     Template to use: basic, documentary, narrative (default: basic)

EXAMPLES:
  # Create a new project in current directory
  node bin/cli.js init my-documentary

  # Create in specific location
  node bin/cli.js init my-film --output /path/to/projects

  # Use documentary template
  node bin/cli.js init andrea-interview --template documentary

  # Just copy the HTML tool to current directory
  node bin/cli.js build
`);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.json`);
  if (fs.existsSync(templatePath)) {
    return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  }
  
  // Default basic template
  return {
    version: "1.0",
    updated: new Date().toISOString(),
    projectName: "",
    description: "",
    acts: [
      { id: "act-1", name: "Act I: Setup", order: 0 },
      { id: "act-2", name: "Act II: Confrontation", order: 1 },
      { id: "act-3", name: "Act III: Resolution", order: 2 }
    ],
    cards: [
      {
        id: "beat-1",
        title: "Opening Image",
        description: "Establish the world and tone.",
        act: "act-1",
        status: "draft",
        subplot: "A-plot"
      },
      {
        id: "beat-2",
        title: "Inciting Incident",
        description: "Something disrupts the status quo.",
        act: "act-1",
        status: "draft",
        subplot: "A-plot"
      },
      {
        id: "beat-3",
        title: "Midpoint",
        description: "A major revelation or shift.",
        act: "act-2",
        status: "draft",
        subplot: "A-plot"
      },
      {
        id: "beat-4",
        title: "Climax",
        description: "Final confrontation.",
        act: "act-3",
        status: "draft",
        subplot: "A-plot"
      },
      {
        id: "beat-5",
        title: "Resolution",
        description: "The new equilibrium.",
        act: "act-3",
        status: "draft",
        subplot: "A-plot"
      }
    ],
    shots: []
  };
}

function createProjectReadme(projectName, title) {
  return `# ${title}

## Storyboard Project

Created with [Cinematic Blueprint](https://cinematicblueprint.com)

## Files

| File | Purpose |
|------|---------|
| \`cinematic-blueprint.html\` | Visual storyboard tool - open in browser |
| \`storyboard.json\` | Project data - load into the tool |
| \`images/\` | Reference images for storyboard |
| \`exports/\` | Exported versions |

## Quick Start

1. Open \`cinematic-blueprint.html\` in your browser
2. Click **Load** → Select \`storyboard.json\`
3. Switch between **Story Beats** and **Storyboard** views
4. Edit inline, drag to reorder
5. Click **Export** to save changes

## Usage Tips

- **Story Beats view**: Plan your narrative structure with acts and beats
- **Storyboard view**: Plan individual shots with camera, duration, description
- **Drag images** directly onto the storyboard to create shots
- **Right-click** for context menu options
- **Export** saves your work as JSON (reload anytime with Load)

## For LLMs

To modify this storyboard programmatically:
1. Read \`storyboard.json\` to understand current state
2. Edit the JSON directly following the schema
3. The HTML tool will load your changes on next refresh

See the storyboard-init README for schema documentation.
`;
}

function initProject(projectName, options = {}) {
  const outputDir = options.output || process.cwd();
  const title = options.title || projectName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const templateName = options.template || 'basic';
  
  const projectDir = path.join(outputDir, slugify(projectName));
  
  console.log(`\nCreating storyboard project: ${title}`);
  console.log(`Location: ${projectDir}\n`);
  
  // Create directory structure
  const dirs = [
    projectDir,
    path.join(projectDir, 'images'),
    path.join(projectDir, 'exports')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created: ${path.relative(outputDir, dir)}/`);
    }
  }
  
  // Copy HTML tool
  const htmlSource = path.join(TEMPLATES_DIR, 'cinematic-blueprint.html');
  const htmlDest = path.join(projectDir, 'cinematic-blueprint.html');
  
  if (fs.existsSync(htmlSource)) {
    fs.copyFileSync(htmlSource, htmlDest);
    console.log(`  Created: ${path.relative(outputDir, htmlDest)}`);
  } else {
    console.log(`  Warning: HTML template not found at ${htmlSource}`);
    console.log(`  Run this from the Cinematic Blueprint repo, or copy cinematic-blueprint.html to templates/`);
  }
  
  // Create storyboard.json from template
  const template = getTemplate(templateName);
  template.projectName = title;
  template.updated = new Date().toISOString();
  
  const jsonDest = path.join(projectDir, 'storyboard.json');
  fs.writeFileSync(jsonDest, JSON.stringify(template, null, 2));
  console.log(`  Created: ${path.relative(outputDir, jsonDest)}`);
  
  // Create README
  const readmeDest = path.join(projectDir, 'README.md');
  fs.writeFileSync(readmeDest, createProjectReadme(projectName, title));
  console.log(`  Created: ${path.relative(outputDir, readmeDest)}`);
  
  console.log(`
Done! To start:
  1. Open ${path.relative(process.cwd(), htmlDest)} in your browser
  2. Click Load → Select storyboard.json
  3. Start planning your project
`);
  
  return projectDir;
}

function buildHtml(options = {}) {
  const outputDir = options.output || process.cwd();
  const htmlSource = path.join(TEMPLATES_DIR, 'cinematic-blueprint.html');
  const htmlDest = path.join(outputDir, 'cinematic-blueprint.html');
  
  if (fs.existsSync(htmlSource)) {
    fs.copyFileSync(htmlSource, htmlDest);
    console.log(`Created: ${htmlDest}`);
  } else {
    console.error(`Error: HTML template not found at ${htmlSource}`);
    console.error(`Copy cinematic-blueprint.html to the templates/ folder first.`);
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

// Parse options
const options = {};
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--output' || args[i] === '-o') {
    options.output = args[++i];
  } else if (args[i] === '--title' || args[i] === '-t') {
    options.title = args[++i];
  } else if (args[i] === '--template') {
    options.template = args[++i];
  } else if (!args[i].startsWith('-')) {
    options.projectName = args[i];
  }
}

if (command === 'init') {
  const projectName = options.projectName || args[1];
  if (!projectName) {
    console.error('Error: Project name required');
    console.error('Usage: node bin/cli.js init <project-name>');
    process.exit(1);
  }
  initProject(projectName, options);
} else if (command === 'build') {
  buildHtml(options);
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
