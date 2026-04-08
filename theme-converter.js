const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-zinc-950': 'bg-background',
  'bg-zinc-900': 'bg-card',
  'border-zinc-800': 'border-border',
  'border-zinc-700': 'border-border',
  'text-zinc-50': 'text-foreground',
  'text-zinc-100': 'text-foreground',
  'text-zinc-300': 'text-muted-foreground',
  'text-zinc-400': 'text-muted-foreground',
  'text-zinc-500': 'text-muted-foreground',
  'bg-zinc-800': 'bg-muted',
  'ring-zinc-900': 'ring-card',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      for (const [oldClass, newClass] of Object.entries(replacements)) {
        content = content.split(oldClass).join(newClass);
      }
      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir('./src/components');
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');
for (const [oldClass, newClass] of Object.entries(replacements)) {
  appContent = appContent.split(oldClass).join(newClass);
}
fs.writeFileSync('./src/App.tsx', appContent);
