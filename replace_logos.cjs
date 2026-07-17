const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace various logo imports with the new logo.png
  // The relative path depth depends on the file location.
  // For files in src/pages/ or src/components/ -> '../assets/logo.png'
  // For files in src/components/admin/ -> '../../assets/logo.png'
  
  // We can just regex replace the asset paths
  content = content.replace(/['"]([^'"]*\/assets\/icons png\/MS Logo\.png)['"]/g, (match, p1) => {
    return `'${p1.replace('/icons png/MS Logo.png', '/logo.png')}'`;
  });
  content = content.replace(/['"]([^'"]*\/assets\/icons png\/One Step Finance Care Logo\.png)['"]/g, (match, p1) => {
    return `'${p1.replace('/icons png/One Step Finance Care Logo.png', '/logo.png')}'`;
  });
  content = content.replace(/['"]([^'"]*\/assets\/icons png\/Full Logo\.png)['"]/g, (match, p1) => {
    return `'${p1.replace('/icons png/Full Logo.png', '/logo.png')}'`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if(!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
