const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements
  // Names
  content = content.replace(/Money Spot/g, 'One Step Finance Care');
  content = content.replace(/MoneySpot/g, 'One Step Finance Care');
  content = content.replace(/moneyspotfintech\.com/gi, '1stepfinancecare.com');
  content = content.replace(/moneyspotfintech/gi, 'onestepfinancecare');
  content = content.replace(/moneyspot_official/gi, 'onestepfinancecare_official');
  content = content.replace(/moneyspot/gi, 'onestepfinancecare');

  // Emails
  content = content.replace(/support@onestepfinancecare\.in/gi, '1stepcreditcard@gmail.com');
  content = content.replace(/admin@onestepfinancecare\.com/gi, '1stepcreditcard@gmail.com');
  // just in case they were replaced from moneyspot to onestepfinancecare
  content = content.replace(/support@moneyspot\.in/gi, '1stepcreditcard@gmail.com');
  content = content.replace(/admin@moneyspotfintech\.com/gi, '1stepcreditcard@gmail.com');

  // Phones
  // Main phone was 9866440477
  content = content.replace(/9866440477/g, '9581611711');
  content = content.replace(/\+91 98664 40477/g, '+91 95816 11711');

  // Address
  const newAddress = '1-98-1 haritha palace near sonovison, rajivmarg, kadapa';
  content = content.replace(/MoneySpot Fintech Services, Kadapa, Andhra Pradesh/gi, newAddress);
  content = content.replace(/MoneySpot Fintech Services, Anantapur, Andhra Pradesh/gi, newAddress);
  content = content.replace(/MoneySpot Fintech Services, Bangalore, Karnataka/gi, newAddress);
  // since we replaced MoneySpot with One Step Finance Care earlier, we also check that
  content = content.replace(/One Step Finance Care Fintech Services, Kadapa, Andhra Pradesh/gi, newAddress);
  content = content.replace(/One Step Finance Care Fintech Services, Anantapur, Andhra Pradesh/gi, newAddress);
  content = content.replace(/One Step Finance Care Fintech Services, Bangalore, Karnataka/gi, newAddress);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.html') || fullPath.endsWith('.css') || fullPath.endsWith('.json')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
replaceInFile(path.join(__dirname, 'index.html'));
