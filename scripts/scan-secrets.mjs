import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.codex-deploy',
  '.vercel',
  '.vercel-global',
  '.tmp',
  '.vite',
  '.claude',
  'dist',
  'node_modules',
  'reports',
]);

const ignoredFiles = new Set([
  'package-lock.json',
]);

const scannedExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.md',
  '.ps1',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yml',
  '.yaml',
]);

const secretPatterns = [
  [/sk-[A-Za-z0-9_-]{20,}/, 'OpenAI-style secret key'],
  [/ghp_[A-Za-z0-9_]{20,}/, 'GitHub personal access token'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'GitHub fine-grained token'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key'],
  [/xox[baprs]-[0-9A-Za-z-]{20,}/, 'Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'Private key block'],
  [/((api|secret|private|access)[_-]?key|token|password)\s*[:=]\s*['"][^'"\s]{16,}['"]/i, 'hard-coded credential assignment'],
];

const findings = [];

const shouldScanFile = (filePath) => {
  const base = path.basename(filePath);
  if (ignoredFiles.has(base)) return false;
  if (base.startsWith('.env') && base !== '.env.example' && base !== '.env.deploy.example') return false;
  return scannedExtensions.has(path.extname(base));
};

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) walk(path.join(directory, entry.name));
      continue;
    }

    if (!entry.isFile()) continue;

    const filePath = path.join(directory, entry.name);
    if (!shouldScanFile(filePath)) continue;

    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const [pattern, label] of secretPatterns) {
        if (pattern.test(line)) {
          findings.push({
            file: path.relative(root, filePath).replace(/\\/g, '/'),
            line: index + 1,
            label,
          });
        }
      }
    });
  }
};

walk(root);

if (findings.length) {
  console.error('Secret scan failed:');
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.label}`);
  }
  process.exit(1);
}

console.log('Secret scan passed.');
