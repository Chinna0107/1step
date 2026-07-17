const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/Money Spot/g, 'One Step Finance Care');
  content = content.replace(/MoneySpot/g, 'One Step Finance Care');
  content = content.replace(/moneyspotfintech\.com/gi, '1stepfinancecare.com');
  content = content.replace(/moneyspotfintech/gi, 'onestepfinancecare');
  content = content.replace(/moneyspot_official/gi, 'onestepfinancecare_official');
  content = content.replace(/moneyspot/gi, 'onestepfinancecare');

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
    } else {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, 'public'));
replaceInFile(path.join(__dirname, 'package.json'));
replaceInFile(path.join(__dirname, 'package-lock.json'));
