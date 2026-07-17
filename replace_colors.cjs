const fs = require('fs');
const path = require('path');

const replacements = [
  // Purples -> Navys
  { regex: /#402070/gi, replace: '#0d1f3d' },
  { regex: /#2a1050/gi, replace: '#081427' },
  { regex: /#5c30a0/gi, replace: '#15315f' },
  { regex: /#1a0a2e/gi, replace: '#081427' },
  { regex: /rgba\(64,\s*32,\s*112,/gi, replace: 'rgba(13,31,61,' },
  { regex: /rgba\(60,\s*40,\s*120,/gi, replace: 'rgba(12,28,55,' },
  { regex: /rgba\(60,\s*20,\s*100,/gi, replace: 'rgba(12,28,55,' },

  // Crimsons -> Royal Blues
  { regex: /#c02040/gi, replace: '#1a365d' },
  { regex: /#e03060/gi, replace: '#254a7c' },
  { regex: /#8b0000/gi, replace: '#0f2240' },
  { regex: /rgba\(192,\s*32,\s*64,/gi, replace: 'rgba(26,54,93,' },
  { regex: /rgba\(180,\s*20,\s*60,/gi, replace: 'rgba(22,45,77,' },

  // Dark Backgrounds
  { regex: /#0c0620/gi, replace: '#050912' },
  { regex: /#180c38/gi, replace: '#0a1324' },
  { regex: /#0d0820/gi, replace: '#050912' },
  { regex: /#1a0a3d/gi, replace: '#0a1324' },
  { regex: /#2a0a28/gi, replace: '#081427' },
  { regex: /#0a0518/gi, replace: '#03050a' },
  { regex: /#110630/gi, replace: '#070d18' },
  { regex: /#160830/gi, replace: '#081020' },
  { regex: /#080416/gi, replace: '#04070d' },
  { regex: /rgba\(12,\s*6,\s*32,/gi, replace: 'rgba(5,9,18,' },
  { regex: /rgba\(20,\s*8,\s*50,/gi, replace: 'rgba(8,16,32,' },
  { regex: /rgba\(30,\s*12,\s*70,/gi, replace: 'rgba(12,24,48,' },
  { regex: /rgba\(10,\s*5,\s*30,/gi, replace: 'rgba(5,10,20,' },
  { regex: /rgba\(8,\s*4,\s*22,/gi, replace: 'rgba(4,8,16,' },
  { regex: /rgba\(13,\s*7,\s*30,/gi, replace: 'rgba(7,14,28,' },
  { regex: /rgba\(35,\s*12,\s*80,/gi, replace: 'rgba(14,28,56,' },
  { regex: /rgba\(12,\s*6,\s*28,/gi, replace: 'rgba(5,9,18,' },
  { regex: /rgba\(18,\s*8,\s*38,/gi, replace: 'rgba(8,16,32,' },
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
