import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const ROOT = process.cwd();

const OUTPUT_FILE = path.join(ROOT, 'docs/ai-context.generated.md');

function readFiles(pattern: string) {
  return globSync(pattern, { cwd: ROOT, absolute: true });
}

function safeRead(filePath: string) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function extractClassNames(content: string) {
  const classRegex = /class\s+([A-Za-z0-9_]+)/g;
  const matches = [];
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

function extractExports(content: string) {
  const exportRegex =
    /export\s+(class|const|function|interface)\s+([A-Za-z0-9_]+)/g;
  const results = [];

  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    results.push(`${match[1]} ${match[2]}`);
  }

  return results;
}

function buildSection(title: string, files: string[]) {
  let section = `\n## ${title}\n`;

  files.forEach((file) => {
    const rel = path.relative(ROOT, file);
    const content = safeRead(file);

    const exports = extractExports(content);
    const classes = extractClassNames(content);

    section += `\n### ${rel}\n`;

    if (exports.length) {
      section += `Exports:\n`;
      exports.forEach((e) => (section += `- ${e}\n`));
    }

    if (classes.length) {
      section += `Classes:\n`;
      classes.forEach((c) => (section += `- ${c}\n`));
    }
  });

  return section;
}

function generate() {
  const models = readFiles('src/models/**/*.ts');
  const services = readFiles('src/services/**/*.ts');
  const modules = readFiles('src/modules/**/*.ts');
  const queues = readFiles('src/queues/**/*.ts');

  let output = `# AI-VBD Generated Context\n`;
  output += `Generated: ${new Date().toISOString()}\n`;

  output += `\n---\n`;

  output += buildSection('MODELS', models);
  output += buildSection('SERVICES', services);
  output += buildSection('MODULES', modules);
  output += buildSection('QUEUES', queues);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log('AI Context generated at:', OUTPUT_FILE);
}

generate();
